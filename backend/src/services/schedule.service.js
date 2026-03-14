const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

/**
 * Service: Tambah Jadwal Konselor (dengan validasi bentrok waktu)
 */
const createSchedule = async (counselorUserId, { availableDate, startTime, endTime }) => {
    // Cari profil counselor berdasarkan userId
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    // Cek bentrok jadwal pada tanggal yang sama
    const conflicting = await prisma.counselorSchedule.findFirst({
        where: {
            counselorId: counselor.id,
            availableDate: new Date(availableDate),
            OR: [
                {
                    startTime: { lte: new Date(`1970-01-01T${endTime}`) },
                    endTime: { gte: new Date(`1970-01-01T${startTime}`) },
                },
            ],
        },
    });

    if (conflicting) {
        throw new AppError('Schedule conflict: You already have a schedule at this time.', 409);
    }

    const schedule = await prisma.counselorSchedule.create({
        data: {
            counselorId: counselor.id,
            availableDate: new Date(availableDate),
            startTime: new Date(`1970-01-01T${startTime}`),
            endTime: new Date(`1970-01-01T${endTime}`),
        },
    });

    return schedule;
};

/**
 * Service: Ambil semua jadwal kosong dengan Filter & Search (untuk mahasiswa)
 */
const getAvailableSchedules = async ({ search, specialization, dateFilter }) => {
    // Build filter query
    const where = {
        isBooked: false,
        availableDate: { gte: new Date() } // Hanya hari ini ke depan
    };

    if (specialization) {
        where.counselor = { specialization: specialization };
    }

    if (search) {
        where.counselor = {
            ...where.counselor,
            OR: [
                { fullName: { contains: search } },
                { specialization: { contains: search } }
            ]
        };
    }

    // Ambil semua slot yang cocok
    const slots = await prisma.counselorSchedule.findMany({
        where: where,
        include: {
            counselor: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true,
                    avatarUrl: true,
                    bioDescription: true
                }
            }
        },
        orderBy: { availableDate: 'asc' }
    });

    // Kelompokkan slot berdasarkan Konselor (untuk View Card di UI)
    const grouped = slots.reduce((acc, slot) => {
        const cId = slot.counselorId;
        if (!acc[cId]) {
            acc[cId] = {
                ...slot.counselor,
                availableSlots: []
            };
        }
        acc[cId].availableSlots.push({
            id: slot.id,
            date: slot.availableDate,
            startTime: slot.startTime,
            endTime: slot.endTime
        });
        return acc;
    }, {});

    return Object.values(grouped);
};

/**
 * Service: Ambil jadwal milik konselor yang sedang login
 */
const getMySchedules = async (counselorUserId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    const schedules = await prisma.counselorSchedule.findMany({
        where: { counselorId: counselor.id },
        orderBy: { availableDate: 'asc' },
    });

    return schedules;
};

/**
 * Service: Hapus jadwal konselor
 */
const deleteSchedule = async (counselorUserId, scheduleId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    const schedule = await prisma.counselorSchedule.findFirst({
        where: { id: scheduleId, counselorId: counselor.id },
    });

    if (!schedule) {
        throw new AppError('Schedule not found or not authorized.', 404);
    }

    if (schedule.isBooked) {
        throw new AppError('Cannot delete a booked schedule.', 400);
    }

    await prisma.counselorSchedule.delete({ where: { id: scheduleId } });
    return { message: 'Schedule deleted successfully.' };
};

module.exports = { createSchedule, getAvailableSchedules, getMySchedules, deleteSchedule };
