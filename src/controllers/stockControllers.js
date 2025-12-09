const stockService = require('../services/stockServices');

async function handleAddStock(req, res) {
    try {
        const { search_term, qty } = req.body;

        const result = await stockService.addStock({ search_term, qty });

        if (!result) {
            return res.status(404).json("Gagal: Barang tidak ditemukan!");
        }

        res.json(result);
    } catch (err) {
        res.status(500).json(err.message);
    }
}

module.exports = {
    handleAddStock
};


