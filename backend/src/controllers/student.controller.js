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
        const filename = req.file.filename;
        const avatarUrl = `/uploads/avatars/${filename}`;

        // Simpan URL ke database
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

