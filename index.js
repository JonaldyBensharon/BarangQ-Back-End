const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();
const PORT = 5001;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());

// LOGGING
app.use((req, res, next) => {
    console.log(`➡️  [${req.method}] ${req.url}`);
    next();
});

// --- 1. USER & SETTINGS ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) return res.status(401).json("Username tidak ditemukan");
        if (password !== user.rows[0].password) return res.status(401).json("Kata sandi salah");
        res.json(user.rows[0]);
    } catch (err) { res.status(500).json(err.message); } // <-- DIGANTI JADI JSON
});

app.post('/register', async (req, res) => {
    const { username, password, store_name } = req.body;
    try {
        const check = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (check.rows.length > 0) return res.status(400).json("Username sudah dipakai, ganti yang lain!");
        
        const newUser = await pool.query(
            "INSERT INTO users (username, password, store_name) VALUES ($1, $2, $3) RETURNING *",
            [username, password, store_name || 'Toko Saya']
        );
        res.json(newUser.rows[0]);
    } catch (err) { 
        console.error(err);
        res.status(500).json("Gagal mendaftar: " + err.message); // <-- DIGANTI JADI JSON
    }
});

app.put('/settings', async (req, res) => {
    const { id, username, password, store_name, store_description, address, store_image } = req.body;
    try {
        await pool.query(
            `UPDATE users SET username=$1, password=$2, store_name=$3, store_description=$4, address=$5, store_image=$6 WHERE id=$7`,
            [username, password, store_name, store_description, address, store_image, id]
        );
        const updatedUser = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
        res.json(updatedUser.rows[0]);
    } catch (err) { res.status(500).json(err.message); }
});

app.get('/user-info', async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM users LIMIT 1');
        if (user.rows.length > 0) res.json(user.rows[0]);
        else res.json({});
    } catch (err) { res.status(500).json(err.message); }
});

// --- 2. PRODUK ---
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json(err.message); }
});

app.post('/products', async (req, res) => {
    const { code, name, brand, description, image_url, buy_price, sell_price, stock } = req.body;
    try {
        const check = await pool.query('SELECT * FROM products WHERE name = $1 AND brand = $2', [name, brand]);
        if (check.rows.length > 0) {
            return res.status(400).json("Gagal: Barang ini sudah ada!");
        }

        await pool.query(
            'INSERT INTO products (code, name, brand, description, image_url, buy_price, sell_price, stock) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            [code, name, brand, description, image_url, buy_price, sell_price, stock]
        );
        res.json("Berhasil");
    } catch (err) { res.status(500).json(err.message); }
});

app.put('/products/:id', async (req, res) => {
    const { code, name, brand, description, image_url, buy_price, sell_price } = req.body;
    try {
        await pool.query(
            'UPDATE products SET code=$1, name=$2, brand=$3, description=$4, image_url=$5, buy_price=$6, sell_price=$7 WHERE id=$8',
            [code, name, brand, description, image_url, buy_price, sell_price, req.params.id]
        );
        res.json("Berhasil Update");
    } catch (err) { res.status(500).json(err.message); }
});

app.delete('/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json("Terhapus");
    } catch (err) { console.error(err); res.status(500).json(err.message); }
});

// --- 3. TAMBAH STOK ---
app.post('/add-stock', async (req, res) => {
    const { search_term, qty } = req.body; 
    try {
        const product = await pool.query(
            "SELECT * FROM products WHERE lower(name) = lower($1) OR code = $1", 
            [search_term]
        );

        if (product.rows.length === 0) {
            return res.status(404).json("Gagal: Barang tidak ditemukan!");
        }

        await pool.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [qty, product.rows[0].id]);
        await pool.query("INSERT INTO transactions (product_id, type, qty, total_price, profit) VALUES ($1, 'IN', $2, 0, 0)", [product.rows[0].id, qty]);

        res.json({ message: "Stok ditambah", new_stock: product.rows[0].stock + parseInt(qty) });
    } catch (err) { res.status(500).json(err.message); }
});

// --- 4. TRANSAKSI JUAL ---
app.post('/transactions', async (req, res) => {
    const { product_id, qty, total_price, profit } = req.body;
    try {
        await pool.query('BEGIN');
        const checkStock = await pool.query("SELECT stock FROM products WHERE id = $1", [product_id]);
        
        if (checkStock.rows[0].stock < qty) {
            await pool.query('ROLLBACK');
            return res.status(400).json("Stok tidak mencukupi!");
        }

        await pool.query("INSERT INTO transactions (product_id, type, qty, total_price, profit) VALUES ($1, 'OUT', $2, $3, $4)", [product_id, qty, total_price, profit]);
        await pool.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [qty, product_id]);

        await pool.query('COMMIT');
        res.json("Transaksi Berhasil");
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json("Gagal Transaksi: " + err.message);
    }
});

// --- 5. DATA DASHBOARD ---
app.get('/dashboard', async (req, res) => {
    try {
        const income = await pool.query("SELECT SUM(total_price) FROM transactions WHERE type='OUT'");
        const products = await pool.query("SELECT COUNT(*) FROM products");
        const sales = await pool.query("SELECT COUNT(*) FROM transactions WHERE type='OUT'");
        const lowStock = await pool.query("SELECT * FROM products WHERE stock < 5 LIMIT 5");
        
        res.json({
            income: income.rows[0].sum || 0,
            products: products.rows[0].count || 0,
            sales: sales.rows[0].count || 0,
            lowStock: lowStock.rows
        });
    } catch (err) { res.status(500).json(err.message); }
});

app.get('/reports', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.id, p.name, t.qty, t.total_price, t.profit, t.date, t.type
            FROM transactions t JOIN products p ON t.product_id = p.id
            ORDER BY t.date DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json(err.message); }
});

app.listen(PORT, () => {
    console.log(`✅ Server BARANGQ PRO berjalan di http://localhost:${PORT}`);
});