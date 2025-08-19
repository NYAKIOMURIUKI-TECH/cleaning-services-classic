const db = require('../config/connection');

// View all available bookings (not yet assigned)
exports.getAvailableBookings = (req, res) => {
  const sql = `SELECT b.*, c.fullName as client_name, c.phone as client_phone
               FROM bookings b
               JOIN users c ON b.client_id = c.id
               WHERE b.cleaner_id IS NULL AND b.status = 'pending'
               ORDER BY b.created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};

// View bookings assigned to this cleaner
exports.getBookings = (req, res) => {
  const cleanerId = req.user.id;
  const sql = `SELECT b.*, c.fullName as client_name, c.phone as client_phone
               FROM bookings b
               JOIN users c ON b.client_id = c.id
               WHERE b.cleaner_id = ?
               ORDER BY b.created_at DESC`;

  db.query(sql, [cleanerId], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};

// Accept booking
exports.acceptBooking = (req, res) => {
  const cleanerId = req.user.id;
  const { bookingId } = req.body;

  const sql = 'UPDATE bookings SET cleaner_id = ?, status = "accepted", accepted_at = NOW() WHERE id = ? AND cleaner_id IS NULL';
  db.query(sql, [cleanerId, bookingId], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found or already assigned' });
    }
    res.json({ message: 'Booking accepted successfully' });
  });
};

// Update booking status
exports.updateBookingStatus = (req, res) => {
  const cleanerId = req.user.id;
  const { bookingId, status } = req.body;

  if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  let updateFields = 'status = ?';
  let values = [status, bookingId, cleanerId];

  if (status === 'completed') {
    updateFields += ', completed_at = NOW()';
  }

  const sql = `UPDATE bookings SET ${updateFields} WHERE id = ? AND cleaner_id = ?`;
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found or not assigned to this cleaner' });
    }
    res.json({ message: `Booking ${status} successfully` });
  });
};

// View payments for completed jobs
exports.getPayments = (req, res) => {
  const cleanerId = req.user.id;
  const sql = `SELECT p.*, b.job_title, b.date, b.time, b.price, c.fullName as client_name
               FROM payments p
               JOIN bookings b ON p.booking_id = b.id
               JOIN users c ON b.client_id = c.id
               WHERE b.cleaner_id = ? AND p.status = 'completed'
               ORDER BY p.paid_at DESC`;

  db.query(sql, [cleanerId], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};

// View ratings received
exports.getRatings = (req, res) => {
  const cleanerId = req.user.id;
  const sql = `SELECT r.*, b.job_title, u.fullName as reviewer_name
               FROM ratings r
               JOIN bookings b ON r.booking_id = b.id
               JOIN users u ON r.reviewer_id = u.id
               WHERE r.reviewee_id = ?
               ORDER BY r.created_at DESC`;

  db.query(sql, [cleanerId], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};
