const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isProd = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Storage strategy:
//   • Development  → disk   (uploads/avatars/)  – easy to inspect files locally
//   • Production   → memory (Buffer)            – Vercel has a read-only FS
// ---------------------------------------------------------------------------

let storage;

if (isProd) {
    // On Vercel the FS is read-only; store in RAM (req.file.buffer).
    // The controller should persist the buffer elsewhere (e.g. cloud storage
    // or save as base64/URL in the database).
    storage = multer.memoryStorage();
} else {
    // Local dev: write to disk so we can serve via /uploads
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `avatar-${req.user.userId}-${Date.now()}${ext}`);
        },
    });
}

const avatarUpload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Hanya file gambar (jpg, png, webp) yang diperbolehkan.'));
    },
});

module.exports = { avatarUpload };
