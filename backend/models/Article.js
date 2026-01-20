const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  content: String,
  url: {
    type: String,
    required: true,
    unique: true
  },
  urlToImage: String,
  publishedAt: {
    type: Date,
    index: true
  },
  source: {
    id: String,
    name: String
  },
  author: String,
  category: {
    type: String,
    enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
    index: true
  },
  language: {
    type: String,
    default: 'en',
    index: true
  },
  country: {
    type: String,
    default: 'us'
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ language: 1, publishedAt: -1 });
articleSchema.index({ 'source.name': 1 });
articleSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('Article', articleSchema);