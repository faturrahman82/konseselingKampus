const { PrismaClient } = require('@prisma/client');

let prismaInstance;

function createPrisma() {
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
        // Instead of throwing at boot-time (which kills ALL routes on Vercel),
        // we just log a warning.  The actual PrismaClient constructor will throw
        // a clear error the moment any DB query is executed without a valid URL.
        if (!process.env.DATABASE_URL) {
            console.error('[PRISMA] WARNING — DATABASE_URL is not set. DB queries will fail at runtime.');
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
