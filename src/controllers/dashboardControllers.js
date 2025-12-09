const dashboardService = require('../services/dashboardServices');

async function getDashboard(req, res) {
    try {
        const income = await dashboardService.getIncome();
        const products = await dashboardService.getProductCount();
        const sales = await dashboardService.getSalesCount();
        const lowStock = await dashboardService.getLowStock();

        res.json({
            income,
            products,
            sales,
            lowStock
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getDashboard
};
