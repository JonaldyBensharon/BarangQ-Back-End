const pool = require('../config/db');

// Buat user baru
async function createUser(username, password, store_name) {
    const query = `
        INSERT INTO users(username, password, store_name)
        VALUES($1, $2, $3)
        RETURNING *;
    `;
    const values = [username, password, store_name || 'Toko saya'];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Cari user berdasarkan username
async function findUserByUsername(username) {
    const query = `
        SELECT *
        FROM users
        WHERE username = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [username]);
    return rows[0];
}

module.exports = {
    createUser,
    findUserByUsername
};