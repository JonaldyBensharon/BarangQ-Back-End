const pool = require('../config/db');

async function getAllProducts(userId) {
    const query = `
        SELECT *
        FROM products
        WHERE user_id = $1 AND is_deleted = FALSE
        ORDER BY id DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
}

async function checkProductExists(userId, name, brand) {
    const query = `
        SELECT *
        FROM products
        WHERE user_id = $1
        AND name = $2 
        AND brand = $3
        AND is_deleted = FALSE
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [userId, name, brand]);
    return rows[0];
}

async function checkCodeExists(userId, code) {
    if (!code) return null;
    const query = `
        SELECT *
        FROM products
        WHERE user_id = $1
        AND code = $2 
        AND is_deleted = FALSE
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [userId, code]);
    return rows[0];
}

async function createProduct(userId, data) {
    let { code, name, brand, description, buy_price, sell_price, stock } = data;

    code = code?.trim();

    if (!code) {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        code = `BRG-${randomNum}`;
    }

    const existingCode = await checkCodeExists(userId, code);
    if (existingCode) {
        throw new Error('Kode produk sudah digunakan. Gunakan kode lain.');
    }

    const query = `
        INSERT INTO products 
        (user_id, code, name, brand, description, buy_price, sell_price, stock)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        userId, code, name, brand, description, buy_price, sell_price, stock
    ]);

    return rows[0];
}

async function updateProduct(userId, productId, data) {
    let { code, name, brand, description, buy_price, sell_price } = data;

    code = code?.trim() || null;

    const existingCode = await checkCodeExists(userId, code);
    if (existingCode && existingCode.id !== parseInt(productId)) {
        throw new Error('Kode produk sudah digunakan. Gunakan kode lain.');
    }

    const query = `
        UPDATE products
        SET code=$1, name=$2, brand=$3, description=$4, buy_price=$5, sell_price=$6
        WHERE id=$7 AND user_id=$8
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [
        code, name, brand, description, buy_price, sell_price, parseInt(productId), userId
    ]);

    return rows[0];
}

async function deleteProduct(userId, productId) {
    const query = `
        UPDATE products 
        SET is_deleted = TRUE,
            code = code || '-DEL-' || CAST(EXTRACT(EPOCH FROM NOW()) AS INTEGER)
        WHERE id = $1 AND user_id = $2;
    `;
    await pool.query(query, [productId, userId]);
    return "Terhapus (Soft Delete)";
}

module.exports = {
    getAllProducts,
    checkProductExists,
    checkCodeExists,
    createProduct,
    updateProduct,
    deleteProduct
};