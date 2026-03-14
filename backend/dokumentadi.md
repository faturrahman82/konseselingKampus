DOKUMENTASI ARSITEKTUR BACKEND
Proyek: Sistem Informasi Booking Konsultasi Psikologi Online Kampus
Versi: 1.0
1. Teknologi Pendukung (Tech Stack)
Sistem Backend ini dibangun menggunakan arsitektur modern untuk memastikan kecepatan, keamanan, dan kemudahan dalam pengembangan tim.
•	Runtime & Framework: Node.js + Express.js
•	Bahasa Pemrograman: TypeScript (Untuk keamanan pengetikan data/Type Safety)
•	Database: MySQL
•	ORM (Object-Relational Mapping): Prisma ORM (Untuk manajemen database dan relasi tanpa SQL manual)
•	Keamanan: JWT (JSON Web Token) & Bcrypt (Password Hashing)
•	Dokumentasi API: Swagger UI (OpenAPI Specification)
________________________________________
2. Struktur Folder (Project Directory)
Proyek ini menggunakan pola arsitektur MVC (Model-View-Controller) yang disesuaikan untuk REST API.
codeText
backend-konseling/
├── prisma/
│   └── schema.prisma       # Definisi struktur database & relasi tabel
├── src/
│   ├── config/             
│   │   ├── database.ts     # Konfigurasi koneksi Prisma Client
│   │   └── swagger.ts      # Konfigurasi Swagger UI & JWT Bearer
│   ├── controllers/        # Logika bisnis utama (Proses CRUD, Cek Bentrok, dll)
│   ├── middlewares/        # Penjaga rute (Validasi JWT & Hak Akses Role)
│   ├── routes/             # Definisi URL API & Komentar Dokumentasi Swagger
│   ├── utils/              # Fungsi bantuan (Error handler, formatter tanggal)
│   └── index.ts            # Entry point server Express.js
├── .env                    # Variabel rahasia (Database URL, JWT Secret)
├── package.json
└── tsconfig.json           # Konfigurasi TypeScript
________________________________________
3. Skema Database (Prisma Schema)
Karena menggunakan Prisma ORM, kamu tidak perlu membuat tabel manual di MySQL (phpMyAdmin). Cukup tempelkan kode di bawah ini ke dalam file prisma/schema.prisma, lalu jalankan perintah npx prisma db push. Sistem akan otomatis membuat tabel beserta relasinya.
codePrisma
// file: prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// --- ENUMS ---
enum Role {
  student
  counselor
  admin
}

enum AppointmentStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
  CANCELLED
}

enum CounselingType {
  online
  offline
}

// --- TABEL AUTH & PENGGUNA ---
model User {
  id            String   @id @default(uuid()) @db.Char(36)
  email         String   @unique @db.VarChar(100)
  username      String   @unique @db.VarChar(50)
  password_hash String   @db.VarChar(255)
  role          Role     @default(student)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relasi Profil 1:1
  student       Student?
  counselor     Counselor?
  admin         Admin?

  // Relasi Fitur Pendukung
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  notifications    Notification[]
}

// --- TABEL PROFIL ---
model Student {
  id           String   @id @default(uuid()) @db.Char(36)
  userId       String   @unique @db.Char(36)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName     String   @db.VarChar(150)
  nim          String?  @unique @db.VarChar(20) // Sekarang Opsional (untuk Step 1)
  faculty      String?  @db.VarChar(100)       // Sekarang Opsional
  major        String?  @db.VarChar(100)       // Sekarang Opsional
  semester     Int?                            // Sekarang Opsional
  university   String?  @db.VarChar(150)       // Baru: Tambahan Universitas
  phoneNumber  String?  @db.VarChar(20)
  avatarUrl    String?  @db.VarChar(255)

  appointments Appointment[]
  clinicalNotes ClinicalNote[] // Untuk optimasi query history
}

model Counselor {
  id              String   @id @default(uuid()) @db.Char(36)
  userId          String   @unique @db.Char(36)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName        String   @db.VarChar(150)
  specialization  String   @db.VarChar(100)
  experienceYears Int      @default(0)
  bioDescription  String?  @db.Text
  isActive        Boolean  @default(true)
  avatarUrl       String?  @db.VarChar(255)

  schedules       CounselorSchedule[]
  appointments    Appointment[]
  clinicalNotes   ClinicalNote[]
}

model Admin {
  id         String   @id @default(uuid()) @db.Char(36)
  userId     String   @unique @db.Char(36)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName   String   @db.VarChar(150)
  department String   @db.VarChar(100)
}

// --- TABEL TRANSAKSI & PENJADWALAN ---
model CounselorSchedule {
  id            String   @id @default(uuid()) @db.Char(36)
  counselorId   String   @db.Char(36)
  counselor     Counselor @relation(fields: [counselorId], references: [id], onDelete: Cascade)
  availableDate DateTime @db.Date
  startTime     DateTime @db.Time
  endTime       DateTime @db.Time
  isBooked      Boolean  @default(false)

  appointments  Appointment[]
}

model Appointment {
  id             String            @id @default(uuid()) @db.Char(36)
  studentId      String            @db.Char(36)
  counselorId    String            @db.Char(36)
  scheduleId     String            @db.Char(36)
  
  student        Student           @relation(fields: [studentId], references: [id])
  counselor      Counselor         @relation(fields: [counselorId], references: [id])
  schedule       CounselorSchedule @relation(fields: [scheduleId], references: [id])

  appointmentDate DateTime         @db.Date
  startTime       DateTime         @db.Time
  endTime         DateTime         @db.Time
  counselingType  CounselingType
  meetingLink     String?          @db.VarChar(255)
  topicOrReason   String           @db.Text
  status          AppointmentStatus @default(PENDING)
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  clinicalNote    ClinicalNote?
}

model ClinicalNote {
  id                String      @id @default(uuid()) @db.Char(36)
  appointmentId     String      @unique @db.Char(36)
  appointment       Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  
  counselorId       String      @db.Char(36)
  counselor         Counselor   @relation(fields: [counselorId], references: [id])
  
  studentId         String      @db.Char(36)
  student           Student     @relation(fields: [studentId], references: [id])

  diagnosisCategory String      @db.VarChar(100)
  privateNotes      String?     @db.Text
  actionPlan        String?     @db.Text
  createdAt         DateTime    @default(now())
}
________________________________________
4. Rencana Endpoints API & Integrasi Swagger UI
API akan didokumentasikan secara interaktif menggunakan Swagger UI yang dapat diakses melalui browser di http://localhost:<PORT>/api-docs.
Modul Autentikasi (/api/auth)
•	POST /login : Validasi kredensial pengguna -> Mengembalikan Token JWT.
•	POST /register : Pendaftaran mahasiswa baru (Langkah 1: Akun Dasar).
•	PATCH /complete-profile : (Student Only) Melengkapi data akademik/universitas (Langkah 2).
•	GET /me : Mengambil data user yang sedang login beserta profilnya.
Modul Jadwal Konselor (/api/schedules)
•	POST / : (Konselor Only) Input ketersediaan jadwal. (Memiliki validasi cek bentrok waktu).
•	GET / : Menampilkan daftar jadwal kosong untuk mahasiswa.
Modul Booking / Appointment (/api/appointments)
•	POST / : (Student Only) Melakukan booking. (Sistem mengecek isBooked pada jadwal sebelum insert).
•	PUT /:id/status : (Counselor Only) Mengubah status (Setujui/Tolak).
•	GET /student : Mengambil riwayat jadwal mahasiswa login.
•	GET /counselor : Mengambil daftar permintaan masuk untuk konselor login.
Modul Pelaporan Admin (/api/reports)
•	GET /generate : (Admin Only) Menarik data appointments dengan status COMPLETED berdasarkan rentang parameter tanggal (startDate & endDate).
________________________________________
5. Middleware & Keamanan (JWT RBAC)
Untuk memastikan data aman, sistem akan menggunakan Middleware pengecekan token sebelum mengakses rute tertentu:
1.	verifyToken: Memastikan request dari Frontend (React) memiliki Header Authorization: Bearer <token>.
2.	requireRole(['student', 'counselor', 'admin']): Memastikan hanya Role tertentu yang bisa mengakses endpoint. Contoh: Mahasiswa tidak bisa mengakses endpoint GET /generate milik admin.
________________________________________
Langkah Memulai Development:
1.	Buka terminal, buat folder proyek: mkdir backend-konseling && cd backend-konseling
2.	Inisialisasi Node.js: npm init -y
3.	Install Express & pendukung: npm i express cors dotenv jsonwebtoken bcrypt
4.	Install Typescript & Swagger: npm i -D typescript ts-node @types/express swagger-ui-express swagger-jsdoc
5.	Inisialisasi Prisma: npm i prisma @prisma/client && npx prisma init
6.	Setup .env untuk koneksi MySQL.

