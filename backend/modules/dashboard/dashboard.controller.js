const Sale = require('../sales/sale.model');
const Product = require('../inventory/product.model');
const User = require('../user/user.model');

const getStats = async (req, res) => {
    try {
        const totalSales = await Sale.countDocuments();
        const totalProducts = await Product.countDocuments();
        const lowStock = await Product.countDocuments({ stock: { $lte: 10 } }); // Assuming 10 is global threshold
        const totalUsers = await User.countDocuments();

        res.json({
            success: true,
            data: {
                totalSales,
                totalProducts,
                lowStock,
                totalUsers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStats };
