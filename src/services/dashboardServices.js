const pool = require('../config/db');

async function getIncome() {
    const result = await pool.query(
        "SELECT SUM(total_price) FROM transactions WHERE type='OUT'"
    );
    return result.rows[0].sum || 0;
}

async function getProductCount() {
    const result = await pool.query(
        "SELECT COUNT(*) FROM products"
    );
    return result.rows[0].count || 0;
}

async function getSalesCount() {
    const result = await pool.query(
        "SELECT COUNT(*) FROM transactions WHERE type='OUT'"
    );
    return result.rows[0].count || 0;
}

async function getLowStock() {
    const result = await pool.query(
        "SELECT * FROM products WHERE stock < 5 LIMIT 5"
    );
    return result.rows;
}

module.exports = {
    getIncome,
    getProductCount,
    getSalesCount,
    getLowStock
};
