const express = require('express');
const router = express.Router();
const cleanerController = require('../controllers/cleaner.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require cleaner authentication
router.use(authenticateToken);
router.use(authorizeRoles('cleaner'));

// Get available bookings (not assigned to anyone)
router.get('/available-bookings', cleanerController.getAvailableBookings);

// Get bookings assigned to this cleaner
router.get('/bookings', cleanerController.getBookings);

// Accept a booking
router.post('/accept-booking', cleanerController.acceptBooking);

// Update booking status
router.put('/bookings/status', cleanerController.updateBookingStatus);

// View payments for completed jobs
router.get('/payments', cleanerController.getPayments);

// View ratings received
router.get('/ratings', cleanerController.getRatings);

module.exports = router;
