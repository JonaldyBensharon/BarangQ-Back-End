const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: '123', 
    host: 'localhost',
    port: 5435,             
    database: 'barangq_db'
});

// Kode Tes Koneksi (Supaya muncul status di terminal)
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Gagal Konek Database:', err.message);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('❌ Error query:', err.stack);
        }
        console.log('✅ Database TERHUBUNG SUKSES di Port 5435!');
    });
});

module.exports = pool;