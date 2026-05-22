# UniCounsel

UniCounsel adalah aplikasi layanan konseling kampus yang membantu mahasiswa melakukan pemesanan sesi konseling, konselor mengelola jadwal dan sesi, serta admin memantau data layanan konseling dalam satu sistem terpadu.

Project ini dibuat sebagai aplikasi full-stack dengan pembagian peran utama: Mahasiswa, Konselor, dan Admin.

## Daftar Isi

- [Tentang Project](#tentang-project)
- [Fitur Utama](#fitur-utama)
- [Role Pengguna](#role-pengguna)
- [Teknologi](#teknologi)
- [Struktur Project](#struktur-project)
- [Alur Sistem](#alur-sistem)
- [Database](#database)
- [Cara Menjalankan Project](#cara-menjalankan-project)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Akun Demo](#akun-demo)
- [API Endpoint](#api-endpoint)
- [Halaman Utama](#halaman-utama)
- [Catatan Keamanan](#catatan-keamanan)
- [Status Project](#status-project)
- [Lisensi](#lisensi)

## Tentang Project

UniCounsel dirancang untuk mendigitalisasi proses layanan konseling di lingkungan universitas. Melalui aplikasi ini, mahasiswa dapat mencari konselor, memilih jadwal yang tersedia, mengajukan booking, mengikuti sesi konseling, dan memberikan ulasan setelah sesi selesai.

Konselor dapat mengatur slot jadwal, menyetujui atau menolak permintaan mahasiswa, menandai sesi selesai, serta memantau aktivitas konseling. Admin dapat mengelola data konselor, melihat statistik sistem, mengatur konfigurasi aplikasi, dan menghasilkan laporan layanan konseling.

## Fitur Utama

- Landing page sebagai pengenalan layanan UniCounsel.
- Autentikasi pengguna dengan role Mahasiswa, Konselor, dan Admin.
- Registrasi akun mahasiswa dan pengisian profil akademik.
- Dashboard mahasiswa berisi ringkasan jadwal, riwayat sesi, skor kesejahteraan, dan mood check-in.
- Pencarian konselor berdasarkan nama atau spesialisasi.
- Booking jadwal konseling berdasarkan slot yang tersedia.
- Pengelolaan jadwal konselor.
- Approval atau penolakan permintaan janji temu oleh konselor.
- Riwayat sesi dan ulasan konselor.
- Dashboard admin untuk melihat statistik sistem.
- Manajemen data konselor oleh admin.
- Generate laporan konseling berdasarkan rentang tanggal.
- Notifikasi sistem untuk status appointment.
- Chat dan chatbot pendukung.

## Role Pengguna

### Mahasiswa

Mahasiswa dapat:

- Membuat akun dan melengkapi profil akademik.
- Melihat dashboard pribadi.
- Mencari konselor.
- Melakukan booking jadwal konseling.
- Melihat jadwal dan riwayat sesi.
- Melakukan mood check-in.
- Mengirim pesan.
- Memberikan rating dan ulasan setelah sesi selesai.

### Konselor

Konselor dapat:

- Melihat dashboard aktivitas.
- Membuat dan mengelola slot jadwal.
- Meninjau permintaan janji temu.
- Menyetujui atau menolak booking mahasiswa.
- Menandai sesi konseling sebagai selesai.
- Melihat data mahasiswa terkait sesi.
- Mengelola pesan dan profil konselor.

### Admin

Admin dapat:

- Melihat panel kontrol sistem.
- Mengelola data konselor.
- Melihat statistik mahasiswa, konselor, dan kesehatan sistem.
- Membuat laporan layanan konseling.
- Mengatur konfigurasi aplikasi global.

## Teknologi

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Zustand
- React Hook Form
- Zod
- Lucide React
- Sonner

### Backend

- Node.js
- Express
- Prisma ORM
- MySQL
- JSON Web Token
- BcryptJS
- Nodemailer
- Multer
- Swagger
- Helmet
- CORS
- Express Rate Limit

## Struktur Project

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
|   |   |-- lib/
|   |   |-- pages/
|   |   |   |-- admin/
|   |   |   |-- konselor/
|   |   |   `-- mahasiswa/
|   |   `-- store/
|   |-- index.html
|   `-- package.json
|-- AKUN_DEMO.md
|-- PANDUAN_ALUR.md
`-- README.md
```

## Alur Sistem

Alur utama layanan konseling pada UniCounsel:

```text
Konselor menambahkan slot jadwal
        |
Mahasiswa registrasi dan melengkapi profil
        |
Mahasiswa mencari konselor dan memilih slot
        |
Mahasiswa mengajukan booking konseling
        |
Konselor menyetujui atau menolak permintaan
        |
Jika disetujui, mahasiswa mengikuti sesi konseling
        |
Konselor menandai sesi selesai
        |
Mahasiswa memberi rating dan ulasan
        |
Admin melihat laporan layanan konseling
```

Status appointment yang digunakan:

```text
PENDING -> APPROVED -> COMPLETED
PENDING -> REJECTED
APPROVED -> CANCELLED
```

## Database

Database menggunakan MySQL dan dikelola dengan Prisma ORM. Model utama yang digunakan:

| Tabel | Fungsi |
|---|---|
| `user` | Menyimpan akun utama, email, username, password hash, dan role. |
| `student` | Menyimpan profil akademik mahasiswa. |
| `counselor` | Menyimpan profil konselor, spesialisasi, status aktif, dan rating. |
| `admin` | Menyimpan profil admin sistem. |
| `counselorschedule` | Menyimpan slot jadwal yang dibuka oleh konselor. |
| `appointment` | Menyimpan data booking dan status sesi konseling. |
| `clinicalnote` | Menyimpan catatan klinis dari sesi konseling. |
| `review` | Menyimpan rating dan ulasan mahasiswa untuk konselor. |
| `moodlog` | Menyimpan data mood check-in mahasiswa. |
| `message` | Menyimpan pesan antar pengguna. |
| `notification` | Menyimpan notifikasi sistem untuk pengguna. |
| `systemsetting` | Menyimpan konfigurasi global aplikasi. |

Relasi utama:

- Satu `user` dapat memiliki satu profil `student`, `counselor`, atau `admin`.
- Satu `student` dapat memiliki banyak `appointment`, `moodlog`, dan `review`.
- Satu `counselor` dapat memiliki banyak `counselorschedule`, `appointment`, `clinicalnote`, dan `review`.
- Satu `appointment` terhubung dengan mahasiswa, konselor, jadwal, catatan klinis, dan ulasan.

## Cara Menjalankan Project

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

Dokumentasi API Swagger tersedia di mode development:

```text
http://localhost:5000/api-docs
```

### 3. Jalankan Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di:

```text
http://localhost:5173
```

## Konfigurasi Environment

Buat file `.env` pada folder `backend`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
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

Jangan menyimpan credential asli di repository publik.

## Akun Demo

Akun demo dapat dibuat dengan menjalankan seed:

```bash
cd backend
node prisma/seed.js
```

Contoh akun admin:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@unicounsel.id` | `Admin@123` |
| Konselor | `dr.sarah@unicounsel.id` | `Konselor@123` |
| Konselor | `budi.santoso@unicounsel.id` | `Konselor@123` |
| Konselor | `ayu.pratiwi@unicounsel.id` | `Konselor@123` |

Akun mahasiswa dapat dibuat melalui halaman register:

```text
http://localhost:5173/register
```

## API Endpoint

Beberapa endpoint utama:

| Endpoint | Keterangan |
|---|---|
| `/api/auth` | Login, register, reset password, dan autentikasi. |
| `/api/students` | Data profil mahasiswa. |
| `/api/counselors` | Data konselor dan pencarian konselor. |
| `/api/schedules` | Slot jadwal konselor. |
| `/api/appointments` | Booking dan status appointment. |
| `/api/reviews` | Rating dan ulasan konselor. |
| `/api/reports` | Laporan admin. |
| `/api/dashboard` | Statistik dashboard. |
| `/api/notifications` | Notifikasi pengguna. |
| `/api/chat` | Pesan antar pengguna. |
| `/api/chatbot` | Chatbot pendukung. |
| `/api/articles` | Artikel untuk mahasiswa. |
| `/api/admin` | Fitur administrasi sistem. |
| `/api/wellbeing` | Mood check-in dan skor kesejahteraan. |

## Halaman Utama

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

## Catatan Keamanan

- Jangan commit file `.env` yang berisi credential asli.
- Gunakan password database, JWT secret, SMTP password, dan API key dalam bentuk environment variable.
- Untuk production, gunakan credential yang berbeda dari development.
- Pastikan `DATABASE_URL`, `JWT_SECRET`, dan API key tidak dipublikasikan di GitHub.

## Status Project

Project sudah memiliki:

- Frontend untuk tiga role utama.
- Backend dengan route, controller, service, middleware, dan Prisma schema.
- Database relasional untuk layanan konseling.
- Proteksi route berdasarkan role.
- Dokumentasi alur penggunaan pada `PANDUAN_ALUR.md`.
- Daftar akun demo pada `AKUN_DEMO.md`.

## Lisensi

Project ini dibuat untuk kebutuhan praktikum dan pengembangan sistem layanan konseling kampus.
