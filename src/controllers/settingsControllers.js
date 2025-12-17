const settingsService = require('../services/settingsServices');

// GET
exports.getStoreInfo = async (req, res) => {
    try {
        const userId = req.user.id; 
        const storeData = await settingsService.getStoreInfoById(userId);

        if (!storeData) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        
        res.json(storeData);
    } catch (err) {
        console.error("Error di getStoreInfo:", err);
        res.status(500).json({ error: "Gagal mengambil data toko" });
    }
};

// PUT (UPDATE)
exports.updateStoreInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Pastikan 'delete_image' diambil dari req.body
        let { username, store_name, store_description, address, delete_image } = req.body;
        
        // ... (Logika imageUrl sama seperti sebelumnya) ...
        let imageUrl = null;
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        } else {
            imageUrl = req.body.store_image; 
        }

        const dataToUpdate = {
            username,
            store_name,
            store_description,
            address,
            store_image: imageUrl,
            delete_image: delete_image // <-- Ini harus terkirim
        };
        
        const updatedData = await settingsService.updateStoreInfo(userId, dataToUpdate);

        res.json({ 
            message: "Pengaturan toko berhasil disimpan", 
            user: updatedData 
        });

    } catch (err) {
        console.error("Error di updateStoreInfo:", err);
        res.status(500).json({ error: "Gagal menyimpan perubahan" });
    }
};