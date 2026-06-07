/**
 * Utility: Custom Error Handler
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${statusCode} - ${message}`);

    res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 && process.env.NODE_ENV === 'production'
            ? 'Terjadi kesalahan pada server.'
            : message,
        code: err.code || undefined,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { AppError, errorHandler };
