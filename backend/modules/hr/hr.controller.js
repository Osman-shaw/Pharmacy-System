const Employee = require('./employee.model');
const Attendance = require('./attendance.model');
const Payroll = require('./payroll.model');
const Designation = require('./designation.model');
const { validationResult } = require('express-validator');

// --- EMPLOYEES ---

exports.getEmployees = async (req, res) => {
    try {
        const { status, department, designation } = req.query;
        let query = {};

        if (status) query.status = status;
        if (department) query.department = department;
        if (designation) query.designation = designation;

        const employees = await Employee.find(query)
            .populate('designation', 'name department')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(employees);
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('designation')
            .populate('user');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Verify designation exists
        const designation = await Designation.findById(req.body.designation);
        if (!designation) {
            return res.status(404).json({ message: 'Designation not found' });
        }

        // Generate employeeId if not provided
        if (!req.body.employeeId) {
            const count = await Employee.countDocuments();
            req.body.employeeId = `EMP-${Date.now().toString().slice(-6)}-${count + 1}`;
        }

        const employee = new Employee(req.body);
        if (req.body.image) {
            employee.image = req.body.image;
        }
        await employee.save();

        const populated = await Employee.findById(employee._id)
            .populate('designation')
            .populate('user');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Create employee error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Employee with this email or ID already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        if (req.body.designation) {
            const designation = await Designation.findById(req.body.designation);
            if (!designation) {
                return res.status(404).json({ message: 'Designation not found' });
            }
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { ...req.body, image: req.body.image || undefined },
            { new: true, runValidators: true }
        )
            .populate('designation')
            .populate('user');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { status: 'terminated' },
            { new: true }
        );
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee terminated successfully' });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// --- DESIGNATIONS ---

exports.getDesignations = async (req, res) => {
    try {
        const designations = await Designation.find().sort({ name: 1 });
        res.json(designations);
    } catch (error) {
        console.error('Get designations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDesignationById = async (req, res) => {
    try {
        const designation = await Designation.findById(req.params.id);
        if (!designation) {
            return res.status(404).json({ message: 'Designation not found' });
        }
        res.json(designation);
    } catch (error) {
        console.error('Get designation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createDesignation = async (req, res) => {
    try {
        const { name, department, description } = req.body;

        let designation = await Designation.findOne({ name });
        if (designation) {
            return res.status(400).json({ message: 'Designation already exists' });
        }

        designation = new Designation({
            name,
            department,
            description
        });

        await designation.save();
        res.status(201).json(designation);
    } catch (error) {
        console.error('Create designation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateDesignation = async (req, res) => {
    try {
        const designation = await Designation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!designation) {
            return res.status(404).json({ message: 'Designation not found' });
        }
        res.json(designation);
    } catch (error) {
        console.error('Update designation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteDesignation = async (req, res) => {
    try {
        // Check if employees are using this designation
        const employeesUsing = await Employee.countDocuments({ designation: req.params.id });
        if (employeesUsing > 0) {
            return res.status(400).json({ message: 'Cannot delete designation currently assigned to employees' });
        }

        const designation = await Designation.findByIdAndDelete(req.params.id);
        if (!designation) {
            return res.status(404).json({ message: 'Designation not found' });
        }
        res.json({ message: 'Designation deleted successfully' });
    } catch (error) {
        console.error('Delete designation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// --- ATTENDANCE ---

exports.getAttendance = async (req, res) => {
    try {
        const { employee, startDate, endDate, status } = req.query;
        let query = {};

        if (req.user.role !== 'admin') {
            const linkedEmployee = await Employee.findOne({ user: req.user.userId });
            if (!linkedEmployee) {
                return res.json([]);
            }
            query.employee = linkedEmployee._id;
        } else if (employee) {
            query.employee = employee;
        }

        if (status) query.status = status;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const attendance = await Attendance.find(query)
            .populate('employee', 'firstName lastName employeeId designation')
            .populate('markedBy', 'name')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { employee, date } = req.body;

        // Security: Non-admins can only check in themselves
        if (req.user.role !== 'admin') {
            const linkedEmployee = await Employee.findOne({ user: req.user.userId });
            if (!linkedEmployee) {
                return res.status(400).json({ message: 'No employee profile linked to your account' });
            }
            employee = linkedEmployee._id;
        } else if (!employee) {
            return res.status(400).json({ message: 'Employee is required' });
        }
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        // Check if attendance already exists
        let attendance = await Attendance.findOne({
            employee,
            date: attendanceDate
        });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({ message: 'Already checked in for this date' });
        }

        if (attendance) {
            attendance.checkIn = new Date();
            attendance.status = 'present';
        } else {
            attendance = new Attendance({
                employee,
                date: attendanceDate,
                checkIn: new Date(),
                status: 'present',
                markedBy: req.user.userId
            });
        }

        await attendance.save();

        const populated = await Attendance.findById(attendance._id)
            .populate('employee', 'firstName lastName employeeId')
            .populate('markedBy', 'name');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { employee, date, breakDuration } = req.body;

        // Security: Non-admins can only check out themselves
        if (req.user.role !== 'admin') {
            const linkedEmployee = await Employee.findOne({ user: req.user.userId });
            if (!linkedEmployee) {
                return res.status(400).json({ message: 'No employee profile linked to your account' });
            }
            employee = linkedEmployee._id;
        } else if (!employee) {
            return res.status(400).json({ message: 'Employee is required' });
        }
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employee,
            date: attendanceDate
        });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({ message: 'Must check in first' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out for this date' });
        }

        attendance.checkOut = new Date();
        if (breakDuration !== undefined) {
            attendance.breakDuration = breakDuration;
        }
        attendance.markedBy = req.user.userId;

        await attendance.save();

        const populated = await Attendance.findById(attendance._id)
            .populate('employee', 'firstName lastName employeeId')
            .populate('markedBy', 'name');

        res.json(populated);
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- PAYROLL ---

exports.getPayrolls = async (req, res) => {
    try {
        const { employee, startDate, endDate, status } = req.query;
        let query = {};

        if (employee) query.employee = employee;
        if (status) query.status = status;
        if (startDate || endDate) {
            query['payPeriod.startDate'] = {};
            if (startDate) query['payPeriod.startDate'].$gte = new Date(startDate);
            if (endDate) query['payPeriod.endDate'].$lte = new Date(endDate);
        }

        const payrolls = await Payroll.find(query)
            .populate('employee', 'firstName lastName employeeId designation')
            .populate('processedBy', 'name')
            .sort({ 'payPeriod.startDate': -1 });

        res.json(payrolls);
    } catch (error) {
        console.error('Get payroll error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createPayroll = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const employee = await Employee.findById(req.body.employee);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const { paymentMethod, items, paymentDetails } = req.body;

        // Calculate totals preliminarily to get net amount for payment
        const totalEarnings = items
            .filter(item => !item.isDeduction)
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const totalDeductions = items
            .filter(item => item.isDeduction)
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const netPay = totalEarnings - totalDeductions;

        let transactionInfo = {};
        let payrollStatus = 'processed';

        // Handle Mobile Money Payment
        if (paymentMethod === 'orange_money' || paymentMethod === 'afrimoney') {
            if (!paymentDetails || !paymentDetails.phoneNumber) {
                return res.status(400).json({ message: 'Phone number is required for mobile money payment' });
            }

            try {
                const PaymentService = require('../../payment/payment.service');
                const paymentResult = await PaymentService.initiatePayment({
                    amount: netPay,
                    method: paymentMethod,
                    phoneNumber: paymentDetails.phoneNumber,
                    payerName: 'Pharmacy Payroll'
                });

                transactionInfo = {
                    phoneNumber: paymentDetails.phoneNumber,
                    transactionId: paymentResult.transactionId,
                    providerReference: paymentResult.gatewayReference,
                    status: paymentResult.status
                };

                // If payment initiated successfully
                if (paymentResult.status === 'successful' || paymentResult.status === 'pending') {
                    payrollStatus = 'paid';
                }
            } catch (err) {
                console.error('Payment initiation failed:', err);
                return res.status(500).json({ message: 'Failed to initiate mobile money payment: ' + err.message });
            }
        }

        const payroll = new Payroll({
            ...req.body,
            status: payrollStatus,
            paymentDetails: { ...paymentDetails, ...transactionInfo },
            processedBy: req.user.userId
        });

        await payroll.save();

        const populated = await Payroll.findById(payroll._id)
            .populate('employee', 'firstName lastName employeeId')
            .populate('processedBy', 'name');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Create payroll error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 
