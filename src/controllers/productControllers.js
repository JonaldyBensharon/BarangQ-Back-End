const productService = require('../services/productServices');

async function handleGetProducts(req, res) {
    try {
        const userId = req.user.id;
        const products = await productService.getAllProducts(userId);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json(err.message);
    }
}

async function handleCreateProduct(req, res) {
    try {
        const userId = req.user.id;
        const data = req.body;

        const isExist = await productService.checkProductExists(userId, data.name, data.brand);
        if (isExist) {
            return res.status(400).json("Gagal: Barang ini sudah ada!");
        }

        const result = await productService.createProduct(userId, data);
        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json(err.message);
    }
}

async function handleUpdateProduct(req, res) {
    try {
        const userId = req.user.id;
        const productId = req.params.id;
        const data = req.body;

        const result = await productService.updateProduct(userId, productId, data);
        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json(err.message);
    }
}

async function handleDeleteProduct(req, res) {
    try {
        const userId = req.user.id;
        const productId = req.params.id;
        const result = await productService.deleteProduct(userId, productId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json(err.message);
    }
}

module.exports = {
    handleGetProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct
};
