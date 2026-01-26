const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Generic configuration - in real scenarios, use environment variables for service, host, port, etc.
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendResetEmail = async (email, token) => {
    // Determine the frontend URL (usually 3000 in dev)
    const resetUrl = `http://localhost:3000/auth/reset-password/${token}`;

    const mailOptions = {
        from: '"ShawCare Pharmacy" <no-reply@shawcare.com>',
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #059669; text-align: center;">ShawCare Pharmacy</h2>
                <p>Hello,</p>
                <p>You requested a password reset. Please click the button below to set a new password. This link will expire in 1 hour.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                <p style="word-break: break-all; color: #6b7280; font-size: 0.875rem;">${resetUrl}</p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                <p style="font-size: 0.8rem; color: #9ca3af; text-align: center;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    // Logging for development purposes if credentials aren't set
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_email')) {
        console.log('--- EMAIL MOCK ---');
        console.log(`To: ${email}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('------------------');
        return true;
    }

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send reset email');
    }
};

module.exports = { sendResetEmail };
