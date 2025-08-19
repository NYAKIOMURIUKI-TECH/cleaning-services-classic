const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);

// Client-specific routes
router.get('/client/:clientId', authenticateToken, bookingController.getClientBookings);

// Admin/Cleaner routes
router.put('/assign', authenticateToken, authorizeRoles('admin', 'cleaner'), bookingController.assignCleaner);
router.put('/:id/status', authenticateToken, bookingController.updateBookingStatus);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'client'), bookingController.deleteBooking);

module.exports = router;
