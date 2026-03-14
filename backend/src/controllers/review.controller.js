const reviewService = require('../services/review.service');

const createReview = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const result = await reviewService.createReview(req.user.userId, appointmentId, req.body);
        res.status(201).json({ success: true, message: 'Review submitted. Thank you!', data: result });
    } catch (error) {
        next(error);
    }
};

const getCounselorReviews = async (req, res, next) => {
    try {
        const { counselorId } = req.params;
        const result = await reviewService.getCounselorReviews(counselorId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getMyReviews = async (req, res, next) => {
    try {
        const result = await reviewService.getMyReviews(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReview, getCounselorReviews, getMyReviews };
