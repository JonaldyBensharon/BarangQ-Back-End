const stockService = require('../services/stockServices');

async function handleAddStock(req, res) {
    try {
        const userId = req.user.id;
        const { search_term, qty } = req.body;

        if(!search_term || typeof search_term !== 'string'){
            return res.status(400).json("search_term tidak valid");
        }

        if(!Number.isInteger(qty) || qty <= 0){
            return res.status(400).json("qty harus berupa angka bulat lebih dari 0.");
        }

        const result = await stockService.addStock({ userId, search_term, qty });

        res.json(result);
    } catch (err) {
        res.status(400).json("Gagal menambah stok: " + err.message);
    }
}

module.exports = {
    handleAddStock
};