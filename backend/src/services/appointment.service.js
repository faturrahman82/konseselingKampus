const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');
const notificationService = require('./notification.service');

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

    // Ambil schedule & cek ketersediaan
    const schedule = await prisma.counselorSchedule.findUnique({
        where: { id: scheduleId },
        include: { counselor: true }
    });

    if (!schedule) {
        throw new AppError('Schedule not found.', 404);
    }

    if (schedule.isBooked) {
        throw new AppError('This schedule has already been booked.', 409);
    }

    // Buat appointment + update isBooked dalam 1 transaksi
    const result = await prisma.$transaction(async (tx) => {
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

        await tx.counselorSchedule.update({
            where: { id: scheduleId },
            data: { isBooked: true },
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
const updateAppointmentStatus = async (counselorUserId, appointmentId, { status }) => {
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
        PENDING: ['APPROVED', 'REJECTED'],
        APPROVED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[appointment.status] || [];
    if (!allowed.includes(status)) {
        throw new AppError(`Cannot change status from ${appointment.status} to ${status}.`, 400);
    }

    const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status },
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
        where: { studentId: student.id },
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
        where: { counselorId: counselor.id },
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
 * Service: Daftar Mahasiswa yang pernah ditangani (Counselor View)
 */
const getMyStudents = async (counselorUserId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    // Ambil semua mahasiswa yang pernah punya appointment dengan konselor ini
    const appointments = await prisma.appointment.findMany({
        where: { counselorId: counselor.id },
        select: {
            student: {
                select: { id: true, fullName: true, major: true, avatarUrl: true, wellbeingScore: true }
            }
        },
        distinct: ['studentId']
    });

    // Map data untuk FE dan tambahkan flag "isAtRisk"
    const results = appointments.map(a => ({
        ...a.student,
        isAtRisk: a.student.wellbeingScore < 40
    }));

    // Urutkan: Yang "isAtRisk" naik ke atas
    return results.sort((a, b) => (b.isAtRisk ? 1 : 0) - (a.isAtRisk ? 1 : 0));
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
                where: { counselorId: counselor.id },
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

module.exports = {
    createAppointment,
    updateAppointmentStatus,
    getStudentAppointments,
    getCounselorAppointments,
    addClinicalNote,
    getMyStudents,
    getStudentDetailForCounselor,
    cancelAppointmentByStudent,
};
