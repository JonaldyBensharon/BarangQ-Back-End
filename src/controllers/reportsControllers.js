const reportsService = require('../services/reportsServices');

async function getReports(req, res) {
    try {
        const userId = req.user.id;
        const reports = await reportsService.getAllReports(userId);
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json("Gagal mengambil laporan: " + err.message );
    }
}

module.exports = {
    getReports
};
