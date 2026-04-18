const express = require('express');
const router = express.Router();
const counselorController = require('../controllers/counselor.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { avatarUpload } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Counselor
 *   description: Manajemen profil konselor (Self)
 */

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Counselor routes are available.',
        endpoints: [
            'GET /api/counselors/me (counselor)',
            'PATCH /api/counselors/me (counselor)',
            'POST /api/counselors/avatar (counselor)',
        ],
        note: 'All endpoints require Authorization: Bearer <token>.',
    });
});

router.get('/me', verifyToken, requireRole(['counselor']), counselorController.getMyProfile);
router.patch('/me', verifyToken, requireRole(['counselor']), counselorController.updateProfile);
router.post('/avatar', verifyToken, requireRole(['counselor']), avatarUpload.single('avatar'), counselorController.uploadAvatar);

module.exports = router;
