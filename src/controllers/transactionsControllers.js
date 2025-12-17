const transactionService = require('../services/transactionsServices');

async function handleTransaction(req, res) {
    try {
        const userId = req.user.id;
        const { product_id, qty, total_price, profit } = req.body;

        if(!product_id || !Number.isInteger(product_id)){
            return res.status(400).json("product_id tidak valid");
        }

        if(!qty || !Number.isInteger(qty) || qty <= 0){
            return res.status(400).json("qty harus berupa angka bulat lebih dari 0.");
        }

        if(total_price == null || typeof total_price !== 'number' || qty < 0){
            return res.status(400).json("total_price tidak valid.");
        }

        if(profit == null || typeof profit !== 'number' || profit < 0){
            return res.status(400).json("profit tidak valid.");
        }

        const result = await transactionService.processSale({
            userId,
            product_id,
            qty,
            total_price,
            profit
        });

        res.json(result.message);

    } catch (err) {
        res.status(400).json("Transaksi gagal: " + err.message);
    }
}

module.exports = {
    handleTransaction
};
