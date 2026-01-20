// routes/admin.js
const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const auth = require('../middleware/auth');

// @route   POST /api/admin/fetch-all
// @desc    Fetch and store all categories
// @access  Private (Admin only - add admin middleware if needed)
router.post('/fetch-all', auth, async (req, res) => {
  try {
    const { country = 'us', language = 'en' } = req.body;

    res.json({
      success: true,
      message: 'Fetching all categories in background. This may take a few minutes.',
      status: 'processing'
    });

    // Run in background
    newsService.fetchAllCategories(country, language)
      .then(results => {
        console.log('Bulk fetch completed:', results);
      })
      .catch(error => {
        console.error('Bulk fetch error:', error);
      });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start bulk fetch',
      error: error.message
    });
  }
});

// @route   POST /api/admin/fetch-category
// @desc    Fetch and store specific category
// @access  Private
router.post('/fetch-category', auth, async (req, res) => {
  try {
    const { category, country = 'us', language = 'en' } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const result = await newsService.fetchAndStoreByCategory(category, country, language);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// @route   GET /api/admin/statistics
// @desc    Get database statistics
// @access  Private
router.get('/statistics', auth, async (req, res) => {
  try {
    const stats = await newsService.getStatistics();
    
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

module.exports = router;