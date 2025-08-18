const db = require('../config/connection');

// View all bookings assigned to this cleaner
exports.getBookings = (req, res) => {
  const cleanerId = req.user.id; // cleaner’s userId
  const sql = 'SELECT * FROM bookings WHERE cleaner_id = ?';
  db.query(sql, [cleanerId], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};

// Accept or decline booking
exports.updateBookingStatus = (req, res) => {
  const cleanerId = req.user.id;
  const { bookingId, status } = req.body; // status = "accepted" | "declined"

  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const sql = 'UPDATE bookings SET status = ? WHERE id = ? AND cleaner_id = ?';
  db.query(sql, [status, bookingId, cleanerId], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found or not assigned to this cleaner' });
    }
    res.json({ message: `Booking ${status} successfully` });
  });
};

// View payments
exports.getPayments = (req, res) => {
  const cleanerId = req.user.id;
  const sql = `
    SELECT p.* FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    WHERE b.cleaner_id = ?`;
  db.query(sql, [cleanerId], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};

// View ratings
exports.getRatings = (req, res) => {
  const cleanerId = req.user.id;
  const sql = `
    SELECT r.* FROM ratings r
    JOIN bookings b ON r.booking_id = b.id
    WHERE b.cleaner_id = ?`;
  db.query(sql, [cleanerId], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};
