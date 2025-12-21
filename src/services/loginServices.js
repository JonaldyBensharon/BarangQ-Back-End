const pool = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');      
const path = require('path');   

async function createUser(username, passwordHash, store_name, pinHash) {
    const query = `
        INSERT INTO users(username, password_hash, store_name, pin_hash)
        VALUES($1, $2, $3, $4)
        RETURNING id, username, store_name;
    `;
    const values = [username, passwordHash, store_name || 'Toko saya', pinHash];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

async function findUserByUsername(username) {
    const query = `
        SELECT *
        FROM users
        WHERE username = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [username]);
    return rows[0] || null;
}

async function findUserById(userId) {
    const query = `
        SELECT *
        FROM users
        WHERE id = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0] || null;
}

async function updateUserPassword(username, newPasswordHash) {
    const query = `
        UPDATE users
        SET password_hash = $1,
            updated_at = NOW()
        WHERE username = $2
        RETURNING id, username;
    `;
    const { rows } = await pool.query(query, [newPasswordHash, username]);
    return rows[0] || null;
}

async function verifyUserPin(username, pin) {
    const user = await findUserByUsername(username);
    if (!user || !user.pin_hash) return null;

    const match = await bcrypt.compare(pin, user.pin_hash);
    if (!match) return null;

    return {
        id: user.id,
        username: user.username
    };
}

module.exports = {
    createUser,
    findUserByUsername,
    findUserById,
    updateUserPassword,
    verifyUserPin
};