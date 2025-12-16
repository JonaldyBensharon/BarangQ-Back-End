-- Tabel Users
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
