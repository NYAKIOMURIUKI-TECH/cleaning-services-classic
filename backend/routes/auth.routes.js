const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);

// ✅ Add this route to confirm which DB you're connected to
router.get('/check-db', (req, res) => {
  const dbName = process.env.DB_NAME || 'Unknown';
  res.json({ connectedTo: dbName });
});

module.exports = router;
