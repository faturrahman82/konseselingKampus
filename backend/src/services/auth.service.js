const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/error.handler');
const crypto = require('crypto');

/**
 * Service: Register Mahasiswa Baru (Step 1: Akun Dasar)
 */
const register = async ({ email, username, password, fullName }) => {
    // Cek apakah email/username sudah terdaftar
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
        throw new AppError('Email or username already registered.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat User + Student Profile dasar dalam 1 transaksi
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                username,
                password_hash: hashedPassword,
                role: 'student',
            },
        });

        const student = await tx.student.create({
            data: {
                userId: user.id,
                fullName,
            },
        });

        return { user, student };
    });

    const token = jwt.sign(
        { userId: result.user.id, role: result.user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
    );

    return { 
        token,
        user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
            role: result.user.role,
            profile: result.student
        }
    };
};

/**
 * Service: Lengkapi Profil Mahasiswa (Step 2: Data Akademik)
 */
const completeProfile = async (userId, { nim, faculty, major, semester, university, phoneNumber }) => {
    const student = await prisma.student.findUnique({
        where: { userId },
    });

    if (!student) {
        throw new AppError('Student profile not found.', 404);
    }

    const updatedStudent = await prisma.student.update({
        where: { userId },
        data: {
            nim,
            faculty,
            major,
            semester: semester ? parseInt(semester) : undefined,
            university,
            phoneNumber,
        },
    });

    return updatedStudent;
};

/**
 * Service: Mengambil data user yang sedang login
 */
const getMe = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            student: true,
            counselor: true,
            admin: true,
        },
    });

    if (!user) {
        throw new AppError('User not found.', 404);
    }

    // Ambil profil sesuai role
    let profile = null;
    if (user.role === 'student') profile = user.student;
    else if (user.role === 'counselor') profile = user.counselor;
    else if (user.role === 'admin') profile = user.admin;

    return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile,
    };
};

/**
 * Service: Login User (semua role)
 */
const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            student: true,
            counselor: true,
            admin: true,
        },
    });

    if (!user) {
        throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new AppError('Invalid email or password.', 401);
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
    );

    // Ambil profil sesuai role
    let profile = null;
    if (user.role === 'student') profile = user.student;
    else if (user.role === 'counselor') profile = user.counselor;
    else if (user.role === 'admin') profile = user.admin;

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            profile,
        },
    };
};

/**
 * Service: Request Reset Password (Forgot Password)
 */
const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError('No account found with that email address.', 404);
    }

    // Generate Token (32 bytes hex)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 jam dari sekarang

    await prisma.user.update({
        where: { id: user.id },
        data: {
            reset_token: resetToken,
            reset_token_expires: resetExpires,
        },
    });

    // Simulasi pengiriman email
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log(`\n[EMAIL SIMULATION] To: ${email}\nReset Link: ${resetLink}\n`);

    return { message: 'Reset link generated successfully.', resetLink };
};

/**
 * Service: Reset Password dengan Token
 */
const resetPassword = async (token, newPassword) => {
    const user = await prisma.user.findFirst({
        where: {
            reset_token: token,
            reset_token_expires: { gte: new Date() }, // Harus belum expired
        },
    });

    if (!user) {
        throw new AppError('Invalid or expired reset token.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password_hash: hashedPassword,
            reset_token: null,
            reset_token_expires: null,
        },
    });

    return { message: 'Password has been reset successfully.' };
};

module.exports = { register, login, completeProfile, getMe, forgotPassword, resetPassword };
