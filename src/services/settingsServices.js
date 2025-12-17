const pool = require('../config/db');

// 1. AMBIL DATA SETTINGS
async function getStoreInfoById(userId) {
    const query = `
        SELECT username, store_name, store_description, address, store_image 
        FROM users 
        WHERE id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
}

// 2. UPDATE DATA SETTINGS (VERSI DEBUG & KUAT)
async function updateStoreInfo(userId, data) {
    const currentData = await getStoreInfoById(userId);
    let finalImage = currentData.store_image; 

    // 👇 DEBUG: Lihat apa yang diterima backend di Terminal
    console.log("--- DEBUG UPDATE IMAGE ---");
    console.log("Image Baru:", data.store_image);
    console.log("Minta Hapus?:", data.delete_image, "(Tipe:", typeof data.delete_image, ")");

    // LOGIKA PRIORITAS:
    
    // 1. Jika ada upload file baru (Ada kata 'uploads')
    if (data.store_image && data.store_image.includes('/uploads/')) {
         console.log("Keputusan: PAKAI GAMBAR BARU");
         finalImage = data.store_image;
    }
    
    // 2. Jika user minta hapus (Kita convert ke String agar aman)
    //    Ini menangani 'true' (string) maupun true (boolean)
    else if (String(data.delete_image) === 'true') {
        console.log("Keputusan: HAPUS GAMBAR (JADI NULL)");
        finalImage = null; 
    }
    
    else {
        console.log("Keputusan: PERTAHANKAN GAMBAR LAMA");
    }

    const query = `
        UPDATE users 
        SET username = $1,
            store_name = $2, 
            store_description = $3, 
            address = $4, 
            store_image = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING username, store_name, store_description, address, store_image
    `;
    
    const values = [
        data.username,
        data.store_name, 
        data.store_description, 
        data.address, 
        finalImage, 
        userId
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
}

module.exports = {
    getStoreInfoById,
    updateStoreInfo
};