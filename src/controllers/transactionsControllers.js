const transactionService = require('../services/transactionsServices');

async function handleTransaction(req, res) {
    try {
        const { product_id, qty, total_price, profit } = req.body;

        const result = await transactionService.processSale({
            product_id,
            qty,
            total_price,
            profit
        });

        if (result.error) {
            return res.status(400).json(result.error);
        }

        res.json(result.message);

    } catch (err) {
        res.status(500).json("Transaksi gagal: " + err.message);
    }
}

module.exports = {
    handleTransaction
};
