const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');

// Middleware to log all requests to rating routes
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`, req.body);
  next();
});

router.post('/', ratingController.createRating);        // POST /api/ratings
router.get('/', ratingController.getAllRatings);        // GET /api/ratings
router.get('/:id', ratingController.getRatingById);     // GET /api/ratings/:id
router.get('/test/connection', ratingController.testConnection); // GET /api/ratings/test/connection

module.exports = router;