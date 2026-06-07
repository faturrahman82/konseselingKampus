const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');
const notificationService = require('./notification.service');
const emailService = require('./email.service');

/**
 * Service: Booking Appointment (Student)
 */
const createAppointment = async (studentUserId, { scheduleId, counselingType, topicOrReason, meetingLink }) => {
    const student = await prisma.student.findUnique({
        where: { userId: studentUserId },
    });

    if (!student) {
        throw new AppError('Student profile not found.', 404);
    }

    // Ambil schedule untuk detail appointment dan preferensi konselor.
    const schedule = await prisma.counselorSchedule.findUnique({
        where: { id: scheduleId },
        include: { counselor: true }
    });

    if (!schedule) {
        throw new AppError('Schedule not found.', 404);
    }

    // Klaim slot dan buat appointment secara atomik agar booking bersamaan aman.
    const result = await prisma.$transaction(async (tx) => {
        const claimed = await tx.counselorSchedule.updateMany({
            where: { id: scheduleId, isBooked: false },
            data: { isBooked: true },
        });
        if (claimed.count !== 1) {
            throw new AppError('Jadwal ini baru saja diambil mahasiswa lain.', 409);
        }
        // Tentukan status awal berdasarkan preferensi konselor
        const initialStatus = schedule.counselor.autoApprove ? 'APPROVED' : 'PENDING';
        
        // Tentukan link meeting jika online dan konselor punya default link
        const finalMeetingLink = (counselingType === 'online' && !meetingLink) 
            ? schedule.counselor.defaultMeetingLink 
            : meetingLink;

        const appointment = await tx.appointment.create({
            data: {
                studentId: student.id,
                counselorId: schedule.counselorId,
                scheduleId: schedule.id,
                appointmentDate: schedule.availableDate,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                counselingType,
                topicOrReason,
                meetingLink: finalMeetingLink,
                status: initialStatus,
            },
        });

        return appointment;
    });

    // Kirim notifikasi ke Konselor
    await notificationService.createNotification(
        schedule.counselor.userId,
        'Permintaan Konseling Baru',
        `Ada permintaan baru dari ${student.fullName} untuk tanggal ${schedule.availableDate.toISOString().split('T')[0]}.`
    );

    return result;
};

/**
 * Service: Update Status Appointment (Counselor)
 */
const updateAppointmentStatus = async (counselorUserId, appointmentId, { status, meetingLink }) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, counselorId: counselor.id },
        include: { student: true, counselor: true }
    });

    if (!appointment) {
        throw new AppError('Appointment not found or not authorized.', 404);
    }

    // Validasi transisi status yang valid
    const validTransitions = {
        PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
        APPROVED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[appointment.status] || [];
    if (!allowed.includes(status)) {
        throw new AppError(`Cannot change status from ${appointment.status} to ${status}.`, 400);
    }

    // Build update data — include meetingLink if provided
    const updateData = { status };
    if (meetingLink !== undefined && meetingLink !== null) {
        updateData.meetingLink = meetingLink.trim() || null;
    }

    const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: updateData,
    });

    // Kirim notifikasi ke Mahasiswa
    let notifTitle = 'Pembaruan Status Konseling';
    let notifMessage = `Status janji temu Anda dengan ${appointment.counselor.fullName} telah diubah menjadi ${status}.`;

    if (status === 'APPROVED') {
        notifMessage = `Janji temu Anda dengan ${appointment.counselor.fullName} telah DISETUJUI. Silakan cek detail jadwal.`;
    } else if (status === 'REJECTED') {
        notifMessage = `Maaf, janji temu Anda dengan ${appointment.counselor.fullName} DITOLAK. Silakan pilih jadwal lain.`;
    }

    await notificationService.createNotification(appointment.student.userId, notifTitle, notifMessage);

    // Kirim email ke mahasiswa (non-blocking)
    if (status === 'APPROVED' || status === 'REJECTED') {
        const studentUser = await prisma.user.findUnique({
            where: { id: appointment.student.userId },
            select: { email: true }
        });
        if (studentUser?.email) {
            emailService.sendAppointmentEmail(studentUser.email, status, {
                studentName: appointment.student.fullName,
                counselorName: appointment.counselor.fullName,
                appointmentDate: appointment.appointmentDate,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                meetingLink: updateData.meetingLink || appointment.meetingLink || null,
            }).catch(err => console.error('[EMAIL ERROR]', err.message));
        }
    }

    // Jika REJECTED atau CANCELLED, buka kembali slot jadwal
    if (status === 'REJECTED' || status === 'CANCELLED') {
        await prisma.counselorSchedule.update({
            where: { id: appointment.scheduleId },
            data: { isBooked: false },
        });
    }

    return updated;
};

/**
 * Service: Riwayat Appointment Mahasiswa
 */
const getStudentAppointments = async (studentUserId) => {
    const student = await prisma.student.findUnique({
        where: { userId: studentUserId },
    });

    if (!student) {
        throw new AppError('Student profile not found.', 404);
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            studentId: student.id,
            hiddenByStudentAt: null,
        },
        include: {
            counselor: {
                select: { fullName: true, specialization: true, avatarUrl: true },
            },
            clinicalNote: true,
        },
        orderBy: { appointmentDate: 'desc' },
    });

    return appointments;
};

/**
 * Service: Daftar Permintaan Masuk untuk Konselor
 */
const getCounselorAppointments = async (counselorUserId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            counselorId: counselor.id,
            hiddenByCounselorAt: null,
        },
        include: {
            student: {
                select: { fullName: true, nim: true, faculty: true, major: true, avatarUrl: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return appointments;
};

/**
 * Service: Tambah Clinical Note (Counselor, setelah sesi COMPLETED)
 */
const addClinicalNote = async (counselorUserId, appointmentId, { diagnosisCategory, privateNotes, actionPlan }) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, counselorId: counselor.id, status: 'COMPLETED' },
        include: { student: true }
    });

    if (!appointment) {
        throw new AppError('Appointment not found, not authorized, or not yet completed.', 404);
    }

    // Jalankan Transaction agar catatan tersimpan DAN status berubah secara bersamaan
    const note = await prisma.$transaction(async (tx) => {
        const newNote = await tx.clinicalNote.create({
            data: {
                appointmentId,
                counselorId: counselor.id,
                studentId: appointment.studentId,
                diagnosisCategory,
                privateNotes,
                actionPlan,
            },
        });

        // Update status appointment menjadi COMPLETED
        await tx.appointment.update({
            where: { id: appointmentId },
            data: { status: 'COMPLETED' },
        });

        return newNote;
    });

    // Kirim notifikasi ke Mahasiswa bahwa catatan sudah tersedia
    await notificationService.createNotification(
        appointment.student.userId,
        'Sesi Selesai & Catatan Tersedia',
        `Sesi Anda dengan ${counselor.fullName} telah selesai ditandai. Hasil konsultasi sudah dapat dilihat.`
    );

    return note;
};

/**
 * Service: Update Meeting Link (Counselor, untuk appointment APPROVED)
 */
const updateMeetingLink = async (counselorUserId, appointmentId, meetingLink) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });
    if (!counselor) throw new AppError('Counselor profile not found.', 404);

    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, counselorId: counselor.id },
    });
    if (!appointment) throw new AppError('Appointment not found or not authorized.', 404);
    if (appointment.status !== 'APPROVED') {
        throw new AppError('Meeting link can only be updated for APPROVED appointments.', 400);
    }
    if (!meetingLink || !meetingLink.trim().startsWith('http')) {
        throw new AppError('URL meeting link tidak valid.', 400);
    }

    return await prisma.appointment.update({
        where: { id: appointmentId },
        data: { meetingLink: meetingLink.trim() },
    });
};

/**
 * Service: Daftar Mahasiswa yang pernah ditangani (Counselor View)
 */
const getMyStudents = async (counselorUserId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    // Ambil semua appointment konselor ini (urut dari terbaru)
    const appointments = await prisma.appointment.findMany({
        where: { counselorId: counselor.id, hiddenByCounselorAt: null },
        include: {
            student: {
                select: {
                    id: true,
                    fullName: true,
                    nim: true,
                    major: true,
                    faculty: true,
                    avatarUrl: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Kelompokkan per mahasiswa: hitung total sesi & ambil status terakhir
    const studentMap = new Map();
    for (const appt of appointments) {
        const s = appt.student;
        if (!studentMap.has(s.id)) {
            studentMap.set(s.id, {
                id: s.id,
                fullName: s.fullName,
                nim: s.nim || '-',
                major: s.major || '-',
                faculty: s.faculty || '-',
                avatarUrl: s.avatarUrl,
                totalSessions: 0,
                lastSessionStatus: appt.status,  // status dari appointment terbaru
            });
        }
        studentMap.get(s.id).totalSessions++;
    }

    const results = Array.from(studentMap.values());

    // Urutkan: sesi aktif (PENDING/APPROVED) naik ke atas
    return results.sort((a, b) => {
        const isActive = (s) => s === 'PENDING' || s === 'APPROVED';
        return (isActive(b.lastSessionStatus) ? 1 : 0) - (isActive(a.lastSessionStatus) ? 1 : 0);
    });
};

/**
 * Service: Detail Mahasiswa (Counselor View)
 */
const getStudentDetailForCounselor = async (counselorUserId, studentId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            user: { select: { email: true } },
            appointments: {
                where: { counselorId: counselor.id, hiddenByCounselorAt: null },
                include: { clinicalNote: true },
                orderBy: { appointmentDate: 'desc' }
            }
        }
    });

    if (!student) {
        throw new AppError('Student not found.', 404);
    }

    return student;
};

/**
 * Service: Pembatalan Janji Temu (Oleh Mahasiswa)
 */
const cancelAppointmentByStudent = async (studentUserId, appointmentId) => {
    const student = await prisma.student.findUnique({
        where: { userId: studentUserId },
    });

    if (!student) {
        throw new AppError('Student profile not found.', 404);
    }

    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, studentId: student.id },
        include: { counselor: true }
    });

    if (!appointment) {
        throw new AppError('Appointment not found or not authorized.', 404);
    }

    // Hanya bisa batal jika PENDING atau APPROVED dan belum lewat waktu
    if (appointment.status === 'COMPLETED' || appointment.status === 'REJECTED' || appointment.status === 'CANCELLED') {
        throw new AppError(`Cannot cancel appointment with status ${appointment.status}.`, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
        // Update status menjadi CANCELLED
        const updated = await tx.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CANCELLED' },
        });

        // Buka kembali slot jadwal
        await tx.counselorSchedule.update({
            where: { id: appointment.scheduleId },
            data: { isBooked: false },
        });

        return updated;
    });

    // Kirim notifikasi ke Konselor bahwa mahasiswa membatalkan
    await notificationService.createNotification(
        appointment.counselor.userId,
        'Pembatalan Janji Temu',
        `Mahasiswa ${student.fullName} telah membatalkan janji temu pada tanggal ${appointment.appointmentDate.toISOString().split('T')[0]}.`
    );

    return result;
};

const hideStudentHistory = async (studentUserId, appointmentId) => {
    const student = await prisma.student.findUnique({
        where: { userId: studentUserId },
    });

    if (!student) {
        throw new AppError('Student profile not found.', 404);
    }

    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            studentId: student.id,
            status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
            hiddenByStudentAt: null,
        },
    });

    if (!appointment) {
        throw new AppError('Riwayat sesi tidak ditemukan atau belum dapat dihapus.', 404);
    }

    return prisma.appointment.update({
        where: { id: appointmentId },
        data: { hiddenByStudentAt: new Date() },
    });
};

const hideCounselorHistory = async (counselorUserId, appointmentId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            counselorId: counselor.id,
            status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
            hiddenByCounselorAt: null,
        },
    });

    if (!appointment) {
        throw new AppError('Riwayat sesi tidak ditemukan atau belum dapat dihapus.', 404);
    }

    return prisma.appointment.update({
        where: { id: appointmentId },
        data: { hiddenByCounselorAt: new Date() },
    });
};

module.exports = {
    createAppointment,
    updateAppointmentStatus,
    getStudentAppointments,
    getCounselorAppointments,
    addClinicalNote,
    getMyStudents,
    getStudentDetailForCounselor,
    cancelAppointmentByStudent,
    updateMeetingLink,
    hideStudentHistory,
    hideCounselorHistory,
};
