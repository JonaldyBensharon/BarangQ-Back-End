const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json("Akses ditolak: Token tidak tersedia");
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json("Format token tidak valid");
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            username: decoded.username
        };

        next();
    } catch (err) {
        return res.status(401).json("Token tidak valid atau sudah kedaluwarsa");
    }
}

module.exports = authenticate;