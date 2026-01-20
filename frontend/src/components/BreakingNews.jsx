import React, { useState, useEffect } from 'react';

const BreakingNews = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play logic: move to next headline every 5 seconds
  useEffect(() => {
    if (articles.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [articles]);

  if (!articles || articles.length === 0) return null;

  const currentArticle = articles[currentIndex];

  const styles = {
    wrapper: {
      backgroundColor: '#111827', // Dark professional background
      color: 'white',
      padding: '10px 20px',
      borderRadius: '12px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    badge: {
      backgroundColor: '#ef4444', // Red "Breaking" tag
      color: 'white',
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      animation: 'pulse 2s infinite',
    },
    headline: {
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textDecoration: 'none',
      color: '#f3f4f6',
      flex: 1,
      transition: 'opacity 0.5s ease-in-out',
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.badge}>Breaking News</div>
      <a 
        href={currentArticle.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={styles.headline}
      >
        {currentArticle.title}
      </a>
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
        {currentIndex + 1} / {articles.length}
      </div>
    </div>
  );
};

export default BreakingNews;