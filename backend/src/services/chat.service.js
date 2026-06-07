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
const getChatHistory = async (userId, otherUserId, { cursor, limit = 30 } = {}) => {
    const take = Math.min(Math.max(Number(limit) || 30, 1), 100);
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = messages.length > take;
    if (hasMore) messages.pop();
    return {
        data: messages.reverse(),
        nextCursor: hasMore ? messages[0]?.id || null : null,
    };
};

/**
 * Service: Get inbox list - kontak dari pesan & dari appointment aktif
 * Returns: { userId, name, avatarUrl, role, lastMessage, lastMessageAt, unreadCount }
 */
const getInboxList = async (userId) => {
    // 1. Cari user saat ini untuk tahu rolenya
    const me = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            student: { select: { id: true } },
            counselor: { select: { id: true } }
        }
    });

    // 2. Semua pesan yang dikirim/diterima user ini
    const allMessages = await prisma.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        orderBy: { createdAt: 'desc' },
    });

    // 3. Bangun map: pesan terakhir per kontak
    const latestMsgMap = new Map();
    for (const msg of allMessages) {
        const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (!latestMsgMap.has(contactId)) {
            latestMsgMap.set(contactId, msg);
        }
    }

    // 4. Tambah kontak dari appointment (agar inbox tidak kosong untuk user baru)
    let appointmentContactIds = [];
    if (me?.role === 'student' && me?.student) {
        const appts = await prisma.appointment.findMany({
            where: {
                studentId: me.student.id,
                status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] }
            },
            select: { counselor: { select: { userId: true } } },
            distinct: ['counselorId']
        });
        appointmentContactIds = appts.map(a => a.counselor.userId);
    } else if (me?.role === 'counselor' && me?.counselor) {
        const appts = await prisma.appointment.findMany({
            where: {
                counselorId: me.counselor.id,
                status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] }
            },
            select: { student: { select: { userId: true } } },
            distinct: ['studentId']
        });
        appointmentContactIds = appts.map(a => a.student.userId);
    }

    // 5. Gabungkan kontak unik
    const allContactIds = [...new Set([...latestMsgMap.keys(), ...appointmentContactIds])];
    if (allContactIds.length === 0) return [];

    // 6. Ambil info user kontak
    const contactUsers = await prisma.user.findMany({
        where: { id: { in: allContactIds } },
        select: {
            id: true,
            username: true,
            role: true,
            student: { select: { fullName: true, avatarUrl: true } },
            counselor: { select: { fullName: true, avatarUrl: true } },
        }
    });

    // 7. Hitung unread per pengirim
    const unreadCounts = await prisma.message.groupBy({
        by: ['senderId'],
        where: { receiverId: userId, isRead: false },
        _count: { id: true }
    });
    const unreadMap = new Map(unreadCounts.map(u => [u.senderId, u._count.id]));

    // 8. Bangun respons final
    const result = contactUsers.map(c => {
        const lastMsg = latestMsgMap.get(c.id);
        return {
            userId: c.id,
            name: c.role === 'student'
                ? (c.student?.fullName || c.username)
                : (c.counselor?.fullName || c.username),
            avatarUrl: c.role === 'student' ? c.student?.avatarUrl : c.counselor?.avatarUrl,
            role: c.role,
            lastMessage: lastMsg?.content || '',
            lastMessageAt: lastMsg?.createdAt || null,
            unreadCount: unreadMap.get(c.id) || 0,
        };
    });

    // Urutkan: ada pesan terakhir → atas
    return result.sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
    });
};

/**
 * Service: Mark all messages from a contact as read
 */
const markMessagesAsRead = async (userId, otherUserId) => {
    return await prisma.message.updateMany({
        where: { senderId: otherUserId, receiverId: userId, isRead: false },
        data: { isRead: true },
    });
};

module.exports = { sendMessage, getChatHistory, getInboxList, markMessagesAsRead };
