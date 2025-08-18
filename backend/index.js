const express = require('express');
var cors = require('cors');
const authRoutes = require('./routes/auth.routes');
require('./config/connection'); // Ensure DB connection is established
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payments.routes');
const ratingRoutes = require('./routes/rating.routes');
const userRoutes = require('./routes/client.routes');
const cleanerRoutes = require('./routes/cleaner.routes'); // Import cleaner routes
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use auth routes
app.use('/api/auth', authRoutes); // ← Add this line
app.use('/api/bookings', bookingRoutes); // Add booking routes
app.use('/api/payments', paymentRoutes); // Add payment routes
app.use('/api/ratings', ratingRoutes); // Add rating routes
app.use('/api/user', userRoutes); // Add user routes
app.use('/api/cleaner', cleanerRoutes); // Add cleaner routes


module.exports = app;
