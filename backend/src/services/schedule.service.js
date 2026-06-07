const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

const parseTime = (time) => {
    if (!time) return null;
    const normalized = time.length === 5 ? `${time}:00` : time;
    return new Date(`1970-01-01T${normalized}`);
};

const timeToMinutes = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
        return value.getHours() * 60 + value.getMinutes();
    }

    const str = String(value);
    const timePart = str.includes('T') ? str.split('T')[1] : str;
    const [hour, minute] = timePart.slice(0, 5).split(':').map(Number);

    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
};

const formatTimeLabel = (value) => {
    const minutes = timeToMinutes(value);
    if (minutes === null) return '-';

    const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
    const minute = String(minutes % 60).padStart(2, '0');
    return `${hour}.${minute}`;
};

const isScheduleBlocking = (schedule) => {
    if (!schedule.isBooked) return true;

    return schedule.appointments?.some((appointment) =>
        appointment.status === 'PENDING' || appointment.status === 'APPROVED'
    );
};

/**
 * Service: Tambah Jadwal Konselor (dengan validasi bentrok waktu)
 */
const createSchedule = async (counselorUserId, { availableDate, startTime, endTime }) => {
    const normalizedStart = parseTime(startTime);
    const normalizedEnd = parseTime(endTime);
    const scheduleDate = new Date(availableDate);

    if (!availableDate || !normalizedStart || !normalizedEnd) {
        throw new AppError('Tanggal, jam mulai, dan jam selesai wajib diisi.', 400);
    }

    if (normalizedStart >= normalizedEnd) {
        throw new AppError('Jam mulai harus lebih awal dari jam selesai.', 400);
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(scheduleDate);
    selectedDay.setHours(0, 0, 0, 0);

    if (selectedDay < today) {
        throw new AppError('Tidak dapat membuat jadwal pada tanggal yang sudah lewat.', 400);
    }

    if (selectedDay.getTime() === today.getTime()) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = timeToMinutes(normalizedStart);

        if (startMinutes <= currentMinutes) {
            throw new AppError('Jam mulai sudah lewat. Pilih jam yang lebih besar dari waktu sekarang.', 400);
        }
    }

    // Cari profil counselor berdasarkan userId
    const counselor = await prisma.counselor.findUnique({
        where: { userId: counselorUserId },
    });

    if (!counselor) {
        throw new AppError('Counselor profile not found.', 404);
    }

    const sameDaySchedules = await prisma.counselorSchedule.findMany({
        where: {
            counselorId: counselor.id,
            availableDate: scheduleDate,
        },
        include: {
            appointments: {
                select: {
                    status: true,
                },
            },
        },
    });

    const newStartMinutes = timeToMinutes(normalizedStart);
    const newEndMinutes = timeToMinutes(normalizedEnd);

    const conflicting = sameDaySchedules.filter(isScheduleBlocking).find((schedule) => {
        const oldStartMinutes = timeToMinutes(schedule.startTime);
        const oldEndMinutes = timeToMinutes(schedule.endTime);

        if (oldStartMinutes === null || oldEndMinutes === null) return false;
        return newStartMinutes < oldEndMinutes && newEndMinutes > oldStartMinutes;
    });

    if (conflicting) {
        throw new AppError(
            `Jadwal bentrok dengan slot ${formatTimeLabel(conflicting.startTime)} - ${formatTimeLabel(conflicting.endTime)}.`,
            409
        );
    }

    const schedule = await prisma.counselorSchedule.create({
        data: {
            counselorId: counselor.id,
            availableDate: scheduleDate,
            startTime: normalizedStart,
            endTime: normalizedEnd,
        },
    });

    return schedule;
};

/**
 * Service: Ambil semua jadwal kosong dengan Filter & Search (untuk mahasiswa)
 */
const getAvailableSchedules = async ({ search, specialization, dateFilter }) => {
    // Build filter query
    // Gunakan awal hari (midnight) agar slot HARI INI tetap tampil
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
        isBooked: false,
        availableDate: { gte: today } // Hari ini (dari midnight) ke depan
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
        include: {
            appointments: {
                select: {
                    id: true,
                    status: true,
                },
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { availableDate: 'asc' },
    });

    return schedules.filter(isScheduleBlocking);
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
