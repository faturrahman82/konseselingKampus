const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@email.com';
  const username = 'admin_utama';
  const password = '123456';

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('User with this email already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          username,
          password_hash: hashedPassword,
          role: 'admin'
        }
      });

      await tx.admin.create({
        data: {
          userId: user.id,
          fullName: 'Super Admin UniCounsel',
          department: 'IT Support'
        }
      });
    });

    console.log('SUCCESS: Admin account created!');
    console.log('Email: ' + email);
    console.log('Password: ' + password);
  } catch (error) {
    console.error('ERROR creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
