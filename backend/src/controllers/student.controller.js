const studentService = require('../services/student.service');
const prisma = require('../config/database');
const path = require('path');

const updateProfile = async (req, res, next) => {
    try {
        const result = await studentService.updateMyProfile(req.user.userId, req.body);
        res.json({ success: true, message: 'Profile updated successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await studentService.changePassword(req.user.userId, currentPassword, newPassword);
        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        next(error);
    }
};

const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload.' });
        }

        let avatarUrl;
        if (req.file.filename) {
            // diskStorage (local dev)
            avatarUrl = `/uploads/avatars/${req.file.filename}`;
        } else if (req.file.buffer) {
            // memoryStorage (Vercel production)
            // Save to /tmp (the only writable dir on Vercel)
            const fs = require('fs');
            const tmpName = `avatar-${req.user.userId}-${Date.now()}${path.extname(req.file.originalname)}`;
            const tmpPath = path.join('/tmp', tmpName);
            fs.writeFileSync(tmpPath, req.file.buffer);
            avatarUrl = `/tmp/${tmpName}`;
        }

        await prisma.student.update({
            where: { userId: req.user.userId },
            data: { avatarUrl },
        });

        res.json({ success: true, message: 'Foto profil berhasil diperbarui.', data: { avatarUrl } });
    } catch (error) {
        next(error);
    }
};

module.exports = { updateProfile, changePassword, uploadAvatar };

