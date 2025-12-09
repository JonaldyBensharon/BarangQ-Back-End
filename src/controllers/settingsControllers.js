const settingsService = require('../services/settingsServices');

async function updateSettings(req, res) {
    try {
        const { id, username, password, store_name, store_description, address, store_image } = req.body;

        const updatedUser = await settingsService.updateUserSettings(id, username, password, store_name, store_description, address, store_image);
        return res.status(200).json(updatedUser);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    updateSettings
};
