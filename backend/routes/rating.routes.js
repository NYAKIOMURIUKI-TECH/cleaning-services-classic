const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { authenticateToken } = require('../middleware/auth');

// Middleware to log all requests to rating routes
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`, req.body);
  next();
});

// Create a rating
router.post('/', authenticateToken, ratingController.createRating);

// Get all ratings
router.get('/', ratingController.getAllRatings);

// Get ratings for a specific user
router.get('/user/:userId', ratingController.getUserRatings);

// Get average rating for a user
router.get('/user/:userId/average', ratingController.getUserAverageRating);

// Get rating by ID
router.get('/:id', ratingController.getRatingById);

// Test database connection
router.get('/test/connection', ratingController.testConnection);

module.exports = router;
