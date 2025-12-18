const settingsService = require('../services/settingsServices');

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
        const user = await userService.verifyUserPin(username, pin);
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
    deleteAccount
};