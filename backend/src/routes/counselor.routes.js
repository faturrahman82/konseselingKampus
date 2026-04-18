const express = require('express');
const router = express.Router();
const counselorController = require('../controllers/counselor.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { avatarUpload } = require('../middlewares/upload.middleware');

router.get('/', verifyToken, requireRole(['counselor']), (_req, res) => {
    res.json({
        success: true,
        message: 'Counselor routes OK',
        endpoints: ['GET /me', 'PATCH /me', 'POST /avatar'],
    });
});

/**
 * @swagger
 * tags:
 *   name: Counselor
 *   description: Manajemen profil konselor (Self)
 */

router.get('/me', verifyToken, requireRole(['counselor']), counselorController.getMyProfile);
router.patch('/me', verifyToken, requireRole(['counselor']), counselorController.updateProfile);
router.post('/avatar', verifyToken, requireRole(['counselor']), avatarUpload.single('avatar'), counselorController.uploadAvatar);

module.exports = router;
