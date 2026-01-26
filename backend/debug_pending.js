require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
// Ensure models are registered
const Customer = require('./modules/customer/customer.model');
const Prescription = require('./modules/prescription/prescription.model');

const testPending = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        console.log('Testing Prescription.find({ status: "pending" }) ...');
        const prescriptions = await Prescription.find({ status: 'pending' }).populate('customer');
        console.log('Success!', prescriptions);
    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        mongoose.connection.close();
    }
};

testPending();
