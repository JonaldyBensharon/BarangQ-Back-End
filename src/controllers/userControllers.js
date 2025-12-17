const userService = require('../services/userServices');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const expiresIn = process.env.JWT_EXPIRES_IN?.trim() || '1d';

// Registrasi user baru
async function registerUser(req, res) {
    try {
        const { username, password, store_name } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib diisi.' });
        }

        if(typeof username !== 'string'){
            return res.status(400).json({error: "Username tidak valid."});
        }

        if(typeof password !== 'string'){
            return res.status(400).json({error: "Kata sandi tidak valid."});
        }

        const cleanUsername = username.trim();

        const existingUser = await userService.findUserByUsername(cleanUsername);
        if (existingUser) {
            return res.status(409).json({ error: 'Username sudah digunakan. Silakan ganti username Anda.' });
        }

        const pin = String(Math.floor(1000 + Math.random() * 9000));

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);

        const newUser = await userService.createUser(cleanUsername, passwordHash, store_name, pinHash);

        return res.status(201).json({
            message: 'Registrasi berhasil.',
            user: {
                id: newUser.id, 
                username: newUser.username,
                store_name: newUser.store_name,
                pin
            }
        });
    } catch (err) {
        console.error('Error detail:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

// Login user 
async function loginUser(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Nama pengguna dan kata sandi wajib diisi.' });
        }

        const cleanUsername = username.trim();

        const user = await userService.findUserByUsername(cleanUsername);
        if (!user) {
            return res.status(404).json({ error: 'Akun tidak ditemukan. Pastikan informasi sudah benar atau lakukan registrasi jika belum memiliki akun.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Kata sandi salah. Silakan coba lagi.' });

        const token = jwt.sign(
            {
                id: user.id, 
                username: user.username
            },
            process.env.JWT_SECRET, 
            {expiresIn}
        );

        return res.status(200).json({
            message: `Selamat datang kembali, ${user.username}!`,
            token,
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

async function handleGetUserInfo(req, res){
    try {
        const userId = req.user.id;
        const user = await userService.findUserById(userId);
        if(!user){
            return res.status(404).json({error: 'Akun tidak ditemukan.'})
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json(err.message);
    }
};

// Verifikasi PIN untuk pemulihan password
async function verifyPin(req, res) {
    try {
        const { username, pin } = req.body;
        if (!username || !pin) {
            return res.status(400).json({ error: 'Username dan PIN wajib diisi.' });
        }

        const user = await userService.verifyUserPin(username.trim(), pin);
        if (!user) {
            return res.status(401).json({ error: 'Username atau pin salah.' });
        }

        return res.status(200).json({ message: 'PIN terverifikasi.', username: user.username });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

// Reset password setelah verifikasi PIN
async function resetPassword(req, res) {
    try {
        const { username, newPassword } = req.body;
        if (!username || !newPassword) {
            return res.status(400).json({ error: 'Username dan password baru wajib diisi.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const updatedUser = await userService.updateUserPassword(username.trim(), passwordHash);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User tidak ditemukan.' });
        }

        return res.status(200).json({ message: 'Password berhasil diubah.', user: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    handleGetUserInfo,
    verifyPin,
    resetPassword
};