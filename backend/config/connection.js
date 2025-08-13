const mysql = require('mysql2');
require('dotenv').config();

var connection = mysql.createConnection({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (!err) {
    console.log('✅ Connected to the database');
  } else {
    console.error('❌ Error connecting to the database:', err.message);
  }
});

module.exports = connection;
