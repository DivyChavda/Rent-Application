import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import billingRoutes from './routes/billing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rent-calculator';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch((err) => console.error('✗ MongoDB connection error:', err));

// Routes
app.use('/api/billing', billingRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Rent Calculator API', version: '1.0.0' });
});

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
    });
}

// Export for Vercel
export default app;
