const pool = require('../config/db');

async function updateUserSettings(userId, {username, password, store_name, store_description, address, store_image}) {
    let query;
    let values;

    if(password){
        query = `
            UPDATE users 
            SET username=$1, password=$2, store_name=$3, store_description=$4, address=$5, store_image=$6 
            WHERE id=$7;
        `;

        values = [username, password, store_name, store_description, address, store_image, userId];
    } else{
        query = `
            UPDATE users 
            SET username=$1, store_name=$2, store_description=$3, address=$4, store_image=$5
            WHERE id=$6;
        `;

        values = [username, store_name, store_description, address, store_image, userId];
    }
    await pool.query(query, values);
    return "Data akun berhasil diperbarui";
}

module.exports = {
    updateUserSettings
};
