const settingsService = require('../services/settingsServices');
const bcrypt = require('bcrypt');

async function updateSettings(req, res) {
    try {
        const userId = req.user.id;
        const { username, password, store_name, store_description, address, store_image } = req.body;

        if(!username || typeof username !== 'string'){
            return res.status(400).json("Username tidak valid");
        }

        const cleanUsername = username.trim();

        let hashedPassword;
        if(password){
            if(typeof password !== 'string' || password.length < 5){
                return res.status(400).json("Kata sandi minimal terdiri atas 5 karakter.");
            }
            hashedPassword = await bcrypt.hash(password, 10);
        }
        const result = await settingsService.updateUserSettings(userId, {username: cleanUsername, password: hashedPassword, store_name, store_description, address, store_image});
        res.json(result);
    } catch (err) {
        console.error(err);
        if(err.code === '23505'){
            return res.status(400).json("Username sudah digunakan.");
        }
        res.status(500).json("Gagal memperbarui pengaturan akun");
    }
}

module.exports = {
    updateSettings
};
