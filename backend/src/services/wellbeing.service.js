const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

/**
 * Ambil skor kesejahteraan & cek status check-in hari ini
 */
const getStudentWellbeingStatus = async (userId) => {
    const student = await prisma.student.findUnique({
        where: { userId },
        include: {
            moodLogs: {
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    }
                }
            }
        }
    });

    if (!student) throw new AppError('Student profile not found.', 404);

    return {
        current_wellbeing_score: student.wellbeingScore,
        has_checked_in_today: student.moodLogs.length > 0
    };
};

/**
 * Proses Daily Mood Check-in dengan DB Transaction
 */
const checkInMood = async (userId, moodValue) => {
    // 1. Validasi mood_value
    const allowedMoods = [4, 1, -2];
    if (!allowedMoods.includes(moodValue)) {
        throw new AppError('Invalid mood value. Use 4, 1, or -2.', 400);
    }

    const student = await prisma.student.findUnique({
        where: { userId }
    });
    if (!student) throw new AppError('Student profile not found.', 404);

    // 2. Cek apakah sudah check-in hari ini (YYYY-MM-DD)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingLog = await prisma.moodLog.findFirst({
        where: {
            studentId: student.id,
            createdAt: { gte: todayStart, lte: todayEnd }
        }
    });

    if (existingLog) {
        throw new AppError('Anda sudah melakukan check-in mood hari ini.', 400);
    }

    // 3. Jalankan Transaction
    const result = await prisma.$transaction(async (tx) => {
        // Simpan Log Mood
        const log = await tx.moodLog.create({
            data: {
                studentId: student.id,
                moodValue: moodValue
            }
        });

        // Hitung Skor Baru (Clamped between 0 and 100)
        let newScore = student.wellbeingScore + moodValue;
        if (newScore > 100) newScore = 100;
        if (newScore < 0) newScore = 0;

        // Update Skor di tabel Student
        await tx.student.update({
            where: { id: student.id },
            data: { wellbeingScore: newScore }
        });

        return { log, newScore };
    });

    return {
        message: 'Mood check-in successful.',
        new_score: result.newScore
    };
};

/**
 * Service: Get Mood History (Last 30 Days)
 */
const getMoodHistory = async (userId) => {
    const student = await prisma.student.findUnique({
        where: { userId },
    });

    if (!student) throw new AppError('Student profile not found.', 404);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.moodLog.findMany({
        where: {
            studentId: student.id,
            createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { createdAt: 'asc' },
        select: {
            moodValue: true,
            createdAt: true
        }
    });

    return logs;
};

module.exports = {
    getStudentWellbeingStatus,
    checkInMood,
    getMoodHistory
};
