const pool = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');      
const path = require('path');   


async function createUser(userData) {
    const { username, password, store_name } = userData;
    const passwordHash = await bcrypt.hash(password, 10);
    const pinPlain = Math.floor(1000 + Math.random() * 9000).toString(); 
    const pinHash = await bcrypt.hash(pinPlain, 10);

    const query = `
        INSERT INTO users(username, password_hash, store_name, pin_hash)
        VALUES($1, $2, $3, $4)
        RETURNING id, username, store_name;
    `;
    
    const values = [username, passwordHash, store_name || 'Toko Saya', pinHash];
    const { rows } = await pool.query(query, values);
    
    return { ...rows[0], pin: pinPlain };
}

async function findUserByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
    const { rows } = await pool.query(query, [username]);
    return rows[0];
}

async function updateUserPassword(username, newPasswordHash) {
    const query = `
        UPDATE users SET password_hash = $1, updated_at = NOW()
        WHERE username = $2 RETURNING *;
    `;
    const { rows } = await pool.query(query, [newPasswordHash, username]);
    return rows[0];
}

async function verifyUserPin(username, pinInput) {
    const user = await findUserByUsername(username);
    if (!user) return null;

    const dbPin = user.pin_hash || user.pin; 
    if (!dbPin) return null;

    const match = await bcrypt.compare(pinInput, dbPin);
    if (!match) return null;

    return user;
}

async function deleteUserById(userId) {
    const findQuery = 'SELECT store_image FROM users WHERE id = $1';
    const { rows: findRows } = await pool.query(findQuery, [userId]);
    const user = findRows[0];

    if (user && user.store_image) {
        try {
            const filename = user.store_image.split('/').pop(); 
            const filePath = path.join(__dirname, '../../uploads', filename); 

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); 
                console.log(`[Service] File fisik berhasil dihapus: ${filename}`);
            }
        } catch (err) {
            console.error("[Service] Gagal menghapus file fisik (lanjut hapus DB):", err);
        }
    }

    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
}

module.exports = {
    createUser,
    findUserByUsername,
    updateUserPassword,
    verifyUserPin,
    deleteUserById
};