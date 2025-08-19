const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments.controller');
const { authenticateToken } = require('../middleware/auth');

// Create payment record
router.post('/', paymentController.createPayment);

// Initiate Pesapal payment
router.post('/pesapal/initiate', paymentController.initiatePesapalPayment);

// Pesapal callback and IPN
router.get('/pesapal/callback', paymentController.handlePesapalCallback);
router.get('/pesapal/ipn', paymentController.handlePesapalIPN);

// Get all payments (admin)
router.get('/', authenticateToken, paymentController.getAllPayments);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

module.exports = router;
