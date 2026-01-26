/**
 * Authentication Controller
 * 
 * Handles user authentication using JWT (JSON Web Tokens)
 * 
 * Architecture Decision:
 * - Uses service layer (auth.service.js) for business logic
 * - Controller handles HTTP concerns (request/response)
 * - Service handles authentication logic and database operations
 * 
 * Why JWT over sessions:
 * - Stateless authentication (no server-side session storage)
 * - Scalable across multiple servers
 * - Works well with mobile apps and SPAs
 * - Includes user data in token payload
 */

const AuthService = require('./auth.service');

/**
 * User Registration
 * 
 * Creates a new user account with hashed password
 * Delegates to AuthService for actual user creation
 * 
 * @param {Object} req.body - User registration data
 * @returns {Object} 201 - Success with user data (password excluded)
 * @returns {Object} 400 - Validation or duplicate user error
 */
const register = async (req, res) => {
    try {
        const user = await AuthService.register(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * User Login
 * 
 * Authenticates user and returns JWT token
 * Logs both successful and failed login attempts for security auditing
 * 
 * @param {Object} req.body.username - Username or email
 * @param {Object} req.body.password - Plain text password
 * @returns {Object} 200 - Success with JWT token and user data
 * @returns {Object} 401 - Invalid credentials
 * 
 * Security Features:
 * - Audit logging for all login attempts
 * - IP address and user agent tracking
 * - Failed attempts logged for security monitoring
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await AuthService.login(username, password);

        // Log successful login for security audit trail
        const { logActivity } = require('../audit/audit.service');
        await logActivity({
            userId: result.user.id,
            username: result.user.username,
            action: 'LOGIN',
            details: 'User logged in successfully',
            ipAddress: req.ip || req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent']
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        // Log failed login attempt for security monitoring
        // Helps detect brute force attacks
        const { logActivity } = require('../audit/audit.service');
        await logActivity({
            username: req.body.username,
            action: 'LOGIN_FAILED',
            details: `Failed login attempt: ${error.message}`,
            ipAddress: req.ip || req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent']
        });

        res.status(401).json({ success: false, message: error.message });
    }
};

/**
 * Get Current User Profile
 * 
 * Returns authenticated user's profile from JWT token
 * 
 * @param {Object} req.user - User data from JWT (set by auth middleware)
 * @returns {Object} 200 - User profile data
 * @returns {Object} 401 - Not authenticated
 * 
 * Why return JWT data instead of DB query:
 * - Faster (no database call needed)
 * - JWT already contains essential user info
 * - Reduces database load
 * - Can optionally fetch full details if needed
 */
const profile = async (req, res) => {
    try {
        // JWT middleware should set req.user
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        // Optionally fetch full user details from DB if needed:
        // const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * User Logout
 * 
 * For stateless JWT, logout is client-side
 * Server just acknowledges the request
 * 
 * Why no server-side logout needed:
 * - JWT is stateless (no session to destroy)
 * - Token expiry handles security
 * - Client removes token from storage
 * - Token blacklisting would require database (defeats stateless purpose)
 */
const logout = async (req, res) => {
    // For stateless JWT, logout is handled on the client by removing the token
    res.status(200).json({ success: true, message: 'Logged out' });
};

/**
 * Forgot Password
 * 
 * Initiates password reset process
 * Sends reset link to user's email
 * 
 * @param {string} req.body.email - User's email address
 * @returns {Object} 200 - Reset email sent
 * @returns {Object} 400 - Invalid email or error
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        await AuthService.forgotPassword(email);
        res.status(200).json({ success: true, message: 'Reset email sent' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Reset Password
 * 
 * Completes password reset with token from email
 * 
 * @param {string} req.body.token - Reset token from email
 * @param {string} req.body.password - New password
 * @returns {Object} 200 - Password reset successful
 * @returns {Object} 400 - Invalid token or error
 */
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        await AuthService.resetPassword(token, password);
        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    login,
    profile,
    logout,
    forgotPassword,
    resetPassword
};
