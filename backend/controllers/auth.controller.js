const jwt = require('jsonwebtoken');
const db = require('../config/connection');

// REGISTER a new user
exports.register = (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Validate input
  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if email already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Insert new user
    const user = { fullName, email, password, role };
    db.query('INSERT INTO users SET ?', user, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.status(201).json({ message: "User registered successfully" });
    });
  });
};

// LOGIN an existing user
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Check email in DB
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    // Compare passwords directly (not hashed)
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Success
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  });
};
