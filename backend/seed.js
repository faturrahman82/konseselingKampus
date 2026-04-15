const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('12345678', 10);

  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@a.com',
      username: 'admin',
      password_hash: password,
      role: 'admin',
      admin: {
        create: {
          fullName: 'Sistem Superadmin',
          department: 'Pusat Manajemen'
        }
      }
    }
  });
  console.log('✅ Admin dibuat: admin@a.com | 12345678');

  // Counselor
  await prisma.user.create({
    data: {
      email: 'guru@a.com',
      username: 'guru',
      password_hash: password,
      role: 'counselor',
      counselor: {
        create: {
          fullName: 'Bapak Konselor Spesialis',
          specialization: 'Kesehatan Mental Universitas'
        }
      }
    }
  });
  console.log('✅ Konselor dibuat: guru@a.com | 12345678');

  // Student
  await prisma.user.create({
    data: {
      email: 'siswa@a.com',
      username: 'siswa',
      password_hash: password,
      role: 'student',
      student: {
        create: {
          fullName: 'Mahasiswa Baru',
          nim: 'MHS2026'
        }
      }
    }
  });
  console.log('✅ Mahasiswa dibuat: siswa@a.com | 12345678');
}

main()
  .catch(e => {
    console.error('❌ Gagal seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
