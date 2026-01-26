require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'capacitor://localhost',
        'http://localhost'
    ],
    credentials: true
}));
// Security Middleware
app.use(helmet());
// TEMPORARILY DISABLED: express-mongo-sanitize has compatibility issues with current Express version
// app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(compression()); // Compress all routes for faster performance
app.use(morgan('dev'));

// Database Connection
connectDB();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Import Modules
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/user/user.routes'));
app.use('/api/inventory', require('./modules/inventory/inventory.routes'));
app.use('/api/sales', require('./modules/sales/sales.routes'));
app.use('/api/analytics', require('./modules/analytics/analytics.routes'));
app.use('/api/audit', require('./modules/audit/audit.routes'));
app.use('/api/sync', require('./modules/sync/sync.routes'));
app.use('/api/customers', require('./modules/customer/customer.routes'));
app.use('/api/suppliers', require('./modules/supplier/supplier.routes'));
app.use('/api/prescriptions', require('./modules/prescription/prescription.routes'));
app.use('/api/purchases', require('./modules/purchase/purchase.routes'));
app.use('/api/finance', require('./modules/finance/finance.routes'));
app.use('/api/notifications', require('./modules/notification/notification.routes'));
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/payment', require('./modules/payment/payment.routes'));
app.use('/api/hr', require('./modules/hr/hr.routes'));
app.use('/api/ai', require('./modules/ai/ai.routes'));
app.use('/api/medicines', require('./modules/medicine/medicine.routes'));

// Handle Unhandled Routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
