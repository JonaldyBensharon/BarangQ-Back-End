const userService = require('../services/userServices');

// Registrasi user baru
async function registerUser(req, res) {
    try {
        const { username, password, store_name } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib diisi.' });
        }

        const existingUser = await userService.findUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username sudah digunakan. Silakan ganti username Anda.' });
        }

        const newUser = await userService.createUser(username, password, store_name);

        return res.status(201).json({
            message: 'Registrasi berhasil.',
            user: {
                id: newUser.id, 
                username: newUser.username,
                password: newUser.password,
                store_name: newUser.store_name
            }
        });
    } catch (err) {
        console.error('Error detail:', err);
        return res.status(500).json({ error: err.message, stack: err.stack });
    }
}

// Login user 
async function loginUser(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Nama pengguna dan kata sandi wajib diisi.' });
        }

        const user = await userService.findUserByUsername(username);
        if (!user) {
            return res.status(404).json({ error: 'Akun tidak ditemukan. Pastikan informasi sudah benar atau lakukan registrasi jika belum memiliki akun.' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Password salah.' });
        }

        return res.status(200).json({
            message: `Selamat datang kembali, ${user.username}!`,
            user: {
                id: user.id, 
                username: user.username,
                password: user.password,
                store_name: user.store_name
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

module.exports = {
    registerUser,
    loginUser
};