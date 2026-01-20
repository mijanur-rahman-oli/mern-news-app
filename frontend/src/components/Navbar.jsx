import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to identify the current page

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper function to apply active styles to links
  const isActive = (path) => location.pathname === path;

  const styles = {
    activeLink: {
      color: '#2563eb', // Professional blue
      fontWeight: '700',
      borderBottom: '2px solid #2563eb',
      paddingBottom: '4px'
    },
    userChip: {
      backgroundColor: '#f3f4f6',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}></span>
          <span style={{ letterSpacing: '-0.5px' }}>World<span style={{ color: '#2563eb' }}>News</span></span>
        </Link>
        
        <div className="nav-menu">
          <Link 
            to="/" 
            className="nav-link" 
            style={isActive('/') ? styles.activeLink : {}}
          >
            Home
          </Link>
          <Link 
            to="/search" 
            className="nav-link" 
            style={isActive('/search') ? styles.activeLink : {}}
          >
            Search
          </Link>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link 
                to="/favorites" 
                className="nav-link"
                style={isActive('/favorites') ? styles.activeLink : {}}
              >
                Saved
              </Link>
              
              <div style={styles.userChip}>
                <span>{user.name}</span>
                <button 
                  onClick={handleLogout} 
                  className="btn-logout"
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '12px', 
                    background: '#ef4444', 
                    border: 'none', 
                    color: 'white', 
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-link btn-login" style={{ transition: 'all 0.3s' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;