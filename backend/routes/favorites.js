const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/favorites
// @desc    Add article to favorites
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, content, url, urlToImage, publishedAt, source, author } = req.body;
    
    // Check if article already exists
    let article = await Article.findOne({ url });
    
    if (!article) {
      article = new Article({
        title,
        description,
        content,
        url,
        urlToImage,
        publishedAt,
        source,
        author,
        savedBy: [req.user._id]
      });
      await article.save();
    } else {
      // Add user to savedBy if not already there
      if (!article.savedBy.includes(req.user._id)) {
        article.savedBy.push(req.user._id);
        await article.save();
      }
    }
    
    // Add to user's favorites
    if (!req.user.favorites.includes(article._id)) {
      req.user.favorites.push(article._id);
      await req.user.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Article added to favorites',
      article 
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/favorites
// @desc    Get user's favorite articles
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json({ 
      success: true, 
      favorites: user.favorites 
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/favorites/:articleId
// @desc    Remove article from favorites
// @access  Private
router.delete('/:articleId', auth, async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Remove from user's favorites
    req.user.favorites = req.user.favorites.filter(
      fav => fav.toString() !== articleId
    );
    await req.user.save();
    
    // Remove user from article's savedBy
    const article = await Article.findById(articleId);
    if (article) {
      article.savedBy = article.savedBy.filter(
        user => user.toString() !== req.user._id.toString()
      );
      await article.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Article removed from favorites' 
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;