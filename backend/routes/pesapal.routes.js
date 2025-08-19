const express = require('express');
const router = express.Router();
const pesapal = require('../utils/pesapal');
const db = require('../config/connection');

// GET /api/pesapal/callback - Handle payment redirect
router.get('/callback', async (req, res) => {
    try {
        const { OrderTrackingId } = req.query;
        console.log('Payment callback received for:', OrderTrackingId);

        if (!OrderTrackingId) {
            return res.redirect('/?error=missing_tracking_id');
        }

        // Get access token
        const tokenResponse = await pesapal.getAccessToken();
        const accessToken = tokenResponse.token;

        // Check transaction status
        const statusResponse = await pesapal.getTransactionStatus(OrderTrackingId, accessToken);
        const paymentStatus = statusResponse.payment_status_description;

        console.log(`Payment status: ${paymentStatus}`);

        // Find the interim payment record
        const getInterimSql = 'SELECT * FROM pesapal_interim_payments WHERE orderTrackingId = ?';

        db.query(getInterimSql, [OrderTrackingId], (err, interimResults) => {
            if (err) {
                console.error('Database error:', err);
                return res.redirect('/?error=database_error');
            }

            if (interimResults.length === 0) {
                return res.redirect('/?error=payment_record_not_found');
            }

            const interimPayment = interimResults[0];
            const paymentId = interimPayment.payment_id;

            if (paymentStatus === 'Completed') {
                // Update payment status to completed
                const updatePaymentSql = `
                    UPDATE payments SET
                        status = 'completed',
                        transaction_id = ?,
                        payment_method = ?,
                        paid_at = NOW()
                    WHERE id = ?
                `;

                db.query(updatePaymentSql, [
                    statusResponse.confirmation_code,
                    `Pesapal - ${statusResponse.payment_method}`,
                    paymentId
                ], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating payment:', updateErr);
                    }
                });

                // Update interim payment status
                db.query(
                    'UPDATE pesapal_interim_payments SET status = "COMPLETED" WHERE id = ?',
                    [interimPayment.id]
                );

                // Update booking status to paid
                db.query(
                    'UPDATE bookings SET status = "accepted" WHERE id = (SELECT booking_id FROM payments WHERE id = ?)',
                    [paymentId]
                );

                console.log('Payment completed successfully');
                res.redirect(`/payment-success?paymentId=${paymentId}`);

            } else if (paymentStatus === 'Failed') {
                // Update payment status to failed
                db.query('UPDATE payments SET status = "failed" WHERE id = ?', [paymentId]);

                // Update interim payment status
                db.query(
                    'UPDATE pesapal_interim_payments SET status = "FAILED" WHERE id = ?',
                    [interimPayment.id]
                );

                console.log('Payment failed');
                res.redirect('/?error=payment_failed');

            } else {
                console.log('Payment still pending');
                res.redirect('/?status=pending');
            }
        });

    } catch (error) {
        console.error('Callback error:', error);
        res.redirect('/?error=callback_error');
    }
});

// GET /api/pesapal/ipn - Handle IPN notifications
router.get('/ipn', async (req, res) => {
    try {
        const { OrderTrackingId } = req.query;
        console.log('IPN notification received for:', OrderTrackingId);

        if (!OrderTrackingId) {
            return res.status(400).send('Missing OrderTrackingId');
        }

        // Get access token
        const tokenResponse = await pesapal.getAccessToken();
        const accessToken = tokenResponse.token;

        // Check transaction status
        const statusResponse = await pesapal.getTransactionStatus(OrderTrackingId, accessToken);
        const paymentStatus = statusResponse.payment_status_description;

        console.log(`IPN - Payment status: ${paymentStatus}`);

        // Find the interim payment record
        const getInterimSql = 'SELECT * FROM pesapal_interim_payments WHERE orderTrackingId = ?';

        db.query(getInterimSql, [OrderTrackingId], (err, interimResults) => {
            if (err) {
                console.error('IPN - Database error:', err);
                return res.status(500).send('Database error');
            }

            if (interimResults.length === 0) {
                console.log('IPN - Payment record not found');
                return res.status(404).send('Payment record not found');
            }

            const interimPayment = interimResults[0];
            const paymentId = interimPayment.payment_id;

            if (paymentStatus === 'Completed') {
                // Update payment status to completed
                const updatePaymentSql = `
                    UPDATE payments SET
                        status = 'completed',
                        transaction_id = ?,
                        payment_method = ?,
                        paid_at = NOW()
                    WHERE id = ?
                `;

                db.query(updatePaymentSql, [
                    statusResponse.confirmation_code,
                    `Pesapal - ${statusResponse.payment_method}`,
                    paymentId
                ], (updateErr) => {
                    if (updateErr) {
                        console.error('IPN - Error updating payment:', updateErr);
                    }
                });

                // Update interim payment status
                db.query(
                    'UPDATE pesapal_interim_payments SET status = "COMPLETED" WHERE id = ?',
                    [interimPayment.id]
                );

                // Update booking status
                db.query(
                    'UPDATE bookings SET status = "accepted" WHERE id = (SELECT booking_id FROM payments WHERE id = ?)',
                    [paymentId]
                );

                console.log('IPN - Payment completed successfully');

            } else if (paymentStatus === 'Failed') {
                // Update payment status to failed
                db.query('UPDATE payments SET status = "failed" WHERE id = ?', [paymentId]);

                // Update interim payment status
                db.query(
                    'UPDATE pesapal_interim_payments SET status = "FAILED" WHERE id = ?',
                    [interimPayment.id]
                );

                console.log('IPN - Payment failed');
            }
        });

        // Always respond with 200 to acknowledge receipt
        res.status(200).send('IPN received');

    } catch (error) {
        console.error('IPN error:', error);
        res.status(500).send('IPN processing error');
    }
});

module.exports = router;
