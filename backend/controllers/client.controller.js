const db = require('../config/connection'); // make sure your DB connection is correct

// GET user profile
exports.getUserProfile = (req, res) => {
  const userId = req.body.id;

  const query = 'SELECT id, fullName, email, location, profilePicture FROM users WHERE id = ?';

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
  const { fullName, email, location, profilePicture } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const updateSql = 'UPDATE users SET fullName = ?, email = ?, location = ?, profilePicture = ? WHERE id = ?';
  const values = [fullName, email, location, profilePicture, userId];

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
      user: { id: userId, fullName, email, location, profilePicture }
    });
  });
};
