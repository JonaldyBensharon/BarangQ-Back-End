const productService = require('../services/productServices');

async function handleGetProducts(req, res) {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json(err.message);
    }
}

async function handleCreateProduct(req, res) {
    try {
        const data = req.body;

        const isExist = await productService.checkProductExists(data.name, data.brand);
        if (isExist) {
            return res.status(400).json("Gagal: Barang ini sudah ada!");
        }

        const result = await productService.createProduct(data);
        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json(err.message);
    }
}

async function handleUpdateProduct(req, res) {
    try {
        const id = req.params.id;
        const data = req.body;

        const result = await productService.updateProduct(id, data);
        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json(err.message);
    }
}

async function handleDeleteProduct(req, res) {
    try {
        const id = req.params.id;
        const result = await productService.deleteProduct(id);
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
