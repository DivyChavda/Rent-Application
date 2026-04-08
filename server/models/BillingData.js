import mongoose from 'mongoose';

const billingDataSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    electricityBills: {
        '500179503': {
            amount: Number,
            meterReading: Number,
            perUnitCost: Number
        },
        '500199956': {
            amount: Number,
            meterReading: Number,
            perUnitCost: Number
        },
        '501165142': {
            amount: Number,
            meterReading: Number,
            perUnitCost: Number
        }
    },
    motorBillApplicability: {
        '001': Boolean,
        '002': Boolean,
        '101': Boolean,
        '102': Boolean,
        '201': Boolean,
        '202': Boolean,
        '301': Boolean
    },
    rentPerFlat: {
        '001': Number,
        '002': Number,
        '101': Number,
        '102': Number,
        '201': Number,
        '202': Number,
        '301': Number
    },
    meterReadings: {
        '001': {
            current: Number,
            previous: Number,
            unitsUsed: Number
        },
        '002': {
            current: Number,
            previous: Number,
            unitsUsed: Number
        },
        '101': {
            current: Number,
            previous: Number,
            unitsUsed: Number
        },
        '102': {
            current: Number,
            previous: Number,
            unitsUsed: Number
        },
        '201': {
            current: Number,
            previous: Number,
            unitsUsed: Number
        },
        '202': {
            current: Number,
            previous: Number,
            unitsUsed: Number
        },
        '301': {
            current: Number,
            previous: Number,
            unitsUsed: Number
        }
    },
    motorBill: {
        current: Number,
        previous: Number,
        unitsUsed: Number
    }
}, {
    timestamps: true
});

// Create unique index on month and year combination
billingDataSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.model('BillingData', billingDataSchema);
