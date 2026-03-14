const scheduleService = require('../services/schedule.service');

const createSchedule = async (req, res, next) => {
    try {
        const result = await scheduleService.createSchedule(req.user.userId, req.body);
        res.status(201).json({ success: true, message: 'Schedule created.', data: result });
    } catch (error) {
        next(error);
    }
};

const getAvailableSchedules = async (req, res, next) => {
    try {
        const { search, specialization, dateFilter } = req.query;
        const result = await scheduleService.getAvailableSchedules({ search, specialization, dateFilter });
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getMySchedules = async (req, res, next) => {
    try {
        const result = await scheduleService.getMySchedules(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const deleteSchedule = async (req, res, next) => {
    try {
        const result = await scheduleService.deleteSchedule(req.user.userId, req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { createSchedule, getAvailableSchedules, getMySchedules, deleteSchedule };
