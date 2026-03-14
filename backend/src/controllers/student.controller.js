const studentService = require('../services/student.service');

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

module.exports = { updateProfile, changePassword };
