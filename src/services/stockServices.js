// src/services/stockService.js
const pool = require('../config/db');

// Cari produk berdasarkan nama atau kode
async function findProduct(search_term) {
    const result = await pool.query(
        "SELECT * FROM products WHERE lower(name) = lower($1) OR code = $1",
        [search_term]
    );
    return result.rows[0] || null;
}

// Update stok
async function incrementStock(productId, qty) {
    await pool.query(
        "UPDATE products SET stock = stock + $1 WHERE id = $2",
        [qty, productId]
    );
}

// Catat transaksi
async function logStockTransaction(productId, qty) {
    await pool.query(
        "INSERT INTO transactions (product_id, type, qty, total_price, profit) VALUES ($1, 'IN', $2, 0, 0)",
        [productId, qty]
    );
}

async function addStock({ search_term, qty }) {
    const product = await findProduct(search_term);
    if (!product) return null;

    await incrementStock(product.id, qty);
    await logStockTransaction(product.id, qty);

    return {
        message: "Stok ditambah",
        new_stock: product.stock + parseInt(qty)
    };
}

module.exports = {
    findProduct,
    incrementStock,
    logStockTransaction,
    addStock,
};
