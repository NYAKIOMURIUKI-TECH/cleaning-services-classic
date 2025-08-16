const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

// Middleware to log all requests to client routes
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  next();
});

// Routes for Angular settings page
router.get('/profile', clientController.getUserProfile);              // GET /api/client/profile
router.put('/profile', clientController.updateUserProfile);           // PUT /api/client/profile

module.exports = router;