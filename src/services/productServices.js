const pool = require('../config/db');

async function getAllProducts() {
    const query = `
        SELECT *
        FROM products
        ORDER BY id DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
}

async function checkProductExists(name, brand) {
    const query = `
        SELECT *
        FROM products
        WHERE name = $1 AND brand = $2
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [name, brand]);
    return rows[0];
}

async function createProduct(data) {
    const { code, name, brand, description, image_url, buy_price, sell_price, stock } = data;

    const query = `
        INSERT INTO products 
        (code, name, brand, description, image_url, buy_price, sell_price, stock)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8);
    `;

    await pool.query(query, [
        code, name, brand, description, image_url, buy_price, sell_price, stock
    ]);

    return "Berhasil";
}

async function updateProduct(id, data) {
    const { code, name, brand, description, image_url, buy_price, sell_price } = data;

    const query = `
        UPDATE products
        SET code=$1, name=$2, brand=$3, description=$4, image_url=$5, buy_price=$6, sell_price=$7
        WHERE id=$8
    `;

    await pool.query(query, [
        code, name, brand, description, image_url, buy_price, sell_price, id
    ]);

    return "Berhasil Update";
}

async function deleteProduct(id) {
    const query = `DELETE FROM products WHERE id = $1`;
    await pool.query(query, [id]);
    return "Terhapus";
}


module.exports = {
    getAllProducts,
    checkProductExists,
    createProduct,
    updateProduct,
    deleteProduct
};
