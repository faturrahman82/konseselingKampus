const chatService = require('../services/chat.service');

const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, content, fileUrl } = req.body;
        const result = await chatService.sendMessage(req.user.userId, receiverId, content, fileUrl);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getChatHistory = async (req, res, next) => {
    try {
        const { otherUserId } = req.params;
        const result = await chatService.getChatHistory(req.user.userId, otherUserId);
        res.json({ success: true, data: result });
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

module.exports = { sendMessage, getChatHistory, getInbox };
