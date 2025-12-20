const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());

// LOGGING
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

// Impor routes
const loginRoutes = require('./src/routes/loginRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const productRoutes = require('./src/routes/productRoutes');
const stockRoutes = require('./src/routes/stockRoutes');
const transactionRoutes = require('./src/routes/transactionsRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const reportsRoutes = require('./src/routes/reportsRoutes');

// Registrasi routes
app.use('/api/users', loginRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route testing awal
app.get("/", (req, res) => {
  res.send("Backend berjalan dengan baik");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server BARANGQ PRO berjalan di http://localhost:${PORT}`);
});