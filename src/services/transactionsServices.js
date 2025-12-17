const pool = require('../config/db');

// Ambil stok produk
async function getStock(client,userId, productId) {
    const result = await client.query(
        `SELECT stock FROM products WHERE id = $1 AND user_id = $2`,
        [productId, userId]
    );
    return result.rows[0]?.stock ?? null;
}

// Kurangi stok produk
async function decreaseStock(client, userId, productId, qty) {
    await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2 AND user_id = $3`,
        [qty, productId, userId]
    );
}

// Catat transaksi keluar
async function logTransaction(client, userId, productId, qty, total_price, profit) {
    await client.query(
        `INSERT INTO transactions (user_id, product_id, type, qty, total_price, profit)
         VALUES ($1, $2, 'OUT', $3, $4, $5)`,
        [userId, productId, qty, total_price, profit]
    );
}

async function processSale({ userId, product_id, qty, total_price, profit }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const stock = await getStock(client, userId, product_id);
        if(stock == null){
            throw new Error('Produk tidak ditemukan.');
        }

        if (stock < qty) {
            throw new Error('Stok tidak mencukupi.');
        }

        await logTransaction(client, userId, product_id, qty, total_price, profit);
        await decreaseStock(client, userId, product_id, qty);

        await client.query('COMMIT');
        return { message: "Transaksi Berhasil" };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    processSale
};
