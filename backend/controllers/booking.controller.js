const db = require('../config/connection');

// Create a new booking (simplified for school project - no JWT needed)
exports.createBooking = (req, res) => {
  const { service, date, time } = req.body;
  if (!service || !date || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO bookings (service, date, time, status) VALUES (?, ?, ?, "pending")';
  db.query(sql, [service, date, time], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: 'Booking created', bookingId: result.insertId });
  });
};

// Get all bookings (for school project)
exports.getAllBookings = (req, res) => {
  const sql = 'SELECT * FROM bookings ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Delete booking
exports.deleteBooking = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM bookings WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Booking deleted' });
  });
};