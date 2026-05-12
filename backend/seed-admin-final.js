const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@unicounsel.id';
  const username = 'admin_unicounsel';
  const password = await bcrypt.hash('Admin@123', 10);
  const fullName = 'Administrator UniCounsel';
  const department = 'Pusat Kesejahteraan Mahasiswa';

  const user = await prisma.user.upsert({
    where: { email: email },
    update: {
      username: username,
      password_hash: password,
      role: 'admin',
      admin: {
        upsert: {
          create: {
            fullName: fullName,
            department: department,
          },
          update: {
            fullName: fullName,
            department: department,
          }
        }
      }
    },
    create: {
      email: email,
      username: username,
      password_hash: password,
      role: 'admin',
      admin: {
        create: {
          fullName: fullName,
          department: department,
        }
      }
    }
  });

  console.log(`✅ Admin di-upsert: ${email} | ${fullName}`);
}

main()
  .catch(e => {
    console.error('❌ Gagal seed admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
