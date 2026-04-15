/**
 * Seed Script — UniCounsel
 * Membuat akun Admin dan Konselor untuk keperluan testing/demo
 *
 * Cara jalankan:
 *   node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Memulai proses seeding...\n');

  // ── 1. Admin ──────────────────────────────────────────────
  const adminEmail = 'admin@unicounsel.id';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log('⚠️  Admin sudah ada, dilewati.');
  } else {
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'admin_unicounsel',
        password_hash: adminHash,
        role: 'admin',
        admin: {
          create: {
            fullName: 'Administrator UniCounsel',
            department: 'Pusat Kesejahteraan Mahasiswa',
          },
        },
      },
    });
    console.log(`✅ Admin dibuat: ${admin.email}`);
  }

  // ── 2. Konselor 1: Dr. Sarah ───────────────────────────────
  const sarah_email = 'dr.sarah@unicounsel.id';
  const existingSarah = await prisma.user.findUnique({ where: { email: sarah_email } });

  if (existingSarah) {
    console.log('⚠️  Konselor dr.sarah sudah ada, dilewati.');
  } else {
    const sarahHash = await bcrypt.hash('Konselor@123', 10);
    const sarah = await prisma.user.create({
      data: {
        email: sarah_email,
        username: 'dr_sarah',
        password_hash: sarahHash,
        role: 'counselor',
        counselor: {
          create: {
            fullName: 'Dr. Sarah Rahmawati',
            specialization: 'Stres Akademik & Kecemasan',
            experienceYears: 5,
            bioDescription: 'Psikolog klinis berpengalaman dalam menangani stres akademik, kecemasan, dan masalah adaptasi mahasiswa baru. Pendekatan yang digunakan adalah CBT dan mindfulness.',
            isActive: true,
            autoApprove: true,
            minNoticeHours: 12,
            defaultMeetingLink: 'https://meet.google.com/abc-defg-hij',
            roomName: 'Ruang Konseling A',
          },
        },
      },
    });
    console.log(`✅ Konselor dibuat: ${sarah.email}`);
  }

  // ── 3. Konselor 2: Budi ────────────────────────────────────
  const budi_email = 'budi.santoso@unicounsel.id';
  const existingBudi = await prisma.user.findUnique({ where: { email: budi_email } });

  if (existingBudi) {
    console.log('⚠️  Konselor budi sudah ada, dilewati.');
  } else {
    const budiHash = await bcrypt.hash('Konselor@123', 10);
    const budi = await prisma.user.create({
      data: {
        email: budi_email,
        username: 'budi_konselor',
        password_hash: budiHash,
        role: 'counselor',
        counselor: {
          create: {
            fullName: 'Budi Santoso, M.Psi',
            specialization: 'Hubungan Sosial & Keluarga',
            experienceYears: 7,
            bioDescription: 'Konselor berpengalaman dalam menangani masalah hubungan sosial, konflik keluarga, dan penyesuaian diri di lingkungan kampus.',
            isActive: true,
            autoApprove: false,
            minNoticeHours: 24,
            defaultMeetingLink: 'https://zoom.us/j/1234567890',
            roomName: 'Ruang Konseling B',
          },
        },
      },
    });
    console.log(`✅ Konselor dibuat: ${budi.email}`);
  }

  // ── 4. Konselor 3: Ayu ─────────────────────────────────────
  const ayu_email = 'ayu.pratiwi@unicounsel.id';
  const existingAyu = await prisma.user.findUnique({ where: { email: ayu_email } });

  if (existingAyu) {
    console.log('⚠️  Konselor ayu sudah ada, dilewati.');
  } else {
    const ayuHash = await bcrypt.hash('Konselor@123', 10);
    const ayu = await prisma.user.create({
      data: {
        email: ayu_email,
        username: 'ayu_pratiwi',
        password_hash: ayuHash,
        role: 'counselor',
        counselor: {
          create: {
            fullName: 'Ayu Pratiwi, S.Psi',
            specialization: 'Depresi & Kesehatan Mental',
            experienceYears: 3,
            bioDescription: 'Konselor muda yang berspesialisasi dalam penanganan depresi ringan-sedang, burnout akademik, dan peningkatan self-esteem mahasiswa.',
            isActive: true,
            autoApprove: true,
            minNoticeHours: 6,
            defaultMeetingLink: 'https://meet.google.com/xyz-uvwx-yz',
            roomName: 'Ruang Konseling C',
          },
        },
      },
    });
    console.log(`✅ Konselor dibuat: ${ayu.email}`);
  }

  console.log('\n🎉 Seeding selesai!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Akun yang tersedia:');
  console.log('');
  console.log('👤 ADMIN');
  console.log('   Email    : admin@unicounsel.id');
  console.log('   Password : Admin@123');
  console.log('');
  console.log('🧑‍⚕️ KONSELOR 1');
  console.log('   Email    : dr.sarah@unicounsel.id');
  console.log('   Password : Konselor@123');
  console.log('   Spesialis: Stres Akademik & Kecemasan');
  console.log('');
  console.log('🧑‍⚕️ KONSELOR 2');
  console.log('   Email    : budi.santoso@unicounsel.id');
  console.log('   Password : Konselor@123');
  console.log('   Spesialis: Hubungan Sosial & Keluarga');
  console.log('');
  console.log('🧑‍⚕️ KONSELOR 3');
  console.log('   Email    : ayu.pratiwi@unicounsel.id');
  console.log('   Password : Konselor@123');
  console.log('   Spesialis: Depresi & Kesehatan Mental');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch(err => {
    console.error('❌ Seeding gagal:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
