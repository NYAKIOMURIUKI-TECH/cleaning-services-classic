const jwt = require('jsonwebtoken');
const db = require('../config/connection');

exports.register = (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length > 0) return res.status(409).json({ message: "Email already in use" });

    const user = { fullName, email, password, role };

    db.query('INSERT INTO users SET ?', user, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Return inserted user (without password if preferred)
      return res.status(201).json({
        message: "User registered successfully",
        user: {
          fullName,
          email,
          role
        }
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "User not found" });

    const user = result[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  });
};
