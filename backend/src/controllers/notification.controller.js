const notificationService = require('../services/notification.service');

const getMyNotifications = async (req, res, next) => {
    try {
        const result = await notificationService.getUserNotifications(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const markRead = async (req, res, next) => {
    try {
        const result = await notificationService.markAsRead(req.params.id, req.user.userId);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }
        res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
        next(error);
    }
};

const broadcastNotif = async (req, res, next) => {
    try {
        const { title, message } = req.body;
        await notificationService.broadcastNotification(title, message);
        res.json({ success: true, message: 'Broadcast sent to all users.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyNotifications, markRead, broadcastNotif };
