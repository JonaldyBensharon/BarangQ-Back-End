const transactionService = require('../services/transactionsServices');

async function handleTransaction(req, res) {
    try {
        const userId = req.user.id;
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Tidak ada barang yang dapat dijual." });
        }

        for (const item of items) {
            if (!item.product_id || !Number.isInteger(item.product_id)) {
                return res.status(400).json({ error: "product_id tidak valid pada salah satu item." });
            }
            if (!item.qty || !Number.isInteger(item.qty) || item.qty <= 0) {
                return res.status(400).json({ error: "qty harus berupa angka bulat lebih dari 0 pada salah satu item." });
            }
        }

        const result = await transactionService.processSale({ userId, items});

        res.json({
            message: "Transaksi berhasil",
            transaction_id: result.transaction_id
        });

    } catch (err) {
        res.status(400).json({error: "Transaksi gagal: " + err.message});
    }
}


async function getTransactionDetail(req, res) {
    try {
        const { transactionId } = req.params;

        if (!transactionId || isNaN(parseInt(transactionId))) {
            return res.status(400).json({ error: "transactionId tidak valid." });
        }

        const detail = await transactionService.getTransactionDetail(parseInt(transactionId));
        res.json(detail);

    } catch (err) {
        res.status(400).json({ error: "Gagal mengambil detail transaksi: " + err.message });
    }
}

async function getUserTransactions(req, res) {
    try {
        const userId = req.user.id;
        const transactions = await transactionService.getUserTransactions(userId);
        res.json(transactions);
    } catch (err) {
        res.status(400).json({ error: "Gagal mengambil daftar transaksi: " + err.message });
    }
}

module.exports = {
    handleTransaction,
    getTransactionDetail,
    getUserTransactions
};
