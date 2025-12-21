const pool = require('../config/db');

async function getIncome(userId) {
    const query = `
        SELECT COALESCE(SUM(v.subtotal), 0) AS income
        FROM vw_detail_transactions v
        JOIN transactions t ON v.transaction_id = t.id
        WHERE t.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return Number(result.rows[0].income);
}

async function getProductCount(userId) {
    const result = await pool.query(
        `SELECT COUNT(*) AS count
         FROM products
         WHERE user_id = $1`,
         [userId]
    );
    return Number(result.rows[0].count);
}

async function getSalesCount(userId) {
    const result = await pool.query(
        `SELECT COUNT(*) AS count
        FROM transactions 
        WHERE user_id = $1`, [userId]
    );
    return Number(result.rows[0].count);
}

async function getLowStock(userId) {
    const result = await pool.query(
        `SELECT id, name, stock 
        FROM products 
        WHERE user_id = $1 AND stock < 5 
        ORDER BY stock ASC
        LIMIT 5`, [userId]
    );
    return result.rows;
}

module.exports = {
    getIncome,
    getProductCount,
    getSalesCount,
    getLowStock
};