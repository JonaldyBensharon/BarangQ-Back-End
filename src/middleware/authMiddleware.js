const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // 1. Ambil token dari Header (Format: "Bearer TOKEN_DISINI")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Jika tidak ada token, tolak akses
    if (!token) return res.status(401).json({ error: "Akses ditolak. Silakan login." });

    // 3. Cek keaslian token
    jwt.verify(token, process.env.JWT_SECRET || 'rahasia_negara', (err, user) => {
        if (err) return res.status(403).json({ error: "Token tidak valid." });
        
        // 4. Jika valid, simpan data user ke request
        req.user = user; 
        next(); // Lanjut ke Controller
    });
};

module.exports = authenticateToken;