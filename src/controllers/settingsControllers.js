const settingsService = require('../services/settingsServices');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function getStoreInfo(req, res) {
    try {
        const userId = req.user.id; 
        const storeData = await settingsService.getStoreInfoById(userId);
        res.json(storeData || {});
    } catch (err) {
        console.error("Error get settings:", err);
        res.status(500).json({ error: "Gagal mengambil data" });
    }
};

async function updateStoreInfo(req, res) {
    try {
        const userId = req.user.id;
        const data = { ...req.body };
        
        if (req.file) {
            data.store_image = `/uploads/${req.file.filename}`;
        }
        
        console.log("Request Body:", req.body);
        console.log("Request File:", req.file);

        const updatedStore = await settingsService.updateStoreInfo(userId, data);
        res.json({ message: "Profil berhasil diperbarui", user: updatedStore });
        
    } catch (err) {
        console.error("Error update settings:", err);
        res.status(500).json({ error: "Gagal menyimpan perubahan" });
    }
};

// Verifikasi PIN untuk pemulihan password
async function verifyPin(req, res) {
    try {
        const { username, pin } = req.body;
        const user = await settingsService.verifyUserPin(username, pin);
        if (!user) return res.status(401).json({ error: 'Username atau pin salah.' });
        return res.status(200).json({ message: 'PIN terverifikasi.', username: user.username });
    } catch (err) {
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Input kata sandi tidak lengkap.' });
        }

        const result = await settingsService.changePasswordById(
            userId,
            oldPassword,
            newPassword
        );

        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        return res.json({ message: 'Kata sandi berhasil diperbarui.' });
    } catch (err) {
        console.error('[changePassword]', err);
        res.status(500).json({ error: 'Gagal mengganti kata sandi.' });
    }
}

async function resetPassword(req, res) {
    try {
        const { username, newPassword } = req.body;
        if(!username || !newPassword){
            return res.status(400).json({error: 'Data tidak lengkap'});
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await settingsService.updateUserPassword(username, passwordHash);

        return res.status(200).json({ message: 'Kata sandi berhasil diubah.' });
    } catch (err) {
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
}

async function deleteAccount(req, res) {
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

module.exports = {
    getStoreInfo,
    updateStoreInfo,
    verifyPin,
    changePassword,
    resetPassword,
    deleteAccount
};