const pool = require('../config/db');

// Ambil stok produk
async function getStock(productId) {
    const result = await pool.query(
        "SELECT stock FROM products WHERE id = $1",
        [productId]
    );
    return result.rows[0]?.stock ?? null;
}

// Kurangi stok produk
async function decreaseStock(productId, qty) {
    await pool.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [qty, productId]
    );
}

// Catat transaksi keluar
async function logTransaction(productId, qty, total_price, profit) {
    await pool.query(
        `INSERT INTO transactions (product_id, type, qty, total_price, profit)
         VALUES ($1, 'OUT', $2, $3, $4)`,
        [productId, qty, total_price, profit]
    );
}

async function processSale({ product_id, qty, total_price, profit }) {
    await pool.query('BEGIN');

    try {
        const stock = await getStock(product_id);
        if (stock < qty) {
            await pool.query('ROLLBACK');
            return { error: "Stok tidak mencukupi!" };
        }

        await logTransaction(product_id, qty, total_price, profit);
        await decreaseStock(product_id, qty);

        await pool.query('COMMIT');
        return { message: "Transaksi Berhasil" };

    } catch (err) {
        await pool.query('ROLLBACK');
        throw new Error(err.message);
    }
}

module.exports = {
    getStock,
    decreaseStock,
    logTransaction,
    processSale
};
