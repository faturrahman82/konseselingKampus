const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

/**
 * Service: Generate Laporan Admin
 * Mengambil data appointments COMPLETED berdasarkan rentang tanggal
 */
const generateReport = async ({ startDate, endDate }) => {
    if (!startDate || !endDate) {
        throw new AppError('startDate and endDate are required.', 400);
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            status: 'COMPLETED',
            appointmentDate: {
                gte: new Date(startDate),
                lte: new Date(endDate),
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

    // Ringkasan statistik
    const summary = {
        totalSessions: appointments.length,
        dateRange: { startDate, endDate },
        byType: {
            online: appointments.filter((a) => a.counselingType === 'online').length,
            offline: appointments.filter((a) => a.counselingType === 'offline').length,
        },
        byCounselor: {},
        byFaculty: {},
    };

    appointments.forEach((a) => {
        // Hitung per konselor
        const counselorName = a.counselor.fullName;
        summary.byCounselor[counselorName] = (summary.byCounselor[counselorName] || 0) + 1;

        // Hitung per fakultas
        const faculty = a.student.faculty;
        summary.byFaculty[faculty] = (summary.byFaculty[faculty] || 0) + 1;
    });

    return { summary, appointments };
};

module.exports = { generateReport };
