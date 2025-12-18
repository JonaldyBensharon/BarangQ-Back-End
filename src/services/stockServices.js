const pool = require('../config/db');

// Cari produk berdasarkan nama atau kode
async function findProduct(client, userId, search_term) {
    const result = await client.query(
        `SELECT * FROM products 
        WHERE user_id = $1
        AND (lower(name) = lower($2) OR code = $2)
        LIMIT 1`,
        [userId, search_term]
    );
    return result.rows[0] || null;
}

async function incrementStock(client, userId, productId, qty) {
    await client.query(
        `UPDATE products SET stock = stock + $1 
        WHERE id = $2 AND user_id = $3`,
        [qty, productId, userId]
    );
}

async function addStock({ userId, search_term, qty }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Cari Produk
        const product = await findProduct(client, userId, search_term);
        if (!product) {
            throw new Error('Produk tidak ditemukan.');
        }

        // 2. Update Stok (Tanpa Insert ke Transactions)
        await incrementStock(client, userId, product.id, qty);
        
        await client.query('COMMIT');

        return {
            message: `Berhasil menambah stok ${product.name}`,
            new_stock: product.stock + qty
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    addStock
};