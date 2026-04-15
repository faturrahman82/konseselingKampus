const counselorService = require('../services/counselor.service');
const prisma = require('../config/database');

const getMyProfile = async (req, res, next) => {
    try {
        const result = await counselorService.getMyProfile(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
    try {
        const result = await counselorService.updateMyProfile(req.user.userId, req.body);
        res.json({ success: true, message: 'Profile updated successfully.', data: result });
    } catch (error) { next(error); }
};

const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload.' });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await prisma.counselor.update({
            where: { userId: req.user.userId },
            data: { avatarUrl },
        });
        res.json({ success: true, message: 'Foto profil berhasil diperbarui.', data: { avatarUrl } });
    } catch (error) { next(error); }
};

module.exports = { getMyProfile, updateProfile, uploadAvatar };
