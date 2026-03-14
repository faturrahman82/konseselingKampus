const counselorService = require('../services/counselor.service');

const getMyProfile = async (req, res, next) => {
    try {
        const result = await counselorService.getMyProfile(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const result = await counselorService.updateMyProfile(req.user.userId, req.body);
        res.json({ success: true, message: 'Profile updated successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyProfile, updateProfile };
