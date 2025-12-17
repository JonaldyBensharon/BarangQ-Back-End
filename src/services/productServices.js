const pool = require('../config/db');

async function getAllProducts(userId) {
    const query = `
        SELECT *
        FROM products
        WHERE user_id = $1
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
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [userId, name, brand]);
    return rows[0];
}

async function createProduct(userId, data) {
    const { code, name, brand, description, image_url, buy_price, sell_price, stock } = data;

    const query = `
        INSERT INTO products 
        (user_id, code, name, brand, description, image_url, buy_price, sell_price, stock)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9);
    `;

    await pool.query(query, [
        userId, code, name, brand, description, image_url, buy_price, sell_price, stock
    ]);

    return "Berhasil";
}

async function updateProduct(userId, productId, data) {
    const { code, name, brand, description, image_url, buy_price, sell_price } = data;

    const query = `
        UPDATE products
        SET code=$1, name=$2, brand=$3, description=$4, image_url=$5, buy_price=$6, sell_price=$7
        WHERE id=$8 AND user_id=$9;
    `;

    await pool.query(query, [
        code, name, brand, description, image_url, buy_price, sell_price, productId, userId
    ]);

    return "Berhasil Update";
}

async function deleteProduct(userId, productId) {
    const query = `DELETE FROM products WHERE id = $1 AND user_id = $2;`;
    await pool.query(query, [productId, userId]);
    return "Terhapus";
}

module.exports = {
    getAllProducts,
    checkProductExists,
    createProduct,
    updateProduct,
    deleteProduct
};
