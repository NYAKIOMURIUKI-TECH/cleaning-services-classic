const db = require('../config/connection');

// Create a payment
exports.createPayment = (req, res) => {
  const { bookingId, paymentMethod, email, amount, cardDetails, mobileDetails } = req.body;
  
  if (!bookingId || !paymentMethod || !email || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO payments (booking_id, payment_method, email, amount, card_details, mobile_details, status) VALUES (?, ?, ?, ?, ?, ?, "completed")';
  
  db.query(sql, [
    bookingId,  // This matches the bookings.id 
    paymentMethod, 
    email, 
    amount,
    cardDetails ? JSON.stringify(cardDetails) : null,
    mobileDetails ? JSON.stringify(mobileDetails) : null
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    
    // Update booking status to paid (using the correct id field)
    const updateBookingSql = 'UPDATE bookings SET status = "paid" WHERE id = ?';
    db.query(updateBookingSql, [bookingId], (updateErr) => {
      if (updateErr) console.log('Warning: Could not update booking status');
    });
    
    res.status(201).json({ 
      message: 'Payment processed successfully', 
      paymentId: result.insertId 
    });
  });
};

// Get all payments
exports.getAllPayments = (req, res) => {
  const sql = `
    SELECT p.*, b.service, b.date, b.time 
    FROM payments p 
    LEFT JOIN bookings b ON p.booking_id = b.id 
    ORDER BY p.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Get payment by ID
exports.getPaymentById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, b.service, b.date, b.time 
    FROM payments p 
    LEFT JOIN bookings b ON p.booking_id = b.id 
    WHERE p.id = ?
  `;
  
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'Payment not found' });
    res.json(results[0]);
  });
};