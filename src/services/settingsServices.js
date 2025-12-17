const pool = require('../config/db');

async function getStoreInfoById(userId) {
    const query = 'SELECT username, store_name, store_description, address, store_image FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
}

async function updateStoreInfo(userId, data) {
    const currentData = await getStoreInfoById(userId);
    
    let finalImage = currentData.store_image; 
    
    if (data.store_image && data.store_image.includes('/uploads/')) {
         finalImage = data.store_image; 
    } else if (String(data.delete_image) === 'true') {
        finalImage = null; r
    }

    let finalUsername = data.username;
    if (!finalUsername || finalUsername.trim() === '') {
        finalUsername = currentData.username;
    }

    console.log("--- DEBUG UPDATE ---");
    console.log("Username Final:", finalUsername);
    console.log("Gambar Final:", finalImage);

    const query = `
        UPDATE users 
        SET 
            username = $1,
            store_name = $2, 
            store_description = $3, 
            address = $4, 
            store_image = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
    `;
    
    const values = [
        finalUsername, 
        data.store_name, 
        data.store_description, 
        data.address, 
        finalImage, 
        userId
    ];
    
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (err) {
        console.error("SQL Error:", err.message);
        throw err;
    }
}

module.exports = {
    getStoreInfoById,
    updateStoreInfo
};