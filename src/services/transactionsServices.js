const pool = require('../config/db');

// Ambil stok produk
async function getStock(client,userId, productId) {
    const result = await client.query(
        `SELECT stock, buy_price, sell_price FROM products WHERE id = $1 AND user_id = $2`,
        [productId, userId]
    );
    return result.rows[0] ?? null;
}

// Kurangi stok produk
async function decreaseStock(client, userId, productId, qty) {
    await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2 AND user_id = $3`,
        [qty, productId, userId]
    );
}

async function processSale({ userId, items }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Tidak ada barang untuk dijual.');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        const transactionRes = await client.query(
            `INSERT INTO transactions (user_id) VALUES ($1) RETURNING id`,
            [userId]
        );

        const transactionId = transactionRes.rows[0].id;

        for (const item of items) {
            const { product_id, qty } = item;

            const product = await getStock(client, userId, product_id);
            if (!product) {
                throw new Error(`Produk dengan ID ${product_id} tidak ditemukan.`);
            }

            if (product.stock < qty) {
                throw new Error(`Stok produk "${product_id}" tidak mencukupi.`);
            }

            if(qty <= 0) {
                throw new Error(`Jumlah barang harus lebih dari 0`);
            }

            await client.query(
                `INSERT INTO detail_transactions
                (transaction_id, product_id, qty)
                VALUES ($1, $2, $3)`,
                [transactionId, product_id, qty]
            );

            await decreaseStock(client, userId, product_id, qty);
        } 
        await client.query('COMMIT');

        return {
            transaction_id: transactionId};
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function getTransactionDetail(transactionId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT *
             FROM vw_detail_transactions
             WHERE transaction_id = $1`,
            [transactionId]
        );

        if (!result.rows.length) {
            return { items: [], totalQty: 0, totalRevenue: 0, totalProfit: 0 };
        }

        const items = result.rows.map(row => ({
            id: row.id,
            product_id: row.product_id,
            product_name: row.product_name,
            qty: row.qty,
            buy_price: parseFloat(row.buy_price),
            sell_price: parseFloat(row.sell_price),
            subtotal: parseFloat(row.subtotal),
            profit: parseFloat(row.profit)
        }));

        const totalQty = items.reduce((acc, cur) => acc + cur.qty, 0);
        const totalRevenue = items.reduce((acc, cur) => acc + cur.subtotal, 0);
        const totalProfit = items.reduce((acc, cur) => acc + cur.profit, 0);

        return { items, totalQty, totalRevenue, totalProfit };
    } finally {
        client.release();
    }
}

async function getUserTransactions(userId, limit = 10) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT id, created_at
             FROM transactions
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    } finally {
        client.release();
    }
}

module.exports = {
    processSale,
    getTransactionDetail,
    getUserTransactions
};