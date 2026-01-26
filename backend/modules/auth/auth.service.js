const User = require('../user/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../../services/email.service');

const AuthService = {
    async register(userData) {
        const { username, email, password, role, fullName } = userData;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: email.toLowerCase() }
            ]
        });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const normalizedRole = role ? role.toLowerCase() : 'pharmacist';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role: normalizedRole,
            fullName,
            image: userData.image // Support image during registration
        });

        return {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            fullName: newUser.fullName,
            image: newUser.image
        };
    },

    async login(username, password) {
        // Find user
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username, fullName: user.fullName, email: user.email, image: user.image },
            process.env.JWT_SECRET || 'secret', // Use env in prod
            { expiresIn: '30d' }
        );

        return {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                image: user.image
            },
            token
        };
    },

    async forgotPassword(email) {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new Error('User with this email does not exist');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiry (1 hour)
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        // Send email
        await sendResetEmail(user.email, resetToken);

        return true;
    },

    async resetPassword(token, newPassword) {
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return true;
    }
};

module.exports = AuthService;
