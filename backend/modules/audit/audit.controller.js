const AuditLog = require('./audit.model');

exports.getLogs = async (req, res) => {
    try {
        const { username, action, startDate, endDate, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (username) filter.username = new RegExp(username, 'i');
        if (action) filter.action = action;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(filter)
            .populate('user', 'fullName')
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await AuditLog.countDocuments(filter);

        res.json({
            success: true,
            data: logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalLogs: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
