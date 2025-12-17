const express = require('express');
const router = express.Router();

const settingsControllers = require('../controllers/settingsControllers');
const authenticateToken = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Simpan ke folder 'uploads'
    },
    filename: (req, file, cb) => {
        // Namai file: iduser-timestamp.extensi (agar unik)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// --------------------

router.get('/', authenticateToken, settingsControllers.getStoreInfo);

// Update route PUT untuk menerima file 'store_image'
router.put('/', authenticateToken, upload.single('store_image'), settingsControllers.updateStoreInfo);
// 2. PEMAKAIAN (Harus sama persis dengan variabel di atas)
router.get('/', authenticateToken, settingsControllers.getStoreInfo);

router.put('/', authenticateToken, settingsControllers.updateStoreInfo);

module.exports = router;