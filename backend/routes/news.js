const express = require('express');
const router = express.Router();
const NewsAPI = require('newsapi');
const Article = require('../models/Article');
const auth = require('../middleware/auth');

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

// Helper function to save articles to database
const saveArticlesToDB = async (articles, category = null, language = 'en', country = 'us') => {
  const savedArticles = [];
  
  for (const article of articles) {
    try {
      // Skip if article doesn't have required fields
      if (!article.url || !article.title) continue;

      // Check if article already exists
      let existingArticle = await Article.findOne({ url: article.url });
      
      if (!existingArticle) {
        const newArticle = new Article({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source,
          author: article.author,
          category: category || 'general',
          language: language,
          country: country,
          status: 'active'
        });
        
        await newArticle.save();
        savedArticles.push(newArticle);
      } else {
        savedArticles.push(existingArticle);
      }
    } catch (error) {
      console.error('Error saving article:', error.message);
      // Continue with next article
    }
  }
  
  return savedArticles;
};

// @route   GET /api/news/headlines
// @desc    Get top headlines with filters (saved to DB)
// @access  Public
router.get('/headlines', async (req, res) => {
  try {
    const { 
      country = 'us', 
      category, 
      q, 
      sources,
      page = 1,
      pageSize = 20
    } = req.query;
    
    const params = { 
      country,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
    
    if (category) params.category = category;
    if (q) params.q = q;
    if (sources) params.sources = sources;
    
    // Fetch from News API
    const response = await newsapi.v2.topHeadlines(params);
    
    // Save articles to database
    const savedArticles = await saveArticlesToDB(
      response.articles, 
      category, 
      'en', 
      country
    );
    
    res.json({
      success: true,
      totalResults: response.totalResults,
      articles: savedArticles,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('Headlines error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch headlines',
      error: error.message
    });
  }
});

// @route   GET /api/news/search
// @desc    Search articles with filters (saved to DB)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { 
      q, 
      sortBy = 'relevancy', 
      language = 'en', 
      sources,
      domains,
      from,
      to,
      page = 1,
      pageSize = 20
    } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query required' 
      });
    }
    
    const params = { 
      q, 
      sortBy, 
      language,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
    
    if (sources) params.sources = sources;
    if (domains) params.domains = domains;
    if (from) params.from = from;
    if (to) params.to = to;
    
    // Fetch from News API
    const response = await newsapi.v2.everything(params);
    
    // Save articles to database
    const savedArticles = await saveArticlesToDB(
      response.articles,
      null,
      language
    );
    
    res.json({
      success: true,
      totalResults: response.totalResults,
      articles: savedArticles,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search articles',
      error: error.message
    });
  }
});

// @route   GET /api/news/filtered
// @desc    Get articles from database with all filters
// @access  Public
router.get('/filtered', async (req, res) => {
  try {
    const {
      category,
      language,
      source,
      status = 'active',
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'publishedAt',
      order = 'desc'
    } = req.query;

    // Build filter query
    const filter = { status };
    
    if (category) filter.category = category;
    if (language) filter.language = language;
    if (source) filter['source.name'] = new RegExp(source, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    // Date range filter
    if (fromDate || toDate) {
      filter.publishedAt = {};
      if (fromDate) filter.publishedAt.$gte = new Date(fromDate);
      if (toDate) filter.publishedAt.$lte = new Date(toDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Query database
    const articles = await Article.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments(filter);

    res.json({
      success: true,
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Filtered news error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch filtered news',
      error: error.message
    });
  }
});

// @route   GET /api/news/sources
// @desc    Get news sources
// @access  Public
router.get('/sources', async (req, res) => {
  try {
    const { category, language, country } = req.query;
    
    const params = {};
    if (category) params.category = category;
    if (language) params.language = language;
    if (country) params.country = country;
    
    const response = await newsapi.v2.sources(params);
    
    res.json({
      success: true,
      sources: response.sources
    });
  } catch (error) {
    console.error('Sources error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sources',
      error: error.message
    });
  }
});

// @route   GET /api/news/categories
// @desc    Get available categories
// @access  Public
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'business', name: 'Business' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'general', name: 'General' },
    { id: 'health', name: 'Health' },
    { id: 'science', name: 'Science' },
    { id: 'sports', name: 'Sports' },
    { id: 'technology', name: 'Technology' }
  ];
  
  res.json({
    success: true,
    categories
  });
});

// @route   PATCH /api/news/:id/read
// @desc    Mark article as read
// @access  Private
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    // Check if already marked as read by this user
    const alreadyRead = article.readBy.some(
      item => item.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      article.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await article.save();
    }

    res.json({
      success: true,
      message: 'Article marked as read',
      article
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PATCH /api/news/:id/status
// @desc    Update article status (archive/delete)
// @access  Private
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'archived', 'deleted'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    res.json({
      success: true,
      message: `Article ${status}`,
      article
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;