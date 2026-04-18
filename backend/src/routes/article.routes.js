const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');

// Simple in-memory cache per category (15 menit)
const cache = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const QUERIES = {
  all:      'mental health students university',
  stres:    'stress students academic pressure',
  cemas:    'anxiety college students mental health',
  akademik: 'academic burnout study habits students',
  relasi:   'college relationships social mental wellbeing',
};

router.get('/', verifyToken, async (req, res) => {
    const category = req.query.category || 'all';
    const query = QUERIES[category] || QUERIES.all;
    const cacheKey = category;

    // Kembalikan cache jika masih valid
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].ts) < CACHE_TTL) {
        return res.json({ success: true, data: cache[cacheKey].data, fromCache: true });
    }

    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ success: false, message: 'NewsAPI key not configured.' });
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.status !== 'ok') {
            return res.status(502).json({ success: false, message: json.message || 'NewsAPI error.' });
        }

        // Filter artikel yang punya gambar dan deskripsi
        const articles = (json.articles || [])
            .filter(a => a.urlToImage && a.description && a.title !== '[Removed]')
            .map(a => ({
                title: a.title,
                description: a.description,
                url: a.url,
                imageUrl: a.urlToImage,
                source: a.source?.name || 'Unknown',
                publishedAt: a.publishedAt,
            }));

        // Simpan ke cache
        cache[cacheKey] = { data: articles, ts: Date.now() };

        res.json({ success: true, data: articles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal mengambil artikel.' });
    }
});

module.exports = router;
