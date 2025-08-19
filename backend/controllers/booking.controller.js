const db = require('../config/connection');

// Create a new booking/job
exports.createBooking = (req, res) => {
  const {
    job_title,
    job_description,
    address,
    price,
    duration_hours,
    date,
    time,
    client_id
  } = req.body;

  if (!job_title || !date || !time || !client_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = `INSERT INTO bookings (job_title, job_description, address, price, duration_hours,
               date, time, client_id, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending")`;

  db.query(sql, [
    job_title,
    job_description,
    address,
    price,
    duration_hours,
    date,
    time,
    client_id
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({
      message: 'Booking created',
      bookingId: result.insertId
    });
  });
};

// Get all bookings
exports.getAllBookings = (req, res) => {
  const sql = `SELECT b.*,
               c.fullName as client_name, c.phone as client_phone,
               cl.fullName as cleaner_name, cl.phone as cleaner_phone
               FROM bookings b
               LEFT JOIN users c ON b.client_id = c.id
               LEFT JOIN users cl ON b.cleaner_id = cl.id
               ORDER BY b.created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Get bookings for a specific client
exports.getClientBookings = (req, res) => {
  const clientId = req.params.clientId;

  const sql = `SELECT b.*,
               cl.fullName as cleaner_name, cl.phone as cleaner_phone
               FROM bookings b
               LEFT JOIN users cl ON b.cleaner_id = cl.id
               WHERE b.client_id = ?
               ORDER BY b.created_at DESC`;

  db.query(sql, [clientId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Assign cleaner to booking
exports.assignCleaner = (req, res) => {
  const { bookingId, cleanerId } = req.body;

  const sql = 'UPDATE bookings SET cleaner_id = ?, status = "accepted", accepted_at = NOW() WHERE id = ?';
  db.query(sql, [cleanerId, bookingId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Cleaner assigned successfully' });
  });
};

// Update booking status
exports.updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  let updateFields = 'status = ?';
  let values = [status, id];

  if (status === 'completed') {
    updateFields += ', completed_at = NOW()';
  }

  const sql = `UPDATE bookings SET ${updateFields} WHERE id = ?`;
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking status updated successfully' });
  });
};

// Delete booking
exports.deleteBooking = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM bookings WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted' });
  });
};
