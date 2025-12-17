const pool = require('../config/db'); // Import pool (penting untuk changePassword)
const userService = require('../services/userServices');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara';

// 1. REGISTRASI USER BARU (Sudah diperbaiki agar cocok dengan Service)
async function registerUser(req, res) {
    try {
        const { username, password, store_name } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib diisi.' });
        }

        // Cek user duplikat
        const existingUser = await userService.findUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username sudah digunakan. Silakan ganti username Anda.' });
        }

        // ✅ PERBAIKAN:
        // Tidak perlu hash password/PIN di sini, Service yang akan melakukannya.
        // Kirim data sebagai satu object { ... }
        const newUser = await userService.createUser({ username, password, store_name });

        return res.status(201).json({
            message: 'Registrasi berhasil.',
            user: {
                id: newUser.id, 
                username: newUser.username,
                store_name: newUser.store_name,
                pin: newUser.pin // PIN asli dari service untuk ditampilkan di Popup
            }
        });
    } catch (err) {
        console.error('Error detail:', err);
        return res.status(500).json({ error: 'Gagal registrasi user', stack: err.stack });
    }
}

// 2. LOGIN USER
async function loginUser(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Nama pengguna dan kata sandi wajib diisi.' });
        }

        const user = await userService.findUserByUsername(username);
        if (!user) {
            return res.status(404).json({ error: 'Akun tidak ditemukan.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Kata sandi salah.' });

        // Buat Token
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: `Selamat datang kembali, ${user.username}!`,
            token: token,
            user: {
                id: user.id, 
                username: user.username,
                store_name: user.store_name
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

// 3. GET USER INFO
async function handleGetUserInfo(req, res){
    try {
        const username = req.user?.username; 
        const data = await userService.findUserByUsername(username);
        res.json(data ?? {});
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// 4. VERIFIKASI PIN
async function verifyPin(req, res) {
    try {
        const { username, pin } = req.body;
        if (!username || !pin) {
            return res.status(400).json({ error: 'Username dan PIN wajib diisi.' });
        }

        const user = await userService.verifyUserPin(username, pin);
        if (!user) {
            return res.status(401).json({ error: 'Username atau pin salah.' });
        }

        return res.status(200).json({ message: 'PIN terverifikasi.', username: user.username });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

// 5. RESET PASSWORD
async function resetPassword(req, res) {
    try {
        const { username, newPassword } = req.body;
        if (!username || !newPassword) {
            return res.status(400).json({ error: 'Username dan password baru wajib diisi.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const updatedUser = await userService.updateUserPassword(username, passwordHash);
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User tidak ditemukan.' });
        }

        return res.status(200).json({ message: 'Password berhasil diubah.', user: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

// 6. GANTI PASSWORD (LOGGED IN)
async function changePassword(req, res) {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        // Ambil data user lengkap
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
        console.error(err);
        res.status(500).json({ error: 'Gagal mengganti password.' });
    }
}

// 7. HAPUS AKUN PERMANEN (Sudah diperbaiki pakai Service)
async function deleteAccount(req, res) {
    try {
        const userId = req.user.id;
        
        // ✅ PERBAIKAN: Panggil Service, jangan query manual agar konsisten
        const deletedUser = await userService.deleteUserById(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User tidak ditemukan atau sudah terhapus.' });
        }

        return res.json({ message: 'Akun berhasil dihapus permanen.' });
    } catch (err) {
        console.error("Error delete account:", err); 
        
        // Cek Error Foreign Key (Jika user punya data Produk/Transaksi)
        if (err.code === '23503') {
            return res.status(400).json({ 
                error: 'Gagal hapus akun karena masih ada data Produk/Transaksi yang terhubung.' 
            });
        }
        
        res.status(500).json({ error: 'Terjadi kesalahan server saat menghapus akun.' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    handleGetUserInfo,
    verifyPin,
    resetPassword,
    changePassword, 
    deleteAccount
};