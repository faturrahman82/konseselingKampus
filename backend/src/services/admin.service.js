const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { AppError } = require('../utils/error.handler');
const emailService = require('./email.service');

/**
 * Register a new Counselor (Admin only)
 */
const createCounselor = async ({ email, username, password, fullName, specialization, experienceYears, bioDescription }) => {
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
        throw new AppError('Email or username already registered.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                username,
                password_hash: hashedPassword,
                role: 'counselor',
            },
        });

        const counselor = await tx.counselor.create({
            data: {
                userId: user.id,
                fullName,
                specialization,
                experienceYears: parseInt(experienceYears) || 0,
                bioDescription,
            },
        });

        return { user, counselor };
    });

    // Kirim email selamat datang + kredensial (non-blocking)
    emailService.sendWelcomeCounselorEmail(email, {
        fullName,
        username,
        password, // plain text sebelum di-hash
    }).catch(err => console.error('[EMAIL ERROR] Welcome counselor:', err.message));

    return result;
};

/**
 * Update Counselor Status or Data (Admin only)
 */
const updateCounselor = async (counselorId, data) => {
    const counselor = await prisma.counselor.findUnique({
        where: { id: counselorId }
    });

    if (!counselor) throw new AppError('Counselor not found.', 404);

    return await prisma.counselor.update({
        where: { id: counselorId },
        data: {
            fullName: data.fullName,
            specialization: data.specialization,
            experienceYears: data.experienceYears ? parseInt(data.experienceYears) : undefined,
            bioDescription: data.bioDescription,
            isActive: data.isActive,
        }
    });
};

/**
 * Delete Counselor (Admin only)
 */
const deleteCounselor = async (counselorId) => {
    const counselor = await prisma.counselor.findUnique({
        where: { id: counselorId }
    });

    if (!counselor) throw new AppError('Counselor not found.', 404);

    // Delete the user will cascade to counselor due to schema definition
    await prisma.user.delete({
        where: { id: counselor.userId }
    });

    return { message: 'Counselor deleted successfully.' };
};

/**
 * Get System Settings (Admin only)
 */
const getSettings = async () => {
    let settings = await prisma.systemSetting.findUnique({
        where: { id: 1 }
    });

    if (!settings) {
        // Jika belum ada, buat default
        settings = await prisma.systemSetting.create({
            data: { id: 1 }
        });
    }

    return settings;
};

/**
 * Update System Settings (Admin only)
 */
const updateSettings = async (data) => {
    return await prisma.systemSetting.upsert({
        where: { id: 1 },
        update: {
            universityName: data.universityName,
            supportEmail: data.supportEmail,
            autoApproveAppointments: data.autoApproveAppointments,
            emailNotifications: data.emailNotifications,
            counselorAlerts: data.counselorAlerts,
            twoFactorAuth: data.twoFactorAuth
        },
        create: {
            id: 1,
            universityName: data.universityName,
            supportEmail: data.supportEmail,
            autoApproveAppointments: data.autoApproveAppointments,
            emailNotifications: data.emailNotifications,
            counselorAlerts: data.counselorAlerts,
            twoFactorAuth: data.twoFactorAuth
        }
    });
};

module.exports = { createCounselor, updateCounselor, deleteCounselor, getSettings, updateSettings };
