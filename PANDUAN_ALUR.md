# 🎓 Panduan Alur Lengkap — UniCounsel

> Panduan ini menjelaskan langkah-langkah penggunaan sistem konseling dari awal hingga akhir untuk semua peran.

---

## 🚀 Persiapan Awal

### 1. Jalankan Aplikasi

```bash
# Terminal 1 — Backend
cd backend
npm start
# Berjalan di http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Berjalan di http://localhost:5173
```

### 2. Buat Akun Demo (Opsional)
Jika database masih kosong, jalankan seed untuk membuat akun Admin & Konselor:

```bash
cd backend
node prisma/seed.js
```

---

## 📋 Alur Lengkap Konsultasi

```
[1] Konselor Tambah Slot
        ↓
[2] Mahasiswa Daftar & Lengkapi Profil
        ↓
[3] Mahasiswa Cari Konselor & Booking
        ↓
[4] Konselor Approve/Tolak
        ↓
[5] Sesi Berlangsung
        ↓
[6] Konselor Tandai Selesai
        ↓
[7] Mahasiswa Beri Ulasan
        ↓
[8] Admin Lihat Laporan
```

---

## 👤 ROLE: KONSELOR

### Langkah 1 — Login

| Field | Nilai |
|---|---|
| URL | `http://localhost:5173/login` |
| Email | `dr.sarah@unicounsel.id` |
| Password | `Konselor@123` |

---

### Langkah 2 — Atur Profil (Opsional)

1. Buka menu **Profil** di sidebar kiri
2. Lengkapi:
   - **Nama Lengkap** (dengan gelar)
   - **Spesialisasi** (contoh: Stres Akademik & Kecemasan)
   - **Bio Profesional**
3. Klik **Simpan Perubahan**

---

### Langkah 3 — Atur Pengaturan Konseling

1. Buka menu **Pengaturan** di sidebar
2. Konfigurasi:
   - **Setujui Pemesanan Otomatis** → aktifkan jika tidak ingin approval manual
   - **Minimum Notifikasi Pemesanan** → contoh: `12` jam
   - **Link Rapat Default** → isi URL Google Meet/Zoom
3. Klik **Simpan Preferensi**

---

### Langkah 4 — Tambah Slot Jadwal ⭐ (PALING PENTING)

1. Buka menu **Jadwal & Ketersediaan** di sidebar
2. Pada kalender, **klik tanggal** yang ingin dibuka
3. Klik tombol **+ Tambah Slot** (pojok kanan atas)
4. Pada modal:
   - Pilih **Jam Mulai** (contoh: 09:00)
   - Pilih **Jam Selesai** (contoh: 10:00)
5. Klik **Simpan Slot**
6. Ulangi untuk menambah slot sebanyak yang diperlukan

> **Tips:** Tambahkan beberapa slot di hari berbeda agar mahasiswa punya banyak pilihan.

---

### Langkah 5 — Kelola Permintaan Janji Temu

Setelah mahasiswa booking, akan muncul di:

**a) Dasbor Konselor:**
- Bagian **"Permintaan Janji Temu"** menampilkan semua request PENDING
- Klik **Setujui** atau **Tolak**

**b) Halaman Jadwal:**
- Klik tanggal yang ada titik oranye (ada janji temu)
- Di panel kanan bawah akan muncul kartu janji temu
- Tombol **Setujui** / **Tolak** tersedia langsung

---

### Langkah 6 — Jalankan Sesi

Saat hari sesi tiba (status APPROVED):
1. Buka **Jadwal** → klik tanggal sesi
2. Jika tipe Online → klik tombol **Gabung** (membuka meeting link)
3. Jika tipe Offline → temui mahasiswa di kampus

---

### Langkah 7 — Tandai Sesi Selesai

Setelah sesi selesai:
1. Di halaman **Jadwal** → klik tanggal sesi
2. Pada kartu janji temu dengan status Dikonfirmasi → klik **Tandai Selesai**
3. Status berubah menjadi **COMPLETED**

---

## 🎓 ROLE: MAHASISWA

### Langkah 1 — Daftar Akun Baru

1. Buka `http://localhost:5173/register`
2. Isi:
   - **Username** (unik)
   - **Email** (aktif)
   - **Password** (min. 8 karakter)
3. Klik **Daftar**

---

### Langkah 2 — Lengkapi Profil (Wajib Pertama Kali)

Setelah login pertama kali, otomatis diarahkan ke halaman **Lengkapi Profil**:

1. Isi semua field:
   - **Nama Lengkap**
   - **NIM**
   - **Jurusan**
   - **Fakultas**
   - **Universitas**
   - **Nomor HP** *(opsional)*
2. Klik **Simpan & Lanjutkan**
3. Otomatis diarahkan ke Dasbor

---

### Langkah 3 — Lakukan Mood Check-in (Harian)

Di halaman **Dasbor**:
1. Lihat widget **"Bagaimana Perasaan Anda?"**
2. Pilih salah satu: 😊 Sangat Baik / 😐 Biasa / 😟 Kurang
3. Mood tersimpan untuk hari ini (hanya 1x per hari)

---

### Langkah 4 — Cari Konselor & Booking ⭐

1. Buka menu **Cari Konselor** di sidebar
2. Gunakan **pencarian** (nama/spesialisasi) atau **filter spesialisasi**
3. Pilih konselor yang sesuai
4. **Klik slot waktu** yang tersedia (tombol jam biru)
5. Modal konfirmasi muncul:
   - Pilih **Metode**: Online (Meet) atau Offline (Kampus)
   - Isi **Alasan Konseling** (singkat tapi jelas)
6. Klik **Konfirmasi Janji**
7. Notifikasi sukses muncul di pojok kanan atas

---

### Langkah 5 — Pantau Status Janji Temu

1. Buka menu **Jadwal Saya**
2. Lihat daftar semua janji:
   - 🟡 **Menunggu Persetujuan** → menunggu konselor approve
   - 🟢 **Dikonfirmasi** → sesi sudah disetujui
   - 🔵 **Selesai** → sesi telah berakhir
   - 🔴 **Dibatalkan/Ditolak**

---

### Langkah 6 — Ikuti Sesi (Status APPROVED)

1. Buka **Jadwal Saya**
2. Pada sesi dengan status Dikonfirmasi:
   - Jika **Online** → klik tombol **Gabung** (buka Google Meet/Zoom)
   - Jika **Offline** → datang ke ruang konseling yang ditentukan

---

### Langkah 7 — Beri Ulasan Konselor

Setelah sesi selesai (status COMPLETED):
1. Buka **Jadwal Saya**
2. Pada sesi berstatus Selesai → klik **Beri Ulasan**
3. Modal ulasan muncul:
   - Pilih **rating bintang** (1-5)
   - Tulis **komentar** *(opsional)*
4. Klik **Kirim Ulasan**

---

## 🔧 ROLE: ADMIN

### Langkah 1 — Login

| Field | Nilai |
|---|---|
| URL | `http://localhost:5173/login` |
| Email | `admin@unicounsel.id` |
| Password | `Admin@123` |

---

### Langkah 2 — Pantau Statistik Global

Di halaman **Dasbor Admin**:
- **Total Mahasiswa** → jumlah mahasiswa terdaftar
- **Konselor Aktif** → jumlah konselor di sistem
- **Kesehatan Sistem** → status operasional
- **Direktori Konselor** → daftar semua konselor + beban kasus

---

### Langkah 3 — Kelola Konselor

1. Buka menu **Kelola Konselor**
2. **Tambah Konselor Baru:**
   - Klik **+ Tambah Konselor**
   - Isi Nama, Email, Spesialisasi
   - Password awal akan di-generate otomatis
   - Klik **Simpan Konselor**
3. **Hapus Konselor:** klik ikon 🗑️ di baris konselor

---

### Langkah 4 — Generate Laporan ⭐

1. Buka menu **Laporan** di sidebar
2. Pilih **Tanggal Mulai** dan **Tanggal Akhir**
3. Klik **Generate Laporan**
4. Laporan menampilkan:
   - 📊 **Ringkasan:** Total sesi, Selesai, Dibatalkan, Mahasiswa, Konselor
   - 📋 **Detail Tabel:** semua sesi dengan nama, tanggal, status, tipe
5. Klik **Export CSV** untuk mengunduh laporan

---

## 🔄 Ringkasan Status Janji Temu

```
PENDING → (Konselor Approve) → APPROVED → (Konselor Selesai) → COMPLETED
                                                  ↓
PENDING → (Konselor Tolak) → REJECTED         APPROVED → (Mahasiswa Batal) → CANCELLED
```

---

## ⚠️ Catatan Penting

- Konselor **harus menambah slot jadwal** sebelum mahasiswa bisa booking
- Jika Auto-Approve **aktif**, status langsung APPROVED tanpa perlu manual
- Mood check-in hanya bisa **1 kali per hari**
- Ulasan hanya bisa diberikan untuk sesi berstatus **COMPLETED**
- Admin tidak bisa melihat isi percakapan chat (privasi)

---

## 🆘 Troubleshooting

| Masalah | Solusi |
|---|---|
| "Belum ada konselor dengan jadwal tersedia" | Konselor belum tambah slot jadwal, minta konselor login dan tambah slot |
| Booking gagal "jadwal sudah di-book" | Slot sudah diambil mahasiswa lain, pilih slot lain |
| Tidak bisa login | Pastikan backend berjalan di port 5000 |
| Email reset password tidak masuk | Cek folder spam, atau cek konfigurasi `.env` SMTP |
