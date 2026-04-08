import express from 'express';
import BillingData from '../models/BillingData.js';

const router = express.Router();

// Get all available billing periods (for dropdown filter)
router.get('/periods', async (req, res) => {
    try {
        const periods = await BillingData.find({}, { month: 1, year: 1, _id: 0 })
            .sort({ year: -1, month: -1 });
        res.json(periods);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching periods', error: error.message });
    }
});

// Get billing data for specific month and year
router.get('/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const billingData = await BillingData.findOne({
            year: parseInt(year),
            month: month
        });

        if (!billingData) {
            return res.status(404).json({ message: 'No data found for this period' });
        }

        res.json(billingData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching billing data', error: error.message });
    }
});

// Get previous month rent data
router.get('/previous-rent/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const currentYear = parseInt(year);

        // Calculate previous month
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthIndex = monthNames.indexOf(month);

        let prevMonth, prevYear;
        if (currentMonthIndex === 0) {
            prevMonth = monthNames[11]; // December
            prevYear = currentYear - 1;
        } else {
            prevMonth = monthNames[currentMonthIndex - 1];
            prevYear = currentYear;
        }

        // Find previous month's data
        const prevData = await BillingData.findOne({
            year: prevYear,
            month: prevMonth
        });

        if (!prevData) {
            return res.status(404).json({ message: 'No previous month data found' });
        }

        // Return rent and meter reading data
        res.json({
            rentPerFlat: prevData.rentPerFlat || {},
            motorBillApplicability: prevData.motorBillApplicability || {},
            meterReadings: prevData.meterReadings || {},
            motorBill: prevData.motorBill || {},
            previousMonth: prevMonth,
            previousYear: prevYear
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching previous rent data', error: error.message });
    }
});

// Save or update billing data
router.post('/save', async (req, res) => {
    try {
        const { month, year, ...billingData } = req.body;

        // Update if exists, create if doesn't
        const result = await BillingData.findOneAndUpdate(
            { month, year },
            { month, year, ...billingData },
            { upsert: true, new: true }
        );

        res.json({ message: 'Data saved successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error saving billing data', error: error.message });
    }
});

// Delete billing data for specific month
router.delete('/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        await BillingData.findOneAndDelete({
            year: parseInt(year),
            month: month
        });

        res.json({ message: 'Data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting billing data', error: error.message });
    }
});

export default router;
