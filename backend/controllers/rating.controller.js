const db = require('../config/connection');

// Create a rating/review
exports.createRating = (req, res) => {
  const { bookingId, reviewerId, revieweeId, rating, wouldRecommend, testimonial } = req.body;

  if (!bookingId || !reviewerId || !revieweeId || !rating) {
    return res.status(400).json({
      message: 'Missing required fields',
      required: ['bookingId', 'reviewerId', 'revieweeId', 'rating']
    });
  }

  // Validate rating value
  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({
      message: 'Rating must be a number between 1 and 5'
    });
  }

  const sql = `INSERT INTO ratings (booking_id, reviewer_id, reviewee_id, rating,
               would_recommend, testimonial) VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [bookingId, reviewerId, revieweeId, ratingNum, wouldRecommend || false, testimonial || ''];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }

    res.status(201).json({
      message: 'Rating submitted successfully',
      ratingId: result.insertId,
      data: {
        bookingId,
        reviewerId,
        revieweeId,
        rating: ratingNum,
        wouldRecommend: wouldRecommend || false,
        testimonial: testimonial || ''
      }
    });
  });
};

// Get all ratings
exports.getAllRatings = (req, res) => {
  const sql = `SELECT r.*, b.job_title,
               reviewer.fullName as reviewer_name,
               reviewee.fullName as reviewee_name
               FROM ratings r
               JOIN bookings b ON r.booking_id = b.id
               JOIN users reviewer ON r.reviewer_id = reviewer.id
               JOIN users reviewee ON r.reviewee_id = reviewee.id
               ORDER BY r.created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Get ratings error:', err);
      return res.status(500).json({
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }

    res.json(results);
  });
};

// Get ratings for a specific user (as reviewee)
exports.getUserRatings = (req, res) => {
  const { userId } = req.params;

  const sql = `SELECT r.*, b.job_title, reviewer.fullName as reviewer_name
               FROM ratings r
               JOIN bookings b ON r.booking_id = b.id
               JOIN users reviewer ON r.reviewer_id = reviewer.id
               WHERE r.reviewee_id = ?
               ORDER BY r.created_at DESC`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Get user ratings error:', err);
      return res.status(500).json({
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }

    res.json(results);
  });
};

// Get rating by ID
exports.getRatingById = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid rating ID' });
  }

  const sql = `SELECT r.*, b.job_title,
               reviewer.fullName as reviewer_name,
               reviewee.fullName as reviewee_name
               FROM ratings r
               JOIN bookings b ON r.booking_id = b.id
               JOIN users reviewer ON r.reviewer_id = reviewer.id
               JOIN users reviewee ON r.reviewee_id = reviewee.id
               WHERE r.id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
console.error('Get rating by ID error:', err);
      return res.status(500).json({
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json(results[0]);
  });
};

// Get average rating for a user
exports.getUserAverageRating = (req, res) => {
  const { userId } = req.params;

  const sql = `SELECT
               COUNT(*) as total_ratings,
               AVG(rating) as average_rating,
               SUM(CASE WHEN would_recommend = 1 THEN 1 ELSE 0 END) as recommendations
               FROM ratings
               WHERE reviewee_id = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Get average rating error:', err);
      return res.status(500).json({
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }

    const stats = results[0];
    res.json({
      userId: userId,
      totalRatings: stats.total_ratings,
      averageRating: parseFloat(stats.average_rating || 0).toFixed(1),
      recommendations: stats.recommendations,
      recommendationPercentage: stats.total_ratings > 0
        ? ((stats.recommendations / stats.total_ratings) * 100).toFixed(1)
        : 0
    });
  });
};

// Test database connection
exports.testConnection = (req, res) => {
  console.log('Testing database connection...');

  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      console.error('Database test failed:', err);
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }

    console.log('Database test successful:', results);
    res.json({ message: 'Database connection working', test: results });
  });
};
