const pool = require('../config/db');

async function updateUserSettings(id, username, password, store_name, store_description, address, store_image) {
    const query = `
        UPDATE users 
        SET username=$1, password=$2, store_name=$3, store_description=$4, address=$5, store_image=$6 
        WHERE id=$7 
        RETURNING *;
    `;

    const values = [username, password, store_name, store_description, address, store_image, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

module.exports = {
    updateUserSettings
};
