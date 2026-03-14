const adminService = require('../services/admin.service');
const dashboardService = require('../services/dashboard.service');

const createCounselor = async (req, res, next) => {
    try {
        const result = await adminService.createCounselor(req.body);
        res.status(201).json({ success: true, message: 'Counselor registered successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

const updateCounselor = async (req, res, next) => {
    try {
        const result = await adminService.updateCounselor(req.params.id, req.body);
        res.json({ success: true, message: 'Counselor updated successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

const deleteCounselor = async (req, res, next) => {
    try {
        const result = await adminService.deleteCounselor(req.params.id);
        res.json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

const getSettings = async (req, res, next) => {
    try {
        const result = await adminService.getSettings();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        const result = await adminService.updateSettings(req.body);
        res.json({ success: true, message: 'Settings updated successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

const getAnalytics = async (req, res, next) => {
    try {
        const result = await dashboardService.getAdminAnalytics();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    createCounselor, 
    updateCounselor, 
    deleteCounselor, 
    getSettings, 
    updateSettings,
    getAnalytics
};
