const reportService = require('../services/report.service');

const generateReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await reportService.generateReport({ startDate, endDate });
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { generateReport };
