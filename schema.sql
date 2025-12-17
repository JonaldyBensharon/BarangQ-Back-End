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