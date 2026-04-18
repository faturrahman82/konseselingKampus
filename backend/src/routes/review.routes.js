const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Ulasan dan Rating Konselor
 */

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Reviews routes are available.',
        endpoints: [
            'POST /api/reviews/:appointmentId (student)',
            'GET /api/reviews/counselor/:counselorId (public)',
            'GET /api/reviews/mine (counselor)',
        ],
    });
});

/**
 * @swagger
 * /api/reviews/{appointmentId}:
 *   post:
 *     summary: Berikan ulasan untuk sesi yang sudah selesai (Student Only)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 */
router.post('/:appointmentId', verifyToken, requireRole(['student']), reviewController.createReview);

/**
 * @swagger
 * /api/reviews/counselor/{counselorId}:
 *   get:
 *     summary: Ambil daftar ulasan untuk konselor tertentu
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: counselorId
 *         required: true
 */
router.get('/counselor/:counselorId', reviewController.getCounselorReviews);

/**
 * @swagger
 * /api/reviews/mine:
 *   get:
 *     summary: Ambil ulasan dari mahasiswa (Counselor Only)
 *     tags: [Reviews]
 */
router.get('/mine', verifyToken, requireRole(['counselor']), reviewController.getMyReviews);

module.exports = router;
