import React, { useState, useEffect } from 'react';
import Filters from './Filters';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [dataSource, setDataSource] = useState('api'); // 'api' or 'database'

  useEffect(() => {
    fetchNews({});
  }, []);

  const fetchNews = async (filters) => {
    setLoading(true);
    setError(null);

    try {
      let url = '';
      const params = new URLSearchParams();

      if (dataSource === 'api') {
        // Fetch from NewsAPI (auto-saves to DB)
        if (filters.search) {
          url = 'http://localhost:5000/api/news/search';
          params.append('q', filters.search);
          if (filters.fromDate) params.append('from', filters.fromDate);
          if (filters.toDate) params.append('to', filters.toDate);
        } else {
          url = 'http://localhost:5000/api/news/headlines';
          if (filters.category) params.append('category', filters.category);
        }
        
        if (filters.country) params.append('country', filters.country);
        if (filters.language) params.append('language', filters.language);
        if (filters.source) params.append('sources', filters.source);
      } else {
        // Fetch from database with all filters
        url = 'http://localhost:5000/api/news/filtered';
        
        if (filters.category) params.append('category', filters.category);
        if (filters.language) params.append('language', filters.language);
        if (filters.source) params.append('source', filters.source);
        if (filters.status) params.append('status', filters.status);
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        if (filters.search) params.append('search', filters.search);
      }

      params.append('page', pagination.page);
      params.append('pageSize', pagination.limit);

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles || []);
        
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total,
            pages: data.pagination.pages
          }));
        } else if (data.totalResults) {
          setPagination(prev => ({
            ...prev,
            total: data.totalResults,
            pages: Math.ceil(data.totalResults / prev.limit)
          }));
        }
      } else {
        setError(data.message || 'Failed to fetch news');
      }
    } catch (err) {
      setError('Network error. Please check if backend is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchNews(filters);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDataSource = () => {
    const newSource = dataSource === 'api' ? 'database' : 'api';
    setDataSource(newSource);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchNews({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📰 News Aggregator</h1>
          <p className="text-gray-600">Stay updated with the latest news from around the world</p>
        </div>

        {/* Data Source Toggle */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Data Source</h3>
              <p className="text-sm text-gray-600">
                {dataSource === 'api' 
                  ? '🌐 Fetching from News API (auto-saves to database)' 
                  : '💾 Querying from local database'}
              </p>
            </div>
            <button
              onClick={toggleDataSource}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Switch to {dataSource === 'api' ? 'Database' : 'News API'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <Filters onFilterChange={handleFilterChange} isLoading={loading} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">⚠️ Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading news...</p>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article, index) => (
                <div
                  key={article._id || index}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {article.source?.name && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {article.source.name}
                        </span>
                      )}
                      {article.category && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {article.category}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.description || 'No description available.'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      {article.author && (
                        <span className="truncate">By {article.author}</span>
                      )}
                      {article.publishedAt && (
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Previous
                </button>
                
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-600">📭 No articles found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;