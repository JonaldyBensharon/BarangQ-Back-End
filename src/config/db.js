const { Pool } = require('pg');
require('dotenv').config();

// DEBUG: Cek apakah variable terbaca (Jangan show password asli di production log)
console.log("Mencoba koneksi dengan config:");
console.log(`User: ${process.env.DB_USER}`);
console.log(`Host: ${process.env.DB_HOST}`); // Pastikan ini 127.0.0.1
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`Password Terbaca: ${process.env.DB_PASSWORD ? '**** (Ada)' : '(KOSONG!)'}`);
console.log(`Port: ${process.env.DB_PORT}`);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('----------------------------------------');
        console.error('GAGAL KONEKSI KE DATABASE');
        console.error('Pesan Error:', err.message);
        console.error('----------------------------------------');
        return;
    }
    
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error query:', err.stack);
        }
        console.log('✅ Database TERHUBUNG SUKSES di Port 5432!');
        console.log('Waktu Server Database:', result.rows[0].now);
    });
});

module.exports = pool;