import React, { useState } from 'react';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import BreakingNews from '../components/BreakingNews'; // Import the slider we built
import { newsAPI } from '../services/api';

const Search = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (query) => {
    if (!query.trim()) return; // Prevent empty searches

    setArticles([]); // Clear previous results for better UX
    setSearchQuery(query);
    setLoading(true);
    setError('');

    try {
      const response = await newsAPI.searchArticles({ q: query });
      
      // Some APIs return articles directly or within a data object
      const fetchedArticles = response.data?.articles || [];
      setArticles(fetchedArticles);
      setTotalResults(response.data?.totalResults || 0);
      
      if (fetchedArticles.length === 0) {
        setError('No articles found for this topic.');
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
      console.error('Search Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* 1. Breaking News Slider - Shows top results even before searching */}
      {articles.length > 0 && !loading && (
        <BreakingNews articles={articles.slice(0, 5)} />
      )}

      {/* 2. Hero Section */}
      <section className="hero-section" style={{ padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Explore News
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Search millions of articles from over 80,000 sources
        </p>
      </section>

      {/* 3. Search Bar Area */}
      <section className="search-section" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* 4. Results Info Bar */}
      {searchQuery && !loading && totalResults > 0 && (
        <div className="results-info" style={{ marginBottom: '1.5rem', fontWeight: '500' }}>
          <span style={{ color: '#2563eb' }}>{totalResults}</span> results for "{searchQuery}"
        </div>
      )}

      {/* 5. Feedback States (Loading/Error) */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#667eea', fontWeight: 'bold' }}>
            Fetching latest updates...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="error-box" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
        </div>
      )}

      {/* 6. News Grid */}
      <section className="news-grid">
        {articles.map((article, index) => (
          <NewsCard 
            key={`${article.url}-${index}`} // Better key than just index
            article={article} 
          />
        ))}
      </section>

      {/* 7. Empty State */}
      {!loading && searchQuery && articles.length === 0 && !error && (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>📁</div>
          <h3>We couldn't find matches</h3>
          <p>Try using more general keywords or check your spelling.</p>
        </div>
      )}
    </div>
  );
};

export default Search;