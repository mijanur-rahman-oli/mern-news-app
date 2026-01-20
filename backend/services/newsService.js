// services/newsService.js
const NewsAPI = require('newsapi');
const Article = require('../models/Article');

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

class NewsService {
  // Fetch and store news by category
  async fetchAndStoreByCategory(category, country = 'us', language = 'en') {
    try {
      const response = await newsapi.v2.topHeadlines({
        category,
        country,
        pageSize: 100
      });

      const savedArticles = await this.bulkSaveArticles(
        response.articles,
        { category, language, country }
      );

      return {
        success: true,
        fetched: response.articles.length,
        saved: savedArticles.length,
        category
      };
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error.message);
      return {
        success: false,
        error: error.message,
        category
      };
    }
  }

  // Bulk save articles to database
  async bulkSaveArticles(articles, metadata = {}) {
    const savedArticles = [];
    const errors = [];

    for (const article of articles) {
      try {
        if (!article.url || !article.title) continue;

        const existingArticle = await Article.findOne({ url: article.url });

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
            category: metadata.category || 'general',
            language: metadata.language || 'en',
            country: metadata.country || 'us',
            status: 'active'
          });

          await newArticle.save();
          savedArticles.push(newArticle);
        }
      } catch (error) {
        errors.push({
          url: article.url,
          error: error.message
        });
      }
    }

    return savedArticles;
  }

  // Fetch all categories for a country
  async fetchAllCategories(country = 'us', language = 'en') {
    const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    const results = [];

    for (const category of categories) {
      const result = await this.fetchAndStoreByCategory(category, country, language);
      results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  // Get statistics
  async getStatistics() {
    try {
      const total = await Article.countDocuments();
      const byCategory = await Article.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      const byLanguage = await Article.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } }
      ]);
      const byStatus = await Article.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      return {
        total,
        byCategory,
        byLanguage,
        byStatus
      };
    } catch (error) {
      throw new Error('Error getting statistics: ' + error.message);
    }
  }
}

module.exports = new NewsService();