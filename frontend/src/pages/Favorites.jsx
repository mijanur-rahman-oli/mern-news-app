import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../services/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await favoritesAPI.getFavorites();
      setFavorites(response.data.favorites);
    } catch (err) {
      setError('Failed to fetch favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = () => {
    fetchFavorites();
  };

  return (
    <div className="page-container">
      <section className="hero-section">
        <h1>❤️ Your Favorites</h1>
        <p>Articles you've saved for later</p>
      </section>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading favorites...</p>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <section className="news-grid">
        {favorites.map((article) => (
          <NewsCard 
            key={article._id} 
            article={article} 
            isFavorite={true}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}
      </section>

      {!loading && favorites.length === 0 && (
        <div className="empty-state">
          <h3>No favorites yet</h3>
          <p>Start saving articles you like!</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Browse News
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;