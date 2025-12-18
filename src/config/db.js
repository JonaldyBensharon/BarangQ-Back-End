const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Informasi Koneksi di terminal
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Gagal Koneksi ke Database:', err.message);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error query:', err.stack);
        }
        console.log('Database TERHUBUNG SUKSES di Port 5432!');
    });
});

module.exports = pool;