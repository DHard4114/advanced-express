const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');

// Rate Limiting Middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // maksimal 100 request per IP per window
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware untuk keamanan
const securityMiddleware = (app) => {
    app.use(helmet()); // Set HTTP headers untuk keamanan
    app.use(xss()); // Mencegah XSS (Cross-site scripting)
    app.use(mongoSanitize()); // Mencegah NoSQL Injection
    app.use(limiter); // Rate Limiting
};

// Middleware untuk CORS
const corsMiddleware = (app) => {
    const corsOptions = {
        origin: ['https://os.netlabdte.com', 'http://localhost:5173', 'https://advanced-express-zkl7.vercel.app','http://192.168.76.1:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };
    app.use(require('cors')(corsOptions)); // Enable CORS
};

module.exports = { securityMiddleware, corsMiddleware };
