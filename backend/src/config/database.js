const { PrismaClient } = require('@prisma/client');

let prismaInstance;

function createPrisma() {
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
        // Avoid crashing the whole serverless function at import-time.
        // If DATABASE_URL is missing, we'll throw a clear error when DB is actually used.
        if (!process.env.DATABASE_URL) {
            const err = new Error('Missing DATABASE_URL. Set it in Vercel Environment Variables.');
            err.code = 'MISSING_DATABASE_URL';
            throw err;
        }
        return new PrismaClient();
    }

    // Dev: reuse global to prevent too many clients on reload.
    if (!global.prisma) {
        global.prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
    }
    return global.prisma;
}

function getPrisma() {
    if (!prismaInstance) prismaInstance = createPrisma();
    return prismaInstance;
}

// Export a lazy proxy so `require('../config/database')` stays compatible everywhere.
module.exports = new Proxy(
    {},
    {
        get(_target, prop) {
            const prisma = getPrisma();
            const value = prisma[prop];
            return typeof value === 'function' ? value.bind(prisma) : value;
        },
    }
);
