const pool = require('../config/db');
const bcrypt = require('bcrypt');

// 1. BUAT USER BARU (Diselaraskan dengan Controller baru)
async function createUser(userData) {
    // Kita terima dalam bentuk Object agar rapi
    const { username, password, store_name } = userData;
    
    // Hash password di sini (Service yang urus logic berat)
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate PIN 4 digit otomatis
    const pinPlain = Math.floor(1000 + Math.random() * 9000).toString();
    const pinHash = await bcrypt.hash(pinPlain, 10); // Hash PIN untuk keamanan

    const query = `
        INSERT INTO users(username, password_hash, store_name, pin_hash)
        VALUES($1, $2, $3, $4)
        RETURNING id, username, store_name;
    `;
    
    const values = [username, passwordHash, store_name || 'Toko Saya', pinHash];
    const { rows } = await pool.query(query, values);
    
    // Kembalikan data user + PIN ASLI (supaya bisa muncul di Popup Frontend sekali saja)
    return { ...rows[0], pin: pinPlain };
}

// 2. CARI USER
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

// 3. UPDATE PASSWORD
async function updateUserPassword(username, newPasswordHash) {
    const query = `
        UPDATE users
        SET password_hash = $1,
            updated_at = NOW()
        WHERE username = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [newPasswordHash, username]);
    return rows[0];
}

// 4. VERIFIKASI PIN
async function verifyUserPin(username, pinInput) {
    const user = await findUserByUsername(username);
    if (!user) return null;

    // Pastikan kolom di database Anda 'pin_hash' (sesuai fungsi create di atas)
    // Jika kolom di DB namanya 'pin', ganti user.pin_hash jadi user.pin
    const dbPin = user.pin_hash || user.pin; 

    if (!dbPin) return null;

    const match = await bcrypt.compare(pinInput, dbPin);
    if (!match) return null;

    return user;
}

// 5. HAPUS USER (INI YANG HILANG TADI!)
async function deleteUserById(userId) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
}

module.exports = {
    createUser,
    findUserByUsername,
    updateUserPassword,
    verifyUserPin,
    deleteUserById // <--- Pastikan ini ikut diexport!
};