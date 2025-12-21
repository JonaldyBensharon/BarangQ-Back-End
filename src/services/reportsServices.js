const pool = require('../config/db');

async function getAllReports(userId) {
    const query = `
        SELECT 
            v.id,
            t.created_at AS date,
            v.product_name AS name,
            v.qty,
            v.subtotal AS total_price,
            v.profit
        FROM vw_detail_transactions v
        JOIN transactions t ON v.transaction_id = t.id
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
    `;

    try {
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error("Error SQL Report:", error.message);
        return []; 
    }
}

module.exports = {
    getAllReports
};