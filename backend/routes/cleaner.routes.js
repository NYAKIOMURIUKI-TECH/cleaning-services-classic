const express = require('express');
const router = express.Router();
const cleanerController = require('../controllers/cleaner.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Cleaner must be logged in + role = cleaner
router.get('/bookings', authenticateToken, authorizeRoles('cleaner'), cleanerController.getBookings);
router.post('/bookings/status', authenticateToken, authorizeRoles('cleaner'), cleanerController.updateBookingStatus);
router.get('/payments', authenticateToken, authorizeRoles('cleaner'), cleanerController.getPayments);
router.get('/ratings', authenticateToken, authorizeRoles('cleaner'), cleanerController.getRatings);

module.exports = router;
