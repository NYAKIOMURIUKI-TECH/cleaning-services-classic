const express = require('express');
var cors = require('cors');
const authRoutes = require('./routes/auth.routes');
require('./config/connection'); // Ensure DB connection is established

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use auth routes
app.use('/api/auth', authRoutes); // ← Add this line

module.exports = app;
