const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authenticateToken } = require('../middleware/auth');

// Middleware to log all requests to client routes
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  next();
});

// Get user profile
router.get('/profile/:id', clientController.getUserProfile);

// Update user profile
router.put('/profile/:id', authenticateToken, clientController.updateUserProfile);

// Get client's bookings
router.get('/bookings', authenticateToken, clientController.getClientBookings);

module.exports = router;
