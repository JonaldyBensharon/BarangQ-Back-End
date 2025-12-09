const reportsService = require('../services/reportsServices');

async function getReports(req, res) {
    try {
        const reports = await reportsService.getAllReports();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getReports
};
