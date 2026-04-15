# 🔑 Akun Demo — UniCounsel

> File ini berisi daftar akun yang tersedia untuk keperluan testing dan demo aplikasi.
> Jalankan `node prisma/seed.js` di folder `backend` untuk membuat ulang akun-akun ini.

---

## 👤 Admin

| Field | Value |
|---|---|
| **Email** | `admin@unicounsel.id` |
| **Password** | `Admin@123` |
| **Role** | Admin |
| **Nama** | Administrator UniCounsel |
| **Department** | Pusat Kesejahteraan Mahasiswa |
| **Akses** | `/admin` → Dasbor, Kelola Konselor, Laporan, Pengaturan |

---

## 🧑‍⚕️ Konselor 1 — Dr. Sarah Rahmawati

| Field | Value |
|---|---|
| **Email** | `dr.sarah@unicounsel.id` |
| **Password** | `Konselor@123` |
| **Role** | Counselor |
| **Spesialisasi** | Stres Akademik & Kecemasan |
| **Pengalaman** | 5 Tahun |
| **Auto-Approve** | ✅ Ya |
| **Min Notice** | 12 jam |
| **Meeting Link** | https://meet.google.com/abc-defg-hij |
| **Ruangan** | Ruang Konseling A |
| **Akses** | `/konselor/dasbor` → Dasbor, Jadwal, Mahasiswa, Pesan |

---

## 🧑‍⚕️ Konselor 2 — Budi Santoso, M.Psi

| Field | Value |
|---|---|
| **Email** | `budi.santoso@unicounsel.id` |
| **Password** | `Konselor@123` |
| **Role** | Counselor |
| **Spesialisasi** | Hubungan Sosial & Keluarga |
| **Pengalaman** | 7 Tahun |
| **Auto-Approve** | ❌ Tidak (manual approve) |
| **Min Notice** | 24 jam |
| **Meeting Link** | https://zoom.us/j/1234567890 |
| **Ruangan** | Ruang Konseling B |
| **Akses** | `/konselor/dasbor` → Dasbor, Jadwal, Mahasiswa, Pesan |

---

## 🧑‍⚕️ Konselor 3 — Ayu Pratiwi, S.Psi

| Field | Value |
|---|---|
| **Email** | `ayu.pratiwi@unicounsel.id` |
| **Password** | `Konselor@123` |
| **Role** | Counselor |
| **Spesialisasi** | Depresi & Kesehatan Mental |
| **Pengalaman** | 3 Tahun |
| **Auto-Approve** | ✅ Ya |
| **Min Notice** | 6 jam |
| **Meeting Link** | https://meet.google.com/xyz-uvwx-yz |
| **Ruangan** | Ruang Konseling C |
| **Akses** | `/konselor/dasbor` → Dasbor, Jadwal, Mahasiswa, Pesan |

---

## 🎓 Mahasiswa (Register Manual)

Akun mahasiswa dibuat lewat halaman Register:

| Field | Keterangan |
|---|---|
| **URL** | `http://localhost:5173/register` |
| **Password Default** | Bebas (min. 8 karakter) |
| **Setelah Register** | Login → otomatis ke Lengkapi Profil (isi NIM dll) |
| **Akses** | `/mahasiswa/dasbor` → Dasbor, Cari Konselor, Jadwal, Pesan |

---

## 🚀 Cara Menjalankan Aplikasi

```bash
# Backend
cd backend
npm start        # http://localhost:5000
# API Docs: http://localhost:5000/api-docs

# Frontend
cd frontend
npm run dev      # http://localhost:5173

# Buat ulang akun demo
cd backend
node prisma/seed.js
```

---

## 📝 Catatan Penting

- Seed script aman dijalankan berulang kali — akun yang sudah ada akan dilewati
- Email reset password dikirim via Gmail ke `moulvi07papua@gmail.com` (konfigurasikan di `.env`)
- Token reset password berlaku **1 jam**
- Admin Portal: `http://localhost:5173/admin`
