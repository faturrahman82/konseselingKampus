const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

/**
 * Service: Send a message
 */
const sendMessage = async (senderId, receiverId, content, fileUrl = null) => {
    if ((!content || content.trim() === '') && !fileUrl) {
        throw new AppError('Message content or attachment is required.', 400);
    }

    return await prisma.message.create({
        data: {
            senderId,
            receiverId,
            content: content || '',
            fileUrl,
        },
        include: {
            sender: { select: { username: true } },
            receiver: { select: { username: true } },
        }
    });
};

/**
 * Service: Get chat history with a specific user
 */
const getChatHistory = async (userId, otherUserId) => {
    return await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        },
        orderBy: { createdAt: 'asc' },
    });
};

/**
 * Service: Get list of users the current user has chatted with (Inbox list)
 */
const getInboxList = async (userId) => {
    // This is a simplified version. For a real app, you'd want to aggregate the latest message.
    const sentTo = await prisma.message.findMany({
        where: { senderId: userId },
        select: { receiverId: true },
        distinct: ['receiverId'],
    });

    const receivedFrom = await prisma.message.findMany({
        where: { receiverId: userId },
        select: { senderId: true },
        distinct: ['senderId'],
    });

    const contactIds = [...new Set([
        ...sentTo.map(m => m.receiverId),
        ...receivedFrom.map(m => m.senderId)
    ])];

    const contacts = await prisma.user.findMany({
        where: { id: { in: contactIds } },
        select: {
            id: true,
            username: true,
            role: true,
            student: { select: { fullName: true, avatarUrl: true } },
            counselor: { select: { fullName: true, avatarUrl: true } },
        }
    });

    return contacts.map(c => ({
        id: c.id,
        username: c.username,
        role: c.role,
        fullName: c.role === 'student' ? c.student?.fullName : c.counselor?.fullName,
        avatarUrl: c.role === 'student' ? c.student?.avatarUrl : c.counselor?.avatarUrl,
    }));
};

module.exports = { sendMessage, getChatHistory, getInboxList };
