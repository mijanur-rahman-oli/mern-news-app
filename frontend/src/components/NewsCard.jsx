import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../services/api';

const NewsCard = ({ article, isFavorite = false, onFavoriteChange }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async () => {
    if (!user) {
      alert('Please login to save favorites');
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await favoritesAPI.removeFavorite(article._id || article.url);
        setSaved(false);
      } else {
        await favoritesAPI.addFavorite(article);
        setSaved(true);
      }
      if (onFavoriteChange) onFavoriteChange();
    } catch (error) {
      console.error('Favorite error:', error);
      alert('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return diffHours < 1 ? 'Just now' : `${diffHours}h ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="news-card">
      <img 
        src={article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image'} 
        alt={article.title}
        className="news-image"
        onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'}
      />
      
      <div className="news-content">
        <div className="news-header">
          <span className="news-source">{article.source?.name || 'Unknown'}</span>
          {user && (
            <button 
              onClick={handleFavorite}
              className={`btn-favorite ${saved ? 'saved' : ''}`}
              disabled={loading}
            >
              {saved ? '❤️' : '🤍'}
            </button>
          )}
        </div>
        
        <h3 className="news-title">{article.title}</h3>
        <p className="news-description">
          {article.description?.substring(0, 150)}...
        </p>
        
        <div className="news-footer">
          <span className="news-date">{formatDate(article.publishedAt)}</span>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="news-link"
          >
            Read More →
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;