const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Konseling Kampus API',
            version: '1.0.0',
            description: 'API Sistem Informasi Booking Konsultasi Psikologi Online Kampus',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Auth', description: 'Otentikasi, Registrasi, dan Pemulihan Akun' },
            { name: 'Dashboard', description: 'Statistik dan Ringkasan untuk setiap Role' },
            { name: 'Student', description: 'Manajemen Profil Mahasiswa (Self)' },
            { name: 'Counselor', description: 'Manajemen Profil Konselor (Self)' },
            { name: 'Schedules', description: 'Pencarian Konselor dan Jadwal Tersedia' },
            { name: 'Appointments', description: 'Manajemen Janji Temu dan Sesi Konseling' },
            { name: 'Chat', description: 'Komunikasi Real-time antara Mahasiswa dan Konselor' },
            { name: 'Wellbeing', description: 'Mood Tracking dan Statistik Kesehatan Mental' },
            { name: 'Reviews', description: 'Sistem Rating dan Ulasan Sesi' },
            { name: 'Notifications', description: 'Sistem Pemberitahuan Pengguna' },
            { name: 'Admin', description: 'Manajemen Pengguna dan Konfigurasi Sistem (Admin Only)' },
            { name: 'Reports', description: 'Pelaporan dan Analitik Institusi' },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Konseling Kampus - API Docs',
    }));
};

module.exports = setupSwagger;
