const Notification = require('./notification.model');

module.exports = {
    getNotifications: async (req, res) => {
        try {
            // Assuming req.user is populated by auth middleware
            // const userId = req.user.id; 
            // For now, return all or mock
            const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
            res.json({ success: true, data: notifications });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    markRead: async (req, res) => {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    }
};
