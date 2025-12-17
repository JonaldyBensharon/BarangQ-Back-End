const pool = require('../config/db');

async function getAllReports(userId) {
    const result = await pool.query(`
        SELECT 
        t.id, 
        t.created_at AS date,
        t.type,
        t.qty,
        t.total_price,
        t.profit,
        p.name AS product_name
        FROM transactions t 
        JOIN products p ON t.product_id = p.id
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
    `, [userId]);
    return result.rows;
}

module.exports = {
    getAllReports
};
