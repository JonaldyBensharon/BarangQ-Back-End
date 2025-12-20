const pool = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');      
const path = require('path');   
const { findUserByUsername } = require('./loginServices');

const SALT_ROUNDS = 10;

async function getStoreInfoById(userId) {
    const query = 'SELECT username, store_name, store_description, address, store_image FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
}

async function updateStoreInfo(userId, data) {
    const currentData = await getStoreInfoById(userId);
    if (!currentData) {
        throw new Error("User tidak ditemukan di database");
    }
    
    let finalImage = currentData.store_image; 
    
    if (data.store_image && data.store_image.includes('/uploads/')) {
         finalImage = data.store_image;
    } 
    else if (String(data.delete_image) === 'true') {
        finalImage = null; 
    }

    let finalUsername = data.username;
    if (!finalUsername || finalUsername.trim() === '') {
        finalUsername = currentData.username;
    }

    const query = `
        UPDATE users 
        SET 
            username = $1,
            store_name = $2, 
            store_description = $3, 
            address = $4, 
            store_image = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
    `;
    
    const values = [
        finalUsername,
        data.store_name, 
        data.store_description, 
        data.address, 
        finalImage, 
        userId
    ];
    
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (err) {
        console.error("SQL Error:", err.message);
        throw err;
    }
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

async function updateUserPassword(username, newPasswordHash) {
    const query = `
        UPDATE users SET password_hash = $1, updated_at = NOW()
        WHERE username = $2 RETURNING *;
    `;
    const { rows } = await pool.query(query, [newPasswordHash, username]);
    return rows[0];
}

async function changePasswordById(userId, oldPassword, newPassword) {
    const query = 'SELECT password_hash FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    const user = rows[0];

    if (!user) return { error: 'Username tidak ditemukan' };

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) return { error: 'Kata sandi lama salah' };

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newHash, userId]
    );

    return { success: true };
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
    getStoreInfoById,
    updateStoreInfo,
    verifyUserPin,
    changePasswordById,
    updateUserPassword,
    deleteUserById
};