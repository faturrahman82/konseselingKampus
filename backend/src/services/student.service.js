const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { AppError } = require('../utils/error.handler');

/**
 * Service: Update Student Profile (Self)
 */
const updateMyProfile = async (userId, data) => {
    const student = await prisma.student.findUnique({
        where: { userId }
    });

    if (!student) throw new AppError('Student profile not found.', 404);

    return await prisma.student.update({
        where: { userId },
        data: {
            fullName: data.fullName,
            avatarUrl: data.avatarUrl,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            emailReminders: data.emailReminders,
            smsAlerts: data.smsAlerts,
        }
    });
};

/**
 * Service: Change Password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        throw new AppError('Current password incorrectly provided.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await prisma.user.update({
        where: { id: userId },
        data: { password_hash: hashedPassword }
    });
};

module.exports = { updateMyProfile, changePassword };
