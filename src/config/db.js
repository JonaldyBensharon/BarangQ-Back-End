const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

(async () => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('Database terhubung dengan sukses');
    } catch (err) {
        console.error('Gagal koneksi ke database:', err.message);
    }
})();

pool.query('SELECT 1')
.then(() => console.log('DB OK'))
.catch(err => console.error('DB ERROR', err));

module.exports = pool;