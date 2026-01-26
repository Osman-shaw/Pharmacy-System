const mongoose = require('mongoose');
const User = require('./modules/user/user.model');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const existingUser = await User.findOne({ username: 'admin@shawcare.com' });
        if (existingUser) {
            console.log('User already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const newUser = await User.create({
            username: 'admin@shawcare.com',
            email: 'admin@shawcare.com',
            password: hashedPassword,
            fullName: 'System Admin',
            role: 'admin',
            storeId: 'main'
        });

        console.log('User created:', newUser);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUser();
