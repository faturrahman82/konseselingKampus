const wellbeingService = require('../services/wellbeing.service');

const getMyStatus = async (req, res, next) => {
    try {
        const result = await wellbeingService.getStudentWellbeingStatus(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const checkIn = async (req, res, next) => {
    try {
        const { moodValue } = req.body;
        const result = await wellbeingService.checkInMood(req.user.userId, moodValue);
        res.json({ success: true, message: result.message, current_score: result.new_score });
    } catch (error) {
        next(error);
    }
};

const getHistory = async (req, res, next) => {
    try {
        const result = await wellbeingService.getMoodHistory(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyStatus, checkIn, getHistory };
