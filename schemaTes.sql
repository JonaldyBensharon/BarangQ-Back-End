DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Tabel Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    pin TEXT NOT NULL,
    store_name VARCHAR(100) DEFAULT 'Toko Saya',
    store_description TEXT,
    address TEXT,
    store_image TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Products 
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE, 
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),     
    description TEXT,
    image_url TEXT,         
    buy_price DECIMAL(15, 2) NOT NULL,
    sell_price DECIMAL(15, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) CHECK (type IN ('IN', 'OUT')),
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    profit DECIMAL(15, 2) DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DATA DUMMY 
INSERT INTO users (username, password, store_name, store_description, address, store_image) 
VALUES ('admin', '123', 'BarangQ Store Pusat', 'Toko elektronik dan aksesoris terlengkap di kota Medan.', 'Jl. Setia Budi No. 123, Medan', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop');

INSERT INTO products (code, name, brand, description, image_url, buy_price, sell_price, stock) VALUES 
('BRG001', 'Laptop Gaming X1', 'Asus', 'Laptop spek tinggi untuk gaming berat', 'https://images.unsplash.com/photo-1603302576837-637886e49745?w=500', 10000000, 12500000, 5),
('BRG002', 'Mouse Wireless Silent', 'Logitech', 'Mouse hening tanpa suara klik', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', 150000, 250000, 20),
('BRG003', 'Mechanical Keyboard', 'Keychron', 'Keyboard mekanik RGB', 'https://images.unsplash.com/photo-1587829741301-dc798b91add1?w=500', 800000, 1200000, 8);

-- Data Transaksi Dummy untuk Grafik
INSERT INTO transactions (product_id, type, qty, total_price, profit, date) VALUES
(1, 'OUT', 1, 12500000, 2500000, CURRENT_DATE - INTERVAL '2 days'),
(2, 'OUT', 5, 1250000, 500000, CURRENT_DATE - INTERVAL '1 day'),
(3, 'OUT', 2, 2400000, 800000, CURRENT_DATE);