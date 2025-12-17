const pool = require('../config/db'); 
const userService = require('../services/userServices');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara';

exports.registerUser = async (req, res) => {
    try {
        const { username, password, store_name } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi.' });

        const existingUser = await userService.findUserByUsername(username);
        if (existingUser) return res.status(409).json({ error: 'Username sudah digunakan.' });
        const newUser = await userService.createUser({ username, password, store_name });

        return res.status(201).json({
            message: 'Registrasi berhasil.',
            user: {
                id: newUser.id, 
                username: newUser.username,
                store_name: newUser.store_name,
                pin: newUser.pin 
            }
        });
    } catch (err) {
        console.error('Error detail:', err);
        return res.status(500).json({ error: 'Gagal registrasi user' });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Wajib diisi.' });

        const user = await userService.findUserByUsername(username);
        if (!user) return res.status(404).json({ error: 'Akun tidak ditemukan.' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Kata sandi salah.' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            message: `Selamat datang, ${user.username}!`,
            token: token,
            user: { id: user.id, username: user.username, store_name: user.store_name }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

exports.handleGetUserInfo = async (req, res) => {
    try {
        const username = req.user?.username; 
        const data = await userService.findUserByUsername(username);
        res.json(data ?? {});
    } catch (err) {
        res.status(500).json(err.message);
    }
};

exports.verifyPin = async (req, res) => {
    try {
        const { username, pin } = req.body;
        const user = await userService.verifyUserPin(username, pin);
        if (!user) return res.status(401).json({ error: 'Username atau pin salah.' });
        return res.status(200).json({ message: 'PIN terverifikasi.', username: user.username });
    } catch (err) {
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await userService.updateUserPassword(username, passwordHash);
        return res.status(200).json({ message: 'Password berhasil diubah.' });
    } catch (err) {
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [userId]);
        const user = rows[0];

        if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

        const match = await bcrypt.compare(oldPassword, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Password lama salah.' });

        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await userService.updateUserPassword(user.username, newPasswordHash);

        return res.json({ message: 'Password berhasil diperbarui.' });
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengganti password.' });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const deletedUser = await userService.deleteUserById(userId);

        if (!deletedUser) return res.status(404).json({ error: 'User tidak ditemukan.' });
        
        return res.json({ message: 'Akun berhasil dihapus permanen.' });
    } catch (err) {
        console.error("Error delete account:", err); 
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Gagal hapus akun karena masih ada data Produk/Transaksi.' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}