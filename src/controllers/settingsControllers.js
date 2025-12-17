const settingsService = require('../services/settingsServices');

exports.getStoreInfo = async (req, res) => {
    try {
        const userId = req.user.id; 
        const storeData = await settingsService.getStoreInfoById(userId);
        res.json(storeData || {});
    } catch (err) {
        console.error("Error get settings:", err);
        res.status(500).json({ error: "Gagal mengambil data" });
    }
};

exports.updateStoreInfo = async (req, res) => {
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