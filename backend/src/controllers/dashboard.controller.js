const dashboardService = require('../services/dashboard.service');

const getStudentDashboard = async (req, res, next) => {
    try {
        const result = await dashboardService.getStudentDashboard(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getCounselorDashboard = async (req, res, next) => {
    try {
        const result = await dashboardService.getCounselorDashboard(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getAdminDashboard = async (req, res, next) => {
    try {
        const result = await dashboardService.getAdminDashboard();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStudentDashboard, getCounselorDashboard, getAdminDashboard };
