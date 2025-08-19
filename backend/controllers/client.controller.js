const db = require('../config/connection');

// GET user profile
exports.getUserProfile = (req, res) => {
  const userId = req.params.id || req.user.id;

  const query = `SELECT id, fullName, email, phone, location, profilePicture, bio,
                 skills, experience_years, created_at FROM users WHERE id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: results[0] });
  });
};

// UPDATE user profile
exports.updateUserProfile = (req, res) => {
  const userId = req.params.id;
  const {
    fullName,
    email,
    phone,
    location,
    profilePicture,
    bio,
    skills,
    experience_years
  } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const updateSql = `UPDATE users SET fullName = ?, email = ?, phone = ?, location = ?,
                     profilePicture = ?, bio = ?, skills = ?, experience_years = ? WHERE id = ?`;
  const values = [fullName, email, phone, location, profilePicture, bio, skills, experience_years, userId];

  db.query(updateSql, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        fullName,
        email,
        phone,
        location,
        profilePicture,
        bio,
        skills,
        experience_years
      }
    });
  });
};

// Get client's bookings
exports.getClientBookings = (req, res) => {
  const clientId = req.user.id;

  const sql = `SELECT b.*, cl.fullName as cleaner_name, cl.phone as cleaner_phone
               FROM bookings b
               LEFT JOIN users cl ON b.cleaner_id = cl.id
               WHERE b.client_id = ?
               ORDER BY b.created_at DESC`;

  db.query(sql, [clientId], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};
