import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import billingRoutes from './routes/billing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
}

// MongoDB connection cache for Vercel/serverless
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        console.log('Connecting to MongoDB...');

        cached.promise = mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            bufferCommands: false
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log('✓ Connected to MongoDB');

        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error('✗ MongoDB connection error:', error);
        throw error;
    }
};

// Routes
app.use('/api/billing', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({
            message: 'Database connection failed',
            error: error.message
        });
    }
}, billingRoutes);

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await connectDB();

        res.json({
            status: 'ok',
            database: 'connected',
            message: 'Server is running'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Rent Calculator API',
        version: '1.0.0'
    });
});

// Local development only
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
    });
}

export default app;
