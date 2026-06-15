const express = require('express');
const cors = require('cors');
const path = require('path');
const companyRoutes = require('./routes/companyRoutes');

const app = express();

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares
app.use(cors({
    origin: [ 'http://localhost:5174', ],
    credentials: true
}));
app.use(express.json());

// Routes Gateway
app.use('/api/v1', companyRoutes);

// Global Central Error-Handling Middleware
app.use((err, req, res, next) => {
    console.error('Application Error Track:', err.stack);
    const statusCode = err.message.includes('Invalid') || err.message.includes('provide') ? 400 : 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error encountered.'
    });
});

// CRITICAL: Clean export of just the app instance
module.exports = app;
