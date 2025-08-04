const express = require('express');
var cors = require('cors');
const connection = require('./config/connection');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);

module.exports = app;
