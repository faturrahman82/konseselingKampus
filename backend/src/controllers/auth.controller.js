const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ success: true, message: 'Account created successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.json({ success: true, message: 'Login successful.', data: result });
    } catch (error) {
        next(error);
    }
};

const completeProfile = async (req, res, next) => {
    try {
        const result = await authService.completeProfile(req.user.userId, req.body);
        res.json({ success: true, message: 'Profile updated successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const result = await authService.getMe(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.json({ success: true, message: result.message, data: { resetLink: result.resetLink } });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const result = await authService.resetPassword(token, newPassword);
        res.json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, completeProfile, getMe, forgotPassword, resetPassword };
