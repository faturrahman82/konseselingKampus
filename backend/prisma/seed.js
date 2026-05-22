/**
 * Seed Script - UniCounsel
 *
 * File ini hanya berisi DATA CONTOH untuk development/local testing.
 * Jangan menaruh akun production, email asli, password asli, atau link meeting asli
 * di file seed yang akan dipush ke repository publik.
 *
 * Cara menjalankan:
 *   cd backend
 *   node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'PasswordContoh123!';

const users = [
  {
    email: 'admin@example.com',
    username: 'admin_example',
    role: 'admin',
    profile: {
      fullName: 'Admin Contoh UniCounsel',
      department: 'Pusat Layanan Konseling',
    },
  },
  {
    email: 'konselor.akademik@example.com',
    username: 'konselor_akademik',
    role: 'counselor',
    profile: {
      fullName: 'Konselor Akademik Contoh',
      specialization: 'Stres Akademik',
      experienceYears: 5,
      bioDescription: 'Data contoh untuk kebutuhan pengujian fitur konselor.',
      isActive: true,
      autoApprove: true,
      minNoticeHours: 12,
      defaultMeetingLink: 'https://meet.example.com/konseling-akademik',
      roomName: 'Ruang Konseling Contoh A',
    },
  },
  {
    email: 'konselor.keluarga@example.com',
    username: 'konselor_keluarga',
    role: 'counselor',
    profile: {
      fullName: 'Konselor Sosial Contoh',
      specialization: 'Hubungan Sosial & Keluarga',
      experienceYears: 4,
      bioDescription: 'Data contoh untuk kebutuhan pengujian fitur jadwal dan appointment.',
      isActive: true,
      autoApprove: false,
      minNoticeHours: 24,
      defaultMeetingLink: 'https://meet.example.com/konseling-sosial',
      roomName: 'Ruang Konseling Contoh B',
    },
  },
  {
    email: 'mahasiswa@example.com',
    username: 'mahasiswa_example',
    role: 'student',
    profile: {
      fullName: 'Mahasiswa Contoh',
      nim: '0000000000',
      faculty: 'Fakultas Contoh',
      major: 'Program Studi Contoh',
      semester: 4,
      university: 'Universitas Contoh',
      phoneNumber: '080000000000',
      wellbeingScore: 66,
    },
  },
];

async function upsertUser(seedUser, passwordHash) {
  const baseData = {
    email: seedUser.email,
    username: seedUser.username,
    password_hash: passwordHash,
    role: seedUser.role,
  };

  if (seedUser.role === 'admin') {
    return prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        username: seedUser.username,
        role: seedUser.role,
        admin: { upsert: { create: seedUser.profile, update: seedUser.profile } },
      },
      create: {
        ...baseData,
        admin: { create: seedUser.profile },
      },
    });
  }

  if (seedUser.role === 'counselor') {
    return prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        username: seedUser.username,
        role: seedUser.role,
        counselor: { upsert: { create: seedUser.profile, update: seedUser.profile } },
      },
      create: {
        ...baseData,
        counselor: { create: seedUser.profile },
      },
    });
  }

  return prisma.user.upsert({
    where: { email: seedUser.email },
    update: {
      username: seedUser.username,
      role: seedUser.role,
      student: { upsert: { create: seedUser.profile, update: seedUser.profile } },
    },
    create: {
      ...baseData,
      student: { create: seedUser.profile },
    },
  });
}

async function main() {
  console.log('\nMemulai seed data contoh UniCounsel...\n');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const seedUser of users) {
    await upsertUser(seedUser, passwordHash);
    console.log(`Data contoh dibuat/diperbarui: ${seedUser.email} (${seedUser.role})`);
  }

  await prisma.systemSetting.upsert({
    where: { id: 1 },
    update: {
      universityName: 'UniCounsel Development',
      supportEmail: 'support@example.com',
    },
    create: {
      id: 1,
      universityName: 'UniCounsel Development',
      supportEmail: 'support@example.com',
    },
  });

  console.log('\nSeed selesai.');
  console.log('Gunakan akun contoh hanya untuk development/local testing.');
  console.log(`Password semua akun contoh: ${DEFAULT_PASSWORD}\n`);
}

main()
  .catch((error) => {
    console.error('Seed gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
