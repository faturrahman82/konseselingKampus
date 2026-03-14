# 🏥 UniCounsel Backend - Enterprise-Grade Counseling System

UniCounsel adalah platform backend profesional yang dirancang untuk mendukung sistem kesehatan mental dan konseling di lingkungan universitas. Dibangun dengan fokus pada skalabilitas, keamanan, dan analitik data proaktif.

---

## 🚀 Fitur Utama

### 1. Multi-Role Management (RBAC)
- **Admin**: Manajemen sistem, pendaftaran konselor, dan akses laporan kritis universitas.
- **Counselor**: Manajemen jadwal, rekam medis (Clinical Notes), dan evaluasi mahasiswa berisiko.
- **Student**: Mood tracking, pencarian konselor cerdas, booking jadwal, dan riwayat mood journey.

### 2. Smart Scheduling System
- Alur booking terotomasi dengan deteksi konflik waktu.
- Dukungan mode **Online** (Default Meeting Link) dan **Offline** (Lokasi Ruangan Fisk).
- Fitur pembatalan mandiri oleh mahasiswa yang otomatis membuka kembali slot jadwal.

### 3. Wellbeing Engine
- **Mood Tracker**: Check-in harian dengan dampak dinamis pada skor kesejahteraan.
- **Mood Journey**: Grafik historis 30 hari untuk visualisasi tren kesehatan mental.
- **Smart Insight**: Saran otomatis berbasis AI sederhana untuk kesehatan mental di dashboard.

### 4. Communication & Feedback
- **Secure Chat**: Komunikasi langsung antara mahasiswa dan konselor pendamping (mendukung lampiran file).
- **Proactive Alerts**: Peringatan "Urgent" untuk konselor jika mahasiswa bimbingan mengalami penurunan skor drastis.
- **Rating & Review**: Sistem evaluasi transparansi layanan dengan kalkulasi rating otomatis.

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma (v5.10.0)
- **Database**: MySQL
- **Auth**: JWT (JSON Web Token) & Bcrypt (Password Hashing)
- **Docs**: Swagger UI

---

## 📖 Struktur API (Endpoint Utama)

### 🔑 Authentication & Profile
- `POST /api/auth/register` - Daftar Akun Mahasiswa
- `POST /api/auth/login` - Login semua role
- `PATCH /api/students/profile` - Update profil & preferensi notifikasi

### 📅 Appointments
- `GET /api/schedules` - Cari konselor & jadwal tersedia (Cerdas/Grouped)
- `POST /api/appointments` - Booking jadwal baru
- `DELETE /api/appointments/:id` - Batal janji temu (Mahasiswa)

### 💬 Chat & Social
- `GET /api/chat/inbox` - Ambil daftar inbox chat
- `POST /api/chat` - Kirim pesan (mendukung fileUrl)

### 📈 Wellbeing & Analytics
- `GET /api/wellbeing/history` - Data grafik mood journey
- `GET /api/admin/reports/analytics` - Laporan institusi (Khusus Admin)

---

## 🚦 Cara Instalasi & Menjalankan

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Database**:
   Sesuaikan `DATABASE_URL` di file `.env`, lalu jalankan:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
4. **Akses Dokumentasi**:
   Buka `http://localhost:5000/api-docs` untuk melihat dokumentasi API lengkap via Swagger.

---

© 2026 UniCounsel Tech Team. Built with ❤️ for Campus Well-being.
