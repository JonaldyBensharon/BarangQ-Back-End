const pool = require('../config/db');

async function findProduct(client, userId, search_term) {
    const codeQuery = `
        SELECT * FROM products 
        WHERE user_id = $1 
        AND code = $2
        AND is_deleted = FALSE
    `;
    const codeResult = await client.query(codeQuery, [userId, search_term]);

    if (codeResult.rows.length > 0) {
        return codeResult.rows[0];
    }

    const nameQuery = `
        SELECT * FROM products 
        WHERE user_id = $1 
        AND lower(name) = lower($2)
        AND is_deleted = FALSE
    `;
    const nameResult = await client.query(nameQuery, [userId, search_term]);

    if (nameResult.rows.length > 1) {
        throw new Error(`Ditemukan ${nameResult.rows.length} barang dengan nama "${search_term}". Harap masukkan KODE barang agar spesifik.`);
    }

    return nameResult.rows[0] || null;
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
        
        const product = await findProduct(client, userId, search_term);
        if (!product) {
            throw new Error('Produk tidak ditemukan atau sudah dihapus.');
        }

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