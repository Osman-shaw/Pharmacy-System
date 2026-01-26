const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy', {
            // These options are no longer needed in Mongoose 6+, but harmless
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Ensure Indexes
        try {
            // User
            await conn.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
            await conn.connection.db.collection('users').createIndex({ username: 1 }, { unique: true });

            // Product
            await conn.connection.db.collection('products').createIndex({ name: 1 });
            await conn.connection.db.collection('products').createIndex({ category: 1 });

            // Sale
            await conn.connection.db.collection('sales').createIndex({ date: -1 });
            await conn.connection.db.collection('sales').createIndex({ invoice_number: 1 });

            console.log('MongoDB Indexes ensured.');
        } catch (indexError) {
            console.warn('Error ensuring indexes (non-fatal):', indexError.message);
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
