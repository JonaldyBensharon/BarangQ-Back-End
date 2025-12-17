const dashboardService = require('../services/dashboardServices');

async function getDashboard(req, res) {
    try {
        const userId = req.user.id;
        const [income, products, sales, lowStock] = await Promise.all([
            dashboardService.getIncome(userId),
            dashboardService.getProductCount(userId),
            dashboardService.getSalesCount(userId),
            dashboardService.getLowStock(userId)
        ]);

        res.json({
            income,
            products,
            sales,
            lowStock
        });
    } catch (err) {
        console.error(err);
        res.status(500).json( "Gagal mengambil data dashboard: " + err.message );
    }
}

module.exports = {
    getDashboard
};
