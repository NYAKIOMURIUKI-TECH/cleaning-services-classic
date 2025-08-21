const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

router.post('/', bookingController.createBooking);      // POST /api/bookings
router.get('/', bookingController.getAllBookings);      // GET /api/bookings
router.delete('/:id', bookingController.deleteBooking); // DELETE /api/bookings/:id

module.exports = router;