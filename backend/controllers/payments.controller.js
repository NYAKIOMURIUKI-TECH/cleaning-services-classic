
const db = require('../config/connection');
const pesapal = require('../utils/pesapal');

// Create a payment record
exports.createPayment = (req, res) => {
  const { bookingId, amount } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // First verify the booking exists and get details
  const bookingSql = 'SELECT * FROM bookings WHERE id = ?';
  db.query(bookingSql, [bookingId], (err, bookingResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (bookingResults.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingResults[0];

    // Create payment record
    const sql = 'INSERT INTO payments (booking_id, amount, status) VALUES (?, ?, "pending")';
    db.query(sql, [bookingId, amount], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: 'Payment record created',
        paymentId: result.insertId,
        booking: booking
      });
    });
  });
};

// Initiate Pesapal payment
exports.initiatePesapalPayment = async (req, res) => {
  try {
    const { paymentId, customerName, phoneNumber } = req.body;

    if (!paymentId || !customerName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Get payment and booking details
    const paymentSql = `SELECT p.*, b.job_title, b.price as booking_price, b.client_id
                        FROM payments p
                        JOIN bookings b ON p.booking_id = b.id
                        WHERE p.id = ?`;

    db.query(paymentSql, [paymentId], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      const payment = results[0];
      const totalAmount = parseFloat(payment.amount);

      // Get base URL for callbacks
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Get Pesapal access token
      const tokenResponse = await pesapal.getAccessToken();
      const accessToken = tokenResponse.token;

      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // Register IPN URL
      const ipnUrl = `${baseUrl}/api/payments/pesapal/ipn`;
      const notificationResponse = await pesapal.getNotificationId(accessToken, ipnUrl);
      const notificationId = notificationResponse.ipn_id;

      if (!notificationId) {
        throw new Error('Failed to register IPN');
      }

      // Create merchant reference
      const merchantReference = `CLEANING_${paymentId}_${Date.now()}`;

      // Prepare order details
      const orderDetails = {
        amount: totalAmount,
        customerName: customerName,
        phoneNumber: phoneNumber,
        description: `Payment for cleaning service: ${payment.job_title}`,
        merchantReference: merchantReference,
        notification_id: notificationId
      };

      // Create Pesapal order
      const orderResponse = await pesapal.getMerchantOrderUrl(orderDetails, accessToken, "http://localhost:4200");

      if (!orderResponse.order_tracking_id) {
        throw new Error('Failed to create Pesapal order');
      }

      // Store interim payment record
      const interimSql = `INSERT INTO pesapal_interim_payments
                          (payment_id, orderTrackingId, merchantReference, iframeSrc, status)
                          VALUES (?, ?, ?, ?, 'SAVED')`;

      db.query(interimSql, [
        paymentId,
        orderResponse.order_tracking_id,
        orderResponse.merchant_reference,
        orderResponse.redirect_url
      ], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          success: true,
          paymentId: paymentId,
          orderTrackingId: orderResponse.order_tracking_id,
          redirectUrl: orderResponse.redirect_url,
          message: 'Payment initiated successfully'
        });
      });
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate payment'
    });
  }
};

// Handle Pesapal callback
exports.handlePesapalCallback = async (req, res) => {
  try {
    const { OrderTrackingId } = req.query;

    if (!OrderTrackingId) {
      return res.redirect('/?error=missing_tracking_id');
    }

    // Get access token
    const tokenResponse = await pesapal.getAccessToken();
    const accessToken = tokenResponse.token;

    // Check transaction status
    const statusResponse = await pesapal.getTransactionStatus(OrderTrackingId, accessToken);
    const paymentStatus = statusResponse.payment_status_description;

    // Find the interim payment record
    const interimSql = 'SELECT * FROM pesapal_interim_payments WHERE orderTrackingId = ?';
    db.query(interimSql, [OrderTrackingId], (err, interimResults) => {
      if (err || interimResults.length === 0) {
        return res.redirect('/?error=payment_record_not_found');
      }

      const interimPayment = interimResults[0];
      const paymentId = interimPayment.payment_id;

      if (paymentStatus === 'Completed') {
        // Update payment status to completed
        const updatePaymentSql = `UPDATE payments SET
                                  status = 'completed',
                                  payment_method = ?,
                                  transaction_id = ?,
                                  paid_at = NOW()
                                  WHERE id = ?`;

        db.query(updatePaymentSql, [
          `Pesapal - ${statusResponse.payment_method}`,
          statusResponse.confirmation_code,
          paymentId
        ], (err) => {
          if (err) console.error('Error updating payment:', err);
        });

        // Update interim payment status
        db.query(
          'UPDATE pesapal_interim_payments SET status = "COMPLETED" WHERE id = ?',
          [interimPayment.id]
        );

        res.json({
          success: true,
          message: 'Payment made successfully'
        });

      } else if (paymentStatus === 'Failed') {
        // Update payment status to failed
        db.query('UPDATE payments SET status = "failed" WHERE id = ?', [paymentId]);

        // Update interim payment status
        db.query(
          'UPDATE pesapal_interim_payments SET status = "FAILED" WHERE id = ?',
          [interimPayment.id]
        );

        res.json({
          success: false,
          message: 'Payment failed'
        });

      } else {
        res.json({
          success: false,
          message: 'Payment is still getting processed'
        });
      }
    });

  } catch (error) {
    console.error('Callback error:', error);
    res.redirect('/?error=callback_error');
  }
};

// Handle Pesapal IPN
exports.handlePesapalIPN = async (req, res) => {
  try {
    const { OrderTrackingId } = req.query;

    if (!OrderTrackingId) {
      return res.status(400).send('Missing OrderTrackingId');
    }

    // Get access token
    const tokenResponse = await pesapal.getAccessToken();
    const accessToken = tokenResponse.token;

    // Check transaction status
    const statusResponse = await pesapal.getTransactionStatus(OrderTrackingId, accessToken);
    const paymentStatus = statusResponse.payment_status_description;

    // Find the interim payment record
    const interimSql = 'SELECT * FROM pesapal_interim_payments WHERE orderTrackingId = ?';
    db.query(interimSql, [OrderTrackingId], (err, interimResults) => {
      if (err || interimResults.length === 0) {
        return res.status(404).send('Payment record not found');
      }

      const interimPayment = interimResults[0];
      const paymentId = interimPayment.payment_id;

      if (paymentStatus === 'Completed') {
        // Update payment status to completed
        const updatePaymentSql = `UPDATE payments SET
                                  status = 'completed',
                                  payment_method = ?,
                                  transaction_id = ?,
                                  paid_at = NOW()
                                  WHERE id = ?`;

        db.query(updatePaymentSql, [
          `Pesapal - ${statusResponse.payment_method}`,
          statusResponse.confirmation_code,
          paymentId
        ]);

        // Update interim payment status
        db.query(
          'UPDATE pesapal_interim_payments SET status = "COMPLETED" WHERE id = ?',
          [interimPayment.id]
        );

      } else if (paymentStatus === 'Failed') {
        db.query('UPDATE payments SET status = "failed" WHERE id = ?', [paymentId]);
        db.query(
          'UPDATE pesapal_interim_payments SET status = "FAILED" WHERE id = ?',
          [interimPayment.id]
        );
      }
    });

    // Always respond with 200 to acknowledge receipt
    res.status(200).send('IPN received');

  } catch (error) {
    console.error('IPN error:', error);
    res.status(500).send('IPN processing error');
  }
};

// Get all payments
exports.getAllPayments = (req, res) => {
  const sql = `SELECT p.*, b.job_title, b.date, b.time, b.client_id,
               c.fullName as client_name, cl.fullName as cleaner_name
               FROM payments p
               JOIN bookings b ON p.booking_id = b.id
               JOIN users c ON b.client_id = c.id
               LEFT JOIN users cl ON b.cleaner_id = cl.id
               ORDER BY p.created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Get payment by ID
exports.getPaymentById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT p.*, b.job_title, b.date, b.time, b.address,
               c.fullName as client_name, cl.fullName as cleaner_name
               FROM payments p
               JOIN bookings b ON p.booking_id = b.id
               JOIN users c ON b.client_id = c.id
               LEFT JOIN users cl ON b.cleaner_id = cl.id
               WHERE p.id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'Payment not found' });
    res.json(results[0]);
  });
};
