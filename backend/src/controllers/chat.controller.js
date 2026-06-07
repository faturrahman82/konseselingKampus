const chatService = require('../services/chat.service');

const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, content, fileUrl } = req.body;
        const result = await chatService.sendMessage(req.user.userId, receiverId, content, fileUrl);
        req.app.get('io')?.to(`user:${receiverId}`).emit('message:new', result);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getChatHistory = async (req, res, next) => {
    try {
        const { otherUserId } = req.params;
        const result = await chatService.getChatHistory(req.user.userId, otherUserId, req.query);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const getInbox = async (req, res, next) => {
    try {
        const result = await chatService.getInboxList(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const markRead = async (req, res, next) => {
    try {
        await chatService.markMessagesAsRead(req.user.userId, req.params.otherUserId);
        req.app.get('io')?.to(`user:${req.params.otherUserId}`).emit('message:read', {
            readBy: req.user.userId,
        });
        res.json({ success: true });
    } catch (error) { next(error); }
};

module.exports = { sendMessage, getChatHistory, getInbox, markRead };
