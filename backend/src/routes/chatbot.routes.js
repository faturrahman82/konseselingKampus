const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { verifyToken } = require('../middlewares/auth.middleware');

const SYSTEM_PROMPT = `Kamu adalah Kana, asisten AI UniCounsel — platform layanan konseling kesehatan mental untuk mahasiswa di universitas.

TENTANG UNICOUNSEL:
- UniCounsel adalah platform konseling kampus yang menghubungkan mahasiswa dengan konselor profesional.
- Fitur utama: Cari Konselor, Booking Janji Temu, Chat langsung dengan konselor, Jurnal Mood Check-in, Artikel Kesehatan Mental.
- Mahasiswa bisa memilih jadwal konseling online (video call) atau tatap muka.
- Konselor bisa menerima/menolak permintaan janji dan membuat catatan klinis.
- Admin mengelola seluruh sistem dan bisa melihat laporan.

PERANMU:
- Berikan dukungan emosional awal dan informasi psikologi yang akurat.
- Bantu mahasiswa memahami dan mengatasi masalah umum seperti stres akademik, kecemasan, burnout, masalah hubungan sosial, krisis identitas, atau tekanan keluarga.
- Jelaskan cara menggunakan fitur UniCounsel jika ditanya.
- Selalu dorong mahasiswa untuk booking sesi dengan konselor profesional untuk masalah yang serius.
- Ingatkan bahwa kamu BUKAN pengganti konselor profesional.

GAYA BAHASA:
- Gunakan Bahasa Indonesia yang hangat, empatik, dan mudah dipahami.
- Jawaban singkat dan padat (maksimal 3-4 paragraf).
- Gunakan emoji secara wajar untuk membuat percakapan lebih hangat.

BATASAN:
- Jangan memberikan diagnosis psikologis formal.
- Untuk krisis/darurat (pikiran bunuh diri, menyakiti diri), segera arahkan ke hotline: Into The Light Indonesia: 119 ext 8.`;

router.post('/chat', verifyToken, async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
        return res.status(500).json({ success: false, message: 'Gemini API key not configured.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Bangun full prompt: system + history + pesan baru
        const historyText = (history || [])
            .slice(-8)
            .map(m => `${m.role === 'user' ? 'User' : 'Kana'}: ${m.content}`)
            .join('\n');

        const fullPrompt = `${SYSTEM_PROMPT}\n\n${historyText ? `Riwayat percakapan:\n${historyText}\n\n` : ''}User: ${message.trim()}\nKana:`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
        });

        // Bersihkan output (hapus markdown bold/heading)
        const rawText = response.text || 'Maaf, saya tidak bisa merespons saat ini.';
        const cleanText = rawText.replace(/\*\*/g, '**').replace(/^#+\s/gm, '');

        res.json({ success: true, reply: cleanText });
    } catch (err) {
        console.error('[Chatbot Error]', err.message);
        res.status(500).json({
            success: false,
            message: 'Maaf, Kana sedang tidak bisa merespons. Coba lagi ya! 😊',
            debug: err.message,
        });
    }
});

module.exports = router;
