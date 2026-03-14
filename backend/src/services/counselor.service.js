const prisma = require('../config/database');
const { AppError } = require('../utils/error.handler');

/**
 * Get Counselor Profile (Self)
 */
const getMyProfile = async (userId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId },
        include: { user: { select: { email: true, username: true } } }
    });

    if (!counselor) throw new AppError('Counselor profile not found.', 404);

    return counselor;
};

/**
 * Update Counselor Profile (Self)
 */
const updateMyProfile = async (userId, data) => {
    const counselor = await prisma.counselor.findUnique({
        where: { userId }
    });

    if (!counselor) throw new AppError('Counselor profile not found.', 404);

    return await prisma.counselor.update({
        where: { userId },
        data: {
            fullName: data.fullName,
            specialization: data.specialization,
            bioDescription: data.bioDescription,
            avatarUrl: data.avatarUrl,
            autoApprove: data.autoApprove,
            minNoticeHours: data.minNoticeHours ? parseInt(data.minNoticeHours) : undefined,
            defaultMeetingLink: data.defaultMeetingLink,
        }
    });
};

module.exports = { getMyProfile, updateMyProfile };
