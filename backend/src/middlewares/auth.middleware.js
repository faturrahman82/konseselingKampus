const jwt = require('jsonwebtoken');

/**
 * Middleware: Verifikasi JWT Token
 * Memastikan request memiliki Header Authorization: Bearer <token>
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded; // { userId, role }
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

/**
 * Middleware: Role-Based Access Control (RBAC)
 * Memastikan hanya role tertentu yang bisa mengakses endpoint
 * @param {string[]} allowedRoles - Array role yang diizinkan, e.g. ['student', 'counselor']
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
            });
        }

        next();
    };
};

module.exports = { verifyToken, requireRole };
