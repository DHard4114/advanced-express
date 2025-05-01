const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import middleware
const { securityMiddleware, corsMiddleware } = require('./src/utils/middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup middleware
corsMiddleware(app); // CORS Middleware
securityMiddleware(app); // Security Middleware

// Parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/store', require('./src/routes/store.route'));
app.use('/user', require('./src/routes/user.route'));
app.use('/item', require('./src/routes/item.route'));
app.use('/transaction', require('./src/routes/transaction.route'));

// Global Error Handler
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack); // Log penuh di development
    } else {
        console.error(`Error: ${err.message}`);
    }

    // Menangani custom error (misalnya AppError atau ValidationError)
    if (err.name === 'ValidationError') {
        return baseResponse(res, false, 400, 'Bad Request', { error: err.message });
    }

    if (err.name === 'AuthenticationError') {
        return baseResponse(res, false, 401, 'Unauthorized', { error: err.message });
    }

    // Menangani error umum
    return baseResponse(res, false, 500, 'Internal Server Error', {
        error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});