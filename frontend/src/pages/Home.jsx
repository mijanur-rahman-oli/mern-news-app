import React, { useState, useEffect, useCallback } from 'react';
import NewsCard from '../components/NewsCard';
import Filters from '../components/Filters';
import { newsAPI } from '../services/api';
import BreakingNews from '../components/BreakingNews';
const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ country: 'us', category: '' });

  const fetchHeadlines = useCallback(async (customFilters) => {
    setLoading(true);
    setError('');
    try {
      const response = await newsAPI.getHeadlines(customFilters);
      setArticles(response.data?.articles || []);
    } catch (err) {
      setError('We are having trouble reaching the news servers. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchHeadlines(filters);
  }, [fetchHeadlines, filters]); 

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  return (
    <div className="page-container">

      {articles.length > 0 && <BreakingNews articles={articles.slice(0, 10)} />}

      <section className="filter-section">
        <Filters onFilterChange={handleFilterChange} isLoading={loading} />
      </section>

      {error && (
        <div className="error-box" style={{ textAlign: 'center', margin: '2rem 0' }}>
          <p>{error}</p>
          <button onClick={() => fetchHeadlines(filters)} className="btn-primary">Retry</button>
        </div>
      )}

      <section className="news-grid">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="news-card skeleton" style={skeletonStyles.card}>
              <div style={skeletonStyles.image}></div>
              <div style={skeletonStyles.content}>
                <div style={skeletonStyles.title}></div>
                <div style={skeletonStyles.text}></div>
              </div>
            </div>
          ))
        ) : (
          articles.map((article, index) => (
            <NewsCard key={`${article.url}-${index}`} article={article} />
          ))
        )}
      </section>

      {/* 5. Empty State */}
      {!loading && articles.length === 0 && !error && (
        <div className="empty-state">
          <h3>No articles found</h3>
          <p>Try adjusting your country or category settings.</p>
        </div>
      )}
    </div>
  );
};

// Quick Skeleton Styles
const skeletonStyles = {
  card: { height: '350px', backgroundColor: '#fff', overflow: 'hidden' },
  image: { height: '200px', backgroundColor: '#e5e7eb', animation: 'pulse 1.5s infinite' },
  content: { padding: '1.5rem' },
  title: { height: '20px', width: '80%', backgroundColor: '#e5e7eb', marginBottom: '10px', borderRadius: '4px' },
  text: { height: '15px', width: '100%', backgroundColor: '#f3f4f6', borderRadius: '4px' }
};

export default Home;