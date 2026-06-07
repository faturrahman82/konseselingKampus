const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Manajemen booking konsultasi
 */

// Simple ping for browser/manual check
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Appointments routes are available.',
        endpoints: [
            'POST /api/appointments (student)',
            'GET /api/appointments/student (student)',
            'GET /api/appointments/counselor (counselor)',
            'GET /api/appointments/my-students (counselor)',
            'GET /api/appointments/student/:studentId (counselor)',
            'PUT /api/appointments/:id/status (counselor)',
            'POST /api/appointments/:id/notes (counselor)',
            'PATCH /api/appointments/:id/meeting-link (counselor)',
            'DELETE /api/appointments/student-history/:id (student)',
            'DELETE /api/appointments/counselor-history/:id (counselor)',
            'DELETE /api/appointments/:id (student)',
        ],
        note: 'Most endpoints require Authorization: Bearer <token>.',
    });
});

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Booking jadwal konsultasi (Student Only)
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduleId, counselingType, topicOrReason]
 *             properties:
 *               scheduleId:
 *                 type: string
 *                 example: "uuid-schedule-id"
 *               counselingType:
 *                 type: string
 *                 enum: [online, offline]
 *                 example: online
 *               topicOrReason:
 *                 type: string
 *                 example: "Saya merasa cemas berlebihan menjelang ujian"
 *               meetingLink:
 *                 type: string
 *                 example: "https://meet.google.com/xxx"
 *     responses:
 *       201:
 *         description: Booking berhasil
 *       409:
 *         description: Jadwal sudah di-book
 */
router.post('/', verifyToken, requireRole(['student']), appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   put:
 *     summary: Ubah status appointment (Counselor Only)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED, COMPLETED, CANCELLED]
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: Status berhasil diubah
 *       400:
 *         description: Transisi status tidak valid
 */
router.put('/:id/status', verifyToken, requireRole(['counselor']), appointmentController.updateStatus);

/**
 * @swagger
 * /api/appointments/student:
 *   get:
 *     summary: Riwayat appointment mahasiswa yang login
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Daftar riwayat appointment
 */
router.get('/student', verifyToken, requireRole(['student']), appointmentController.getStudentAppointments);

/**
 * @swagger
 * /api/appointments/counselor:
 *   get:
 *     summary: Daftar permintaan masuk untuk konselor yang login
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Daftar permintaan appointment
 */
router.get('/counselor', verifyToken, requireRole(['counselor']), appointmentController.getCounselorAppointments);

/**
 * @swagger
 * /api/appointments/{id}/notes:
 *   post:
 *     summary: Tambah catatan klinis (Counselor Only, setelah COMPLETED)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [diagnosisCategory]
 *             properties:
 *               diagnosisCategory:
 *                 type: string
 *                 example: "Anxiety Disorder"
 *               privateNotes:
 *                 type: string
 *                 example: "Pasien menunjukkan tanda-tanda kecemasan berlebih"
 *               actionPlan:
 *                 type: string
 *                 example: "Sesi lanjutan minggu depan + teknik relaksasi"
 *     responses:
 *       201:
 *         description: Clinical note berhasil ditambahkan
 */
router.post('/:id/notes', verifyToken, requireRole(['counselor']), appointmentController.addClinicalNote);

/**
 * @swagger
 * /api/appointments/my-students:
 *   get:
 *     summary: Daftar mahasiswa yang pernah ditangani (Counselor Only)
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Daftar mahasiswa
 */
router.get('/my-students', verifyToken, requireRole(['counselor']), appointmentController.getMyStudents);

/**
 * @swagger
 * /api/appointments/student/{studentId}:
 *   get:
 *     summary: Detail profil mahasiswa (Counselor Only)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/student/:studentId', verifyToken, requireRole(['counselor']), appointmentController.getStudentDetail);

router.delete('/student-history/:id', verifyToken, requireRole(['student']), appointmentController.hideStudentHistory);

router.delete('/counselor-history/:id', verifyToken, requireRole(['counselor']), appointmentController.hideCounselorHistory);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Batalkan janji temu (Student Only)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/:id', verifyToken, requireRole(['student']), appointmentController.cancelMyAppointment);

/**
 * @swagger
 * /api/appointments/{id}/meeting-link:
 *   patch:
 *     summary: Update link rapat (Counselor Only, hanya untuk APPROVED)
 *     tags: [Appointments]
 */
router.patch('/:id/meeting-link', verifyToken, requireRole(['counselor']), appointmentController.updateMeetingLink);

module.exports = router;
