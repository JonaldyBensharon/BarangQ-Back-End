const pool = require('../config/db');

async function getAllReports() {
    const result = await pool.query(`
        SELECT t.id, p.name, t.qty, t.total_price, t.profit, t.date, t.type
        FROM transactions t 
        JOIN products p ON t.product_id = p.id
        ORDER BY t.date DESC
    `);
    return result.rows;
}

module.exports = {
    getAllReports
};
