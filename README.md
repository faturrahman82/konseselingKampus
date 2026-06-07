# 🛡️ UniCounsel

**UniCounsel** adalah aplikasi layanan konseling kampus berbasis web untuk membantu mahasiswa melakukan booking konseling, konselor mengelola jadwal dan sesi, serta admin memantau layanan konseling dalam satu sistem terpadu.

> Platform konseling universitas untuk Mahasiswa, Konselor, dan Admin.

---

## ✨ Ringkasan

UniCounsel dibuat untuk mendigitalisasi proses layanan konseling di lingkungan kampus. Sistem ini mendukung alur mulai dari registrasi mahasiswa, pengisian profil akademik, pencarian konselor, pemilihan jadwal, approval sesi, pelaksanaan konseling, pemberian ulasan, hingga laporan admin.

| Area | Keterangan |
|---|---|
| Nama Project | UniCounsel |
| Jenis Aplikasi | University Counseling Platform |
| Role Utama | Mahasiswa, Konselor, Admin |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, Prisma |
| Database | MySQL |
| Autentikasi | JWT dan role-based access |

---

## 📌 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Role Pengguna](#-role-pengguna)
- [Teknologi](#-teknologi)
- [Struktur Project](#-struktur-project)
- [Alur Sistem](#-alur-sistem)
- [Database](#-database)
- [Cara Menjalankan Project](#-cara-menjalankan-project)
- [Seed Data Contoh](#-seed-data-contoh)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Akses Pengguna](#-akses-pengguna)
- [API Endpoint](#-api-endpoint)
- [Halaman Aplikasi](#-halaman-aplikasi)
- [Catatan Production](#-catatan-production)
- [CI/CD GitHub Actions](#cicd-github-actions)

---

## 🚀 Fitur Utama

- 🏠 **Landing Page** untuk pengenalan layanan konseling kampus.
- 🔐 **Autentikasi pengguna** dengan role Mahasiswa, Konselor, dan Admin.
- 🎓 **Profil akademik mahasiswa** sebagai data awal sebelum memakai layanan.
- 🧑‍⚕️ **Pencarian konselor** berdasarkan nama atau spesialisasi.
- 📅 **Booking jadwal konseling** berdasarkan slot konselor yang tersedia.
- ✅ **Approval sesi** oleh konselor, termasuk status approved/rejected/completed.
- 💬 **Pesan dan notifikasi** untuk mendukung komunikasi antar pengguna.
- 🙂 **Mood check-in** dan skor kesejahteraan mahasiswa.
- ⭐ **Review dan rating konselor** setelah sesi selesai.
- 📊 **Dashboard admin** untuk melihat statistik layanan.
- 📄 **Laporan konseling** berdasarkan rentang tanggal.
- ⚙️ **Pengaturan sistem** untuk konfigurasi aplikasi.

---

## 👥 Role Pengguna

### 🎓 Mahasiswa

Mahasiswa dapat membuat akun, melengkapi profil akademik, mencari konselor, memilih slot jadwal, mengajukan booking, melihat riwayat sesi, melakukan mood check-in, mengirim pesan, dan memberikan ulasan setelah sesi selesai.

### 🧑‍⚕️ Konselor

Konselor dapat mengatur slot jadwal, meninjau permintaan janji temu, menyetujui atau menolak booking mahasiswa, menjalankan sesi, menandai sesi selesai, serta mengelola profil dan pesan.

### 🛠️ Admin

Admin dapat memantau statistik sistem, mengelola data konselor, melihat laporan layanan konseling, serta mengatur konfigurasi global aplikasi.

---

## 🧰 Teknologi

### Frontend

| Teknologi | Fungsi |
|---|---|
| React | Membangun antarmuka aplikasi |
| TypeScript | Menjaga tipe data frontend |
| Vite | Development server dan build tool |
| Tailwind CSS | Styling UI |
| React Router | Routing halaman |
| Axios | Komunikasi API |
| Zustand | State management |
| React Hook Form + Zod | Form dan validasi |
| Lucide React | Icon UI |
| Sonner | Toast notification |

### Backend

| Teknologi | Fungsi |
|---|---|
| Node.js | Runtime backend |
| Express | Web framework API |
| Prisma | ORM untuk database |
| MySQL | Database relasional |
| JWT | Autentikasi token |
| BcryptJS | Hash password |
| Nodemailer | Pengiriman email |
| Multer | Upload file |
| Swagger | Dokumentasi API |
| Helmet + CORS + Rate Limit | Keamanan API |

---

## 📁 Struktur Project

```text
perocobaan/
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.js
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   |-- uploads/
|   |-- index.js
|   `-- package.json
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |   |-- admin/
|   |   |   |-- konselor/
|   |   |   `-- mahasiswa/
|   |   `-- store/
|   |-- index.html
|   `-- package.json
|-- PANDUAN_ALUR.md
`-- README.md
```

---

## 🔄 Alur Sistem

```text
Konselor membuka slot jadwal
        |
Mahasiswa registrasi dan melengkapi profil
        |
Mahasiswa mencari konselor dan memilih slot
        |
Mahasiswa mengajukan booking
        |
Konselor menyetujui atau menolak booking
        |
Mahasiswa mengikuti sesi konseling
        |
Konselor menandai sesi selesai
        |
Mahasiswa memberi review dan rating
        |
Admin melihat laporan layanan
```

Status appointment:

```text
PENDING -> APPROVED -> COMPLETED
PENDING -> REJECTED
APPROVED -> CANCELLED
```

---

## 🗄️ Database

Database menggunakan **MySQL** dan dikelola melalui **Prisma ORM**.

| Tabel | Fungsi |
|---|---|
| `user` | Akun utama, email, username, password hash, dan role |
| `student` | Profil akademik mahasiswa |
| `counselor` | Profil konselor, spesialisasi, status aktif, rating |
| `admin` | Profil admin sistem |
| `counselorschedule` | Slot jadwal konselor |
| `appointment` | Booking dan status sesi konseling |
| `clinicalnote` | Catatan klinis sesi |
| `review` | Rating dan ulasan konselor |
| `moodlog` | Mood check-in mahasiswa |
| `message` | Pesan antar pengguna |
| `notification` | Notifikasi sistem |
| `systemsetting` | Konfigurasi global aplikasi |

Relasi utama:

- `user` memiliki satu profil sesuai role: `student`, `counselor`, atau `admin`.
- `student` dapat memiliki banyak `appointment`, `moodlog`, dan `review`.
- `counselor` dapat memiliki banyak `counselorschedule`, `appointment`, `clinicalnote`, dan `review`.
- `appointment` menghubungkan mahasiswa, konselor, jadwal, catatan klinis, dan ulasan.

---

## 🏃 Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone <url-repository>
cd perocobaan
```

### 2. Jalankan Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend berjalan di:

```text
http://localhost:5000
```

Swagger API tersedia pada mode development:

```text
http://localhost:5000/api-docs
```

### 3. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di:

```text
http://localhost:5173
```

---

## 🌱 Seed Data Contoh

File `backend/prisma/seed.js` hanya berisi **data contoh untuk development/local testing**. Seed ini tidak boleh berisi akun production, email asli, password asli, atau link meeting asli.

Jalankan seed contoh:

```bash
cd backend
node prisma/seed.js
```

Akun contoh yang dibuat:

| Role | Email Contoh | Password Contoh |
|---|---|---|
| Admin | `admin@example.com` | `PasswordContoh123!` |
| Konselor | `konselor.akademik@example.com` | `PasswordContoh123!` |
| Konselor | `konselor.keluarga@example.com` | `PasswordContoh123!` |
| Mahasiswa | `mahasiswa@example.com` | `PasswordContoh123!` |

> Untuk production, buat akun melalui proses internal/admin dan jangan memakai seed contoh.

---

## 🔧 Konfigurasi Environment

Buat file `.env` pada folder `backend`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
CORS_ORIGINS="http://localhost:5173,https://frontend-domain-anda.example"
JWT_SECRET=your_jwt_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

NEWS_API_KEY=your_news_api_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3-flash-preview
```

Buat file `.env` pada folder `frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 Akses Pengguna

Pada tahap production, credential pengguna tidak dicantumkan di dokumentasi publik.

| Role | Cara Akses |
|---|---|
| Mahasiswa | Membuat akun melalui halaman register |
| Konselor | Akun dibuat atau dikelola oleh admin |
| Admin | Akun dibuat melalui proses internal |

Halaman registrasi mahasiswa:

```text
http://localhost:5173/register
```

---

## 🧭 API Endpoint

| Endpoint | Keterangan |
|---|---|
| `/api/auth` | Login, register, reset password, autentikasi |
| `/api/students` | Profil mahasiswa |
| `/api/counselors` | Data dan pencarian konselor |
| `/api/schedules` | Slot jadwal konselor |
| `/api/appointments` | Booking dan status appointment |
| `/api/reviews` | Rating dan ulasan |
| `/api/reports` | Laporan admin |
| `/api/dashboard` | Statistik dashboard |
| `/api/notifications` | Notifikasi pengguna |
| `/api/chat` | Pesan antar pengguna |
| `/api/chatbot` | Chatbot pendukung |
| `/api/articles` | Artikel mahasiswa |
| `/api/admin` | Fitur administrasi |
| `/api/wellbeing` | Mood check-in dan skor kesejahteraan |

---

## 🖥️ Halaman Aplikasi

### Umum

- `/` - Landing page
- `/login` - Login
- `/register` - Register
- `/lupa-sandi` - Lupa sandi
- `/atur-ulang-sandi` - Reset sandi
- `/lengkapi-profil` - Lengkapi profil mahasiswa

### Mahasiswa

- `/mahasiswa/dasbor`
- `/mahasiswa/cari-konselor`
- `/mahasiswa/jadwal`
- `/mahasiswa/pesan`
- `/mahasiswa/profil`
- `/mahasiswa/pengaturan`
- `/mahasiswa/artikel`
- `/mahasiswa/mood`

### Konselor

- `/konselor/dasbor`
- `/konselor/jadwal`
- `/konselor/mahasiswa`
- `/konselor/pesan`
- `/konselor/profil`
- `/konselor/pengaturan`

### Admin

- `/admin`
- `/admin/konselor`
- `/admin/laporan`
- `/admin/pengaturan`

---


## CI/CD GitHub Actions

Workflow tersedia pada `.github/workflows/ci-cd.yml` dan berjalan untuk pull request menuju `main`, push ke `main`, serta eksekusi manual melalui tab **Actions**.

Pemeriksaan wajib pada CI:

1. Instalasi dependency frontend dan backend menggunakan `npm ci`.
2. Build production frontend.
3. Generate dan validasi Prisma Client.
4. Menjalankan seluruh backend test ketika folder `backend/test` sudah tersedia di repository.

Lint frontend tetap dijalankan sebagai laporan artifact, tetapi sementara bersifat non-blocking karena masih terdapat utang lint pada beberapa file lama.

### Continuous Deployment melalui Vercel

Repository utama:

- [faturrahman82/konseselingKampus](https://github.com/faturrahman82/konseselingKampus)

Deployment menggunakan integrasi GitHub bawaan Vercel agar tidak terjadi deployment ganda dari GitHub Actions.

| Aplikasi | Project Vercel | Root Directory |
|---|---|---|
| Frontend | [konseseling-kampus-r4gu](https://vercel.com/faturrahmans-projects/konseseling-kampus-r4gu) | `frontend` |
| Backend | [konseseling-kampus](https://vercel.com/faturrahmans-projects/konseseling-kampus) | `backend` |

Pastikan pada kedua project Vercel:

1. Repository Git yang terhubung adalah `faturrahman82/konseselingKampus`.
2. Production Branch diatur ke `main`.
3. Root Directory sesuai tabel di atas.
4. Automatic deployments dari Git tetap aktif.

Environment variables aplikasi seperti `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, dan `VITE_API_URL` dikonfigurasi langsung pada masing-masing project Vercel, bukan dimasukkan ke repository.

Untuk memastikan production hanya menerima kode yang lolos CI, aktifkan branch protection pada GitHub melalui **Settings > Branches > Add branch protection rule** untuk branch `main`, lalu wajibkan status checks:

- `Frontend checks`
- `Backend checks`

Alur akhirnya:

```text
Pull Request ke GitHub
        |
GitHub Actions menjalankan CI
        |
Merge ke main setelah seluruh check berhasil
        |
Vercel mendeteksi perubahan pada main
        |
Frontend dan backend dideploy otomatis
```

---

## 📌 Status Project

Project sudah memiliki:

- Frontend untuk tiga role utama.
- Backend dengan route, controller, service, middleware, dan Prisma schema.
- Database relasional untuk layanan konseling.
- Proteksi route berdasarkan role.
- Seed data contoh yang aman untuk development.
- Dokumentasi alur penggunaan pada `PANDUAN_ALUR.md`.

---

## 📄 Lisensi

Project ini dibuat untuk kebutuhan praktikum dan pengembangan sistem layanan konseling kampus.
