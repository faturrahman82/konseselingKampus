const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

/**
 * Service: Create a review for an appointment
 */
const createReview = async (studentUserId, appointmentId, { rating, comment }) => {
    // 1. Validasi rating 1-5
    if (rating < 1 || rating > 5) {
        throw new AppError('Rating must be between 1 and 5.', 400);
    }

    // 2. Pastikan appointment ada dan milik student ini, serta statusnya COMPLETED
    const appointment = await prisma.appointment.findFirst({
        where: { 
            id: appointmentId,
            student: { userId: studentUserId },
            status: 'COMPLETED'
        }
    });

    if (!appointment) {
        throw new AppError('Completed appointment not found or not authorized for review.', 404);
    }

    // 3. Pastikan belum pernah di-review
    const existingReview = await prisma.review.findUnique({
        where: { appointmentId }
    });

    if (existingReview) {
        throw new AppError('You have already reviewed this session.', 400);
    }

    // 4. Buat review dan update statistik rating konselor dalam transaksi
    return await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                appointmentId,
                studentId: appointment.studentId,
                counselorId: appointment.counselorId,
                rating,
                comment,
            }
        });

        // Hitung rata-rata rating baru untuk konselor
        const stats = await tx.review.aggregate({
            where: { counselorId: appointment.counselorId },
            _avg: { rating: true },
            _count: { id: true }
        });

        await tx.counselor.update({
            where: { id: appointment.counselorId },
            data: {
                averageRating: stats._avg.rating || 0,
                totalReviews: stats._count.id || 0
            }
        });

        return review;
    });
};

/**
 * Service: Get reviews for a counselor
 */
const getCounselorReviews = async (counselorId) => {
    return await prisma.review.findMany({
        where: { counselorId },
        include: {
            student: { select: { fullName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Service: Get Reviews for the logged in Counselor
 */
const getMyReviews = async (userId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId }
    });

    if (!counselor) throw new AppError('Counselor profile not found.', 404);

    return await prisma.review.findMany({
        where: { counselorId: counselor.id },
        include: {
            student: { select: { fullName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

module.exports = { createReview, getCounselorReviews, getMyReviews };
