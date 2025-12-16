# Install dependensi
// Jalankan perintah berikut pada terminal di folder

    npm install

# Menjalankan server back-end
// Jalankan perintah berikut pada terminal di folder

    npm run dev

# Pengujian database lokal
1. Buat user baru di pgAdmin. 
    Cth: barangq_user

2. Buat database baru di pgAdmin
    Cth: barangq_db

3. Berikan hak akses penuh database "barangq_db" pada barangq_user. Dapat dilakukan dengan membuka query tool database "barangq_db" dan jalankan perintah:
    
    GRANT ALL PRIVILEGES ON DATABASE barangq_db TO barangq_user;
    
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO barangq_user;
    
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO barangq_user;

4. Registrasi server baru di pgAdmin, lalu sesuaikan connection dengan contoh seperti berikut.
    
    HOST= localhost
    
    PORT=5432
    
    NAME=barangq_db
    
    USER=barangq_user
    
    PASSWORD=barangq123

5. Buka database "barangq_db" pada server tersebut, lalu jalankan schema.sql. Dapat dilakukan juga dengan membuka query tool, lalu tempelkan kode dari schema.sql dan jalankan.

6. Periksa salah satu tabel, jika tampil, ini sudah berhasil. 

    Cth: select * from users
