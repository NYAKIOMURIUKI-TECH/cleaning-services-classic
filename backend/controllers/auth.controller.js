const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/connection');

const SALT_ROUNDS = 12; // Higher number = more secure but slower

exports.register = async (req, res) => {
  const { fullName, email, password, role, phone, location, bio, skills, experience_years } = req.body;

  // Validation
  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Password strength validation
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    });
  }

  try {
    // Check if email already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: "Database error occurred" });
      }

      if (result.length > 0) {
        return res.status(409).json({ message: "Email already in use" });
      }

      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = {
          fullName,
          email,
          password: hashedPassword, // Store hashed password
          role,
          phone: phone || null,
          location: location || null,
          bio: bio || null,
          skills: skills || null,
          experience_years: experience_years || 0
        };

        // Insert user into database
        db.query('INSERT INTO users SET ?', user, (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Failed to create user" });
          }

          return res.status(201).json({
            message: "User registered successfully",
            user: {
              id: result.insertId,
              fullName,
              email,
              role,
              phone,
              location
            }
          });
        });
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        return res.status(500).json({ error: "Error processing password" });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: "Database error occurred" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const user = result[0];

    try {
      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          email: user.email
        },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
        { expiresIn: '24h' }
      );

      // Return success response (never include password in response)
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          bio: user.bio,
          skills: user.skills,
          experience_years: user.experience_years,
          created_at: user.created_at
        }
      });
    } catch (compareError) {
      console.error('Password comparison error:', compareError);
      return res.status(500).json({ error: "Authentication error" });
    }
  });
};

// Optional: Add password change functionality
exports.changePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  // Password strength validation for new password
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters long" });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    return res.status(400).json({
      message: "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    });
  }

  try {
    // Get user's current password
    db.query('SELECT password FROM users WHERE id = ?', [userId], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error occurred" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = result[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update password in database
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId], (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Failed to update password" });
        }

        res.json({ message: "Password changed successfully" });
      });
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: "Failed to change password" });
  }
};
