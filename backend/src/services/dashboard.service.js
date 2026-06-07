const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

/**
 * Dashboard Data for Students
 */
const getStudentDashboard = async (userId) => {
    const student = await prisma.student.findUnique({
        where: { userId },
        include: {
            user: { select: { email: true, username: true } }
        }
    });

    if (!student) throw new AppError('Student profile not found.', 404);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0,0,0,0);
    const [totalSessions, sessionsThisMonth, upcomingAppointment, recentHistory, moodCount] = await Promise.all([
        prisma.appointment.count({ where: { studentId: student.id } }),
        prisma.appointment.count({
            where: { studentId: student.id, status: 'COMPLETED', appointmentDate: { gte: startOfMonth } }
        }),
        prisma.appointment.findFirst({
            where: { studentId: student.id, status: 'APPROVED', appointmentDate: { gte: startOfToday } },
            include: { counselor: { select: { fullName: true, specialization: true, avatarUrl: true } } },
            orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }]
        }),
        prisma.appointment.findMany({
            where: { studentId: student.id },
            include: { counselor: { select: { fullName: true, specialization: true } } },
            orderBy: { createdAt: 'desc' },
            take: 3
        }),
        prisma.moodLog.count({ where: { studentId: student.id, createdAt: { gte: today } } }),
    ]);
    const hasCheckedInToday = moodCount > 0;

    // 5. Smart AI Insight (Logic Sederhana)
    const getMentalHealthInsight = (score) => {
        if (score >= 80) return "Luar biasa! Pertahankan pola pikir positifmu. Kamu bisa mencoba fitur 'Bimbingan Karir' untuk rencana masa depan.";
        if (score >= 50) return "Kondisimu cukup stabil. Jangan lupa untuk istirahat sejenak di sela-sela tugas kuliah ya.";
        return "Sangat disarankan untuk segera menjadwalkan sesi konseling 'Mental Health'. Konselor kami siap membantumu.";
    };

    const smartInsight = getMentalHealthInsight(student.wellbeingScore);

    return {
        profile: {
            fullName: student.fullName,
            wellbeingScore: student.wellbeingScore,
            hasCheckedInToday,
            smartInsight
        },
        stats: {
            totalSessions,
            sessionsThisMonth
        },
        upcomingAppointment,
        recentHistory
    };
};

/**
 * Dashboard Data for Counselors
 */
const getCounselorDashboard = async (userId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId }
    });

    if (!counselor) throw new AppError('Counselor profile not found.', 404);

    const today = new Date();
    today.setHours(0,0,0,0);
    const [
        pendingCount, sessionsToday, uniqueStudents, pendingRequests,
        todaySchedule, urgentAlerts, completedAppts,
    ] = await Promise.all([
        prisma.appointment.count({ where: { counselorId: counselor.id, status: 'PENDING' } }),
        prisma.appointment.count({
            where: { counselorId: counselor.id, appointmentDate: today, status: 'APPROVED' }
        }),
        prisma.appointment.groupBy({ by: ['studentId'], where: { counselorId: counselor.id } }),
        prisma.appointment.findMany({
            where: { counselorId: counselor.id, status: 'PENDING' },
            include: { student: { select: { fullName: true, major: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
            take: 3
        }),
        prisma.appointment.findMany({
            where: { counselorId: counselor.id, appointmentDate: today, status: 'APPROVED' },
            include: { student: { select: { fullName: true, major: true } } },
            orderBy: { startTime: 'asc' }
        }),
        prisma.appointment.findMany({
            where: { counselorId: counselor.id, student: { wellbeingScore: { lt: 40 } } },
            include: { student: { select: { fullName: true, wellbeingScore: true, avatarUrl: true, id: true } } },
            distinct: ['studentId'],
            take: 5
        }),
        prisma.appointment.findMany({
            where: { counselorId: counselor.id, status: 'COMPLETED' },
            select: { startTime: true, endTime: true }
        }),
    ]);
    const counselingHours = Math.round(completedAppts.reduce((sum, a) => {
        try {
            const diff = (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / (1000 * 60 * 60);
            return sum + (diff > 0 ? diff : 1); // fallback 1 jam per sesi
        } catch { return sum + 1; }
    }, 0));

    return {
        metrics: {
            pendingRequests: pendingCount,
            sessionsToday: sessionsToday,
            totalStudents: uniqueStudents.length,
            counselingHours
        },
        pendingRequests,
        todaySchedule,
        urgentAlerts: urgentAlerts.map(a => a.student)
    };
};

/**
 * Dashboard Data for Admin
 */
const getAdminDashboard = async () => {
    const [totalStudents, activeCounselors, counselors] = await Promise.all([
        prisma.student.count(),
        prisma.counselor.count({ where: { isActive: true } }),
        prisma.counselor.findMany({
            include: {
                _count: { select: { appointments: { where: { status: 'APPROVED' } } } },
                user: { select: { email: true } }
            }
        }),
    ]);

    const counselorDirectory = counselors.map(c => ({
        id: c.id,
        fullName: c.fullName,
        email: c.user.email,
        specialization: c.specialization,
        status: c.isActive ? 'Aktif' : 'Non-Aktif',
        caseLoad: c._count.appointments
    }));

    return {
        globalStats: {
            totalStudents,
            activeCounselors,
            systemHealth: "99.9%"
        },
        counselorDirectory
    };
};

/**
 * Advanced Admin Reports & Analytics
 */
const getAdminAnalytics = async () => {
    // 1. Distribusi per Fakultas
    const facultyDistribution = await prisma.student.groupBy({
        by: ['faculty'],
        _avg: { wellbeingScore: true },
        _count: { id: true }
    });

    // 2. Rata-rata Skor per Jurusan
    const majorStats = await prisma.student.groupBy({
        by: ['major'],
        _avg: { wellbeingScore: true }
    });

    // 3. Peak Counseling Hours (Simulasi Agregasi Jam)
    const timeStats = await prisma.appointment.groupBy({
        by: ['startTime'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3
    });

    return {
        facultyDistribution,
        majorStats,
        peakHours: timeStats.map(t => ({
            time: t.startTime.toISOString().split('T')[1].substring(0, 5),
            sessionCount: t._count.id
        }))
    };
};

module.exports = { getStudentDashboard, getCounselorDashboard, getAdminDashboard, getAdminAnalytics };
