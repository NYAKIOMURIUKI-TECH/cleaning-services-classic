const db = require('../config/connection');

// Create a rating
exports.createRating = (req, res) => {
  console.log('=== RATING SUBMISSION DEBUG ===');
  console.log('1. Request received at:', new Date().toISOString());
  console.log('2. Request body:', req.body);
  console.log('3. Request headers:', req.headers);
  
  const { cleanerName, clientName, rating, wouldRecommend, testimonial } = req.body;
  
  console.log('4. Extracted data:');
  console.log('   - cleanerName:', cleanerName);
  console.log('   - clientName:', clientName);
  console.log('   - rating:', rating);
  console.log('   - wouldRecommend:', wouldRecommend);
  console.log('   - testimonial:', testimonial);
  
  // Validate required fields
  if (!cleanerName || !clientName || !rating) {
    console.log('5. VALIDATION FAILED - Missing required fields');
    console.log('   - cleanerName present:', !!cleanerName);
    console.log('   - clientName present:', !!clientName);
    console.log('   - rating present:', !!rating);
    
    return res.status(400).json({ 
      message: 'Missing required fields',
      required: ['cleanerName', 'clientName', 'rating'],
      received: { cleanerName, clientName, rating }
    });
  }
  
  // Validate rating value
  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    console.log('6. VALIDATION FAILED - Invalid rating value:', rating);
    return res.status(400).json({ 
      message: 'Rating must be a number between 1 and 5',
      received: rating 
    });
  }
  
  console.log('7. Validation passed, attempting database insert...');
  
  const sql = 'INSERT INTO ratings (cleaner_name, client_name, rating, would_recommend, testimonial) VALUES (?, ?, ?, ?, ?)';
  const values = [cleanerName, clientName, ratingNum, wouldRecommend || false, testimonial || ''];
  
  console.log('8. SQL Query:', sql);
  console.log('9. SQL Values:', values);
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.log('10. DATABASE ERROR:');
      console.log('    - Error code:', err.code);
      console.log('    - Error message:', err.message);
      console.log('    - SQL State:', err.sqlState);
      console.log('    - Full error:', err);
      
      return res.status(500).json({ 
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        errorCode: err.code
      });
    }
    
    console.log('11. SUCCESS - Rating inserted with ID:', result.insertId);
    console.log('12. Database result:', result);
    
    res.status(201).json({
      message: 'Rating submitted successfully',
      ratingId: result.insertId,
      data: {
        cleanerName,
        clientName,
        rating: ratingNum,
        wouldRecommend: wouldRecommend || false,
        testimonial: testimonial || ''
      }
    });
  });
  
  console.log('=== END RATING DEBUG ===\n');
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

// Get all ratings (existing function with debug)
exports.getAllRatings = (req, res) => {
  console.log('Getting all ratings...');
  const sql = 'SELECT * FROM ratings ORDER BY id DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Get ratings error:', err);
      return res.status(500).json({ 
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }
    
    console.log(`Found ${results.length} ratings`);
    res.json(results);
  });
};

// Get rating by ID (existing function)
exports.getRatingById = (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid rating ID' });
  }
  
  const sql = 'SELECT * FROM ratings WHERE id = ?';
  
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