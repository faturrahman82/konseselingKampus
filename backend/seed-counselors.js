const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Konselor@123', 10);

  const counselors = [
    {
      email: 'dr.sarah@unicounsel.id',
      username: 'drsarah',
      fullName: 'Dr. Sarah Rahmawati',
      specialization: 'Stres Akademik & Kecemasan',
      experienceYears: 5,
      autoApprove: true,
      minNoticeHours: 12,
      defaultMeetingLink: 'https://meet.google.com/abc-defg-hij',
      roomName: 'Ruang Konseling A'
    },
    {
      email: 'budi.santoso@unicounsel.id',
      username: 'budisantoso',
      fullName: 'Budi Santoso, M.Psi',
      specialization: 'Hubungan Sosial & Keluarga',
      experienceYears: 7,
      autoApprove: false,
      minNoticeHours: 24,
      defaultMeetingLink: 'https://zoom.us/j/1234567890',
      roomName: 'Ruang Konseling B'
    },
    {
      email: 'ayu.pratiwi@unicounsel.id',
      username: 'ayupratiwi',
      fullName: 'Ayu Pratiwi, S.Psi',
      specialization: 'Depresi & Kesehatan Mental',
      experienceYears: 3,
      autoApprove: true,
      minNoticeHours: 6,
      defaultMeetingLink: 'https://meet.google.com/xyz-uvwx-yz',
      roomName: 'Ruang Konseling C'
    }
  ];

  for (const c of counselors) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {
        username: c.username,
        password_hash: password,
        role: 'counselor',
        counselor: {
          upsert: {
            create: {
              fullName: c.fullName,
              specialization: c.specialization,
              experienceYears: c.experienceYears,
              autoApprove: c.autoApprove,
              minNoticeHours: c.minNoticeHours,
              defaultMeetingLink: c.defaultMeetingLink,
              roomName: c.roomName,
            },
            update: {
              fullName: c.fullName,
              specialization: c.specialization,
              experienceYears: c.experienceYears,
              autoApprove: c.autoApprove,
              minNoticeHours: c.minNoticeHours,
              defaultMeetingLink: c.defaultMeetingLink,
              roomName: c.roomName,
            }
          }
        }
      },
      create: {
        email: c.email,
        username: c.username,
        password_hash: password,
        role: 'counselor',
        counselor: {
          create: {
            fullName: c.fullName,
            specialization: c.specialization,
            experienceYears: c.experienceYears,
            autoApprove: c.autoApprove,
            minNoticeHours: c.minNoticeHours,
            defaultMeetingLink: c.defaultMeetingLink,
            roomName: c.roomName,
          }
        }
      }
    });
    console.log(`✅ Konselor di-upsert: ${c.email} | ${c.fullName}`);
  }
}

main()
  .catch(e => {
    console.error('❌ Gagal seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
