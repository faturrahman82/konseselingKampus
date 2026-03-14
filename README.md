# 🏥 UniCounsel - Professional University Counseling Platform

UniCounsel adalah solusi digital terintegrasi untuk mendukung kesehatan mental mahasiswa di lingkungan universitas. Dashboard ini menghubungkan Mahasiswa, Konselor, dan Admin Universitas dalam satu ekosistem yang aman dan cerdas.

---

## 🏗️ Struktur Proyek

### 🎨 Frontend (Atomic Design)
Menggunakan standar industri untuk memastikan UI yang konsisten dan premium:
- **FE Tech**: Vite + React, Tailwind CSS, Shadcn UI.
- **Pages**: Student Portal, Counselor Dashboard, Admin Central.

### ⚙️ Backend (Service-Layer Architecture)
Dirancang untuk stabilitas dan skalabilitas tinggi:
- **BE Tech**: Node.js, Express, Prisma, MySQL.
- **Layers**: Routes -> Controllers -> Services -> Database.

---

## 🌟 Fitur Unggulan
- **Mood Tracker & Journey**: Visualisasi tren kesehatan mental mahasiswa.
- **Smart Appointment**: Booking jadwal otomatis (Online/Offline) dengan deteksi slot sibuk.
- **Urgent Risk Alert**: Deteksi dini mahasiswa yang butuh perhatian segera berbasis skor wellbeing.
- **Institutional Analytics**: Laporan tingkat stres per-Fakultas untuk pengambil kebijakan kampus.

---

## 🚀 Cara Menjalankan

### 1. Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
*Akses Swagger:* `http://localhost:5000/api-docs`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

© 2026 UniCounsel Project - Membangun Kampus yang Lebih Sehat & Bahagia.
