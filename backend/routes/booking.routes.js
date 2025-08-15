const express = require('express');
const router = express.Router();
const db = require('../config/connection'); // Adjust path as needed

// Create a new booking
router.post('/', (req, res) => {
  console.log('📝 Booking request received:', req.body);

  const { service, date, time, location, note, status = 'pending', user_id } = req.body;

  const query = `
    INSERT INTO bookings (service, date, time, location, note, status, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [service, date, time, location, note, status, user_id], (err, result) => {
    if (err) {
      console.error('❌ Error creating booking:', err);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    console.log('✅ Booking created successfully:', result.insertId);
    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId
    });
  });
});

// Get all bookings
router.get('/', (req, res) => {
  const query = 'SELECT * FROM bookings ORDER BY date DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching bookings:', err);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    res.json(results);
  });
});

// Delete a booking
router.delete('/:id', (req, res) => {
  const bookingId = req.params.id;
  const query = 'DELETE FROM bookings WHERE id = ?';

  db.query(query, [bookingId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting booking:', err);
      return res.status(500).json({ error: 'Failed to delete booking' });
    }

    res.json({ message: 'Booking deleted successfully' });
  });
});

module.exports = router;
