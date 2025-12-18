-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
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

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Tabel Products 
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(50), 
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),     
    description TEXT,
    image_url TEXT,         
    buy_price DECIMAL(15, 2) NOT NULL CHECK (buy_price >= 0),
    sell_price DECIMAL(15, 2) NOT NULL CHECK (sell_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, code)
);

-- 3. Tabel Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    qty INTEGER NOT NULL CHECK (qty > 0),
    total_price DECIMAL(15, 2) NOT NULL CHECK (total_price >= 0),
    profit DECIMAL(15, 2) DEFAULT 0 CHECK (profit >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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