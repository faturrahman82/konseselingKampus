const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

/**
 * Service: Generate Laporan Admin
 * Mengambil semua appointments berdasarkan rentang tanggal
 */
const generateReport = async ({ startDate, endDate }) => {
    if (!startDate || !endDate) {
        throw new AppError('startDate and endDate are required.', 400);
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
        where: {
            appointmentDate: {
                gte: start,
                lte: end,
            },
        },
        include: {
            student: {
                select: { fullName: true, nim: true, faculty: true, major: true },
            },
            counselor: {
                select: { fullName: true, specialization: true },
            },
            clinicalNote: {
                select: { diagnosisCategory: true, actionPlan: true },
            },
        },
        orderBy: { appointmentDate: 'asc' },
    });

    // Hitung ringkasan
    const completedSessions = appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelledSessions = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'REJECTED').length;
    const uniqueStudents = new Set(appointments.map(a => a.studentId)).size;
    const uniqueCounselors = new Set(appointments.map(a => a.counselorId)).size;

    const summary = {
        totalAppointments: appointments.length,
        completedSessions,
        cancelledSessions,
        uniqueStudents,
        uniqueCounselors,
    };

    // Map ke format yang dibutuhkan frontend
    const appointmentList = appointments.map(a => ({
        id: a.id,
        studentName: a.student?.fullName || '-',
        studentNim: a.student?.nim || '-',
        studentFaculty: a.student?.faculty || '-',
        studentMajor: a.student?.major || '-',
        counselorName: a.counselor?.fullName || '-',
        counselorSpecialization: a.counselor?.specialization || '-',
        appointmentDate: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        counselingType: a.counselingType || '-',
        diagnosisCategory: a.clinicalNote?.diagnosisCategory || '-',
        actionPlan: a.clinicalNote?.actionPlan || '-',
    }));

    return { summary, appointments: appointmentList };
};

module.exports = { generateReport };
