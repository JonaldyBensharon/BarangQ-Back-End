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

CREATE TABLE IF NOT EXISTS transactions (
	id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detail_transactions (
	id SERIAL PRIMARY KEY,
	transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
	qty INTEGER NOT NULL CHECK (qty > 0)
);

CREATE OR REPLACE VIEW vw_detail_transactions AS
SELECT 
    dt.id,
    dt.transaction_id,
    dt.product_id,
    p.name AS product_name,
    dt.qty,
    p.buy_price,
    p.sell_price,
    (dt.qty * p.sell_price) AS subtotal,
    (dt.qty * (p.sell_price - p.buy_price)) AS profit
FROM detail_transactions dt
JOIN products p ON dt.product_id = p.id;