const pool = require('../config/db');

async function getAllReports(userId) {
    // Kita manfaatkan View 'vw_detail_transactions' yang sudah Anda buat.
    // View ini di-JOIN dengan tabel 'transactions' hanya untuk mengambil tanggal (created_at)
    // dan memfilter berdasarkan user_id.

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
        // Jika error, kemungkinan View belum dibuat di database
        return []; 
    }
}

module.exports = {
    getAllReports
};