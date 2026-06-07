const prisma = require('../config/database');

/**
 * Service: Create a single notification
 */
const createNotification = async (userId, title, message) => {
    const notification = await prisma.notification.create({
        data: {
            userId,
            title,
            message,
        },
    });
    global.realtimeIo?.to(`user:${userId}`).emit('notification:new', notification);
    return notification;
};

/**
 * Service: Broadcast notification to all users (Admin Only)
 */
const broadcastNotification = async (title, message) => {
    const users = await prisma.user.findMany({ select: { id: true } });
    
    // Create notifications for all users in parallel
    const notifications = users.map(user => ({
        userId: user.id,
        title,
        message,
    }));

    return await prisma.notification.createMany({
        data: notifications
    });
};

/**
 * Service: Get user notifications
 */
const getUserNotifications = async (userId) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20 // Limit to latest 20
    });
};

/**
 * Service: Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
    const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId }
    });

    if (!notification) return null;

    return await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });
};

module.exports = { 
    createNotification, 
    broadcastNotification, 
    getUserNotifications, 
    markAsRead 
};
