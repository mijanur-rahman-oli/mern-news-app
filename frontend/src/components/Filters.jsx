import React, { useState } from 'react';

const Filters = ({ onFilterChange, isLoading }) => {
  const [filters, setFilters] = useState({
    country: 'us',
    category: '',
    language: 'en',
    fromDate: '',
    toDate: '',
  });

  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => onFilterChange(filters);

  const handleReset = () => {
    const reset = { country: 'us', category: '', language: 'en', fromDate: '', toDate: '' };
    setFilters(reset);
    onFilterChange(reset);
  };

  const styles = {
    container: {
      backgroundColor: '#ffffff',
      padding: '8px',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f0f0f0',
      marginBottom: '30px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      paddingBottom: '10px',
      borderBottom: '1px solid #f9fafb'
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#111827',
      margin: 0
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '20px',
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
    },
    input: {
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      color: '#374151',
      backgroundColor: '#f9fafb',
      outline: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    actionArea: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px',
      paddingTop: '20px',
      borderTop: '1px solid #f9fafb'
    },
    btnReset: {
      padding: '10px 20px',
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    btnApply: {
      padding: '10px 24px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
      transition: 'all 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Filter Content</h2>
        {isLoading && <span style={{fontSize: '12px', color: '#2563eb', fontWeight: '500'}}>Refreshing...</span>}
      </div>

      <div style={styles.filterGrid}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Region</label>
          <select style={styles.input} value={filters.country} onChange={(e) => handleChange('country', e.target.value)}>
            <option value="us">United States</option>
            <option value="gb">United Kingdom</option>
            <option value="in">India</option>
            <option value="ca">Canada</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Category</label>
          <select style={styles.input} value={filters.category} onChange={(e) => handleChange('category', e.target.value)}>
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="business">Business</option>
            <option value="science">Science</option>
            <option value="health">Health</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Start Date</label>
          <input type="date" style={styles.input} value={filters.fromDate} onChange={(e) => handleChange('fromDate', e.target.value)} />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>End Date</label>
          <input type="date" style={styles.input} value={filters.toDate} onChange={(e) => handleChange('toDate', e.target.value)} />
        </div>
      </div>

      <div style={styles.actionArea}>
        <button 
          style={styles.btnReset} 
          onClick={handleReset}
          onMouseEnter={() => setHoveredBtn('reset')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          Reset
        </button>
        <button 
          style={{
            ...styles.btnApply,
            backgroundColor: hoveredBtn === 'apply' ? '#1d4ed8' : '#2563eb',
            opacity: isLoading ? 0.7 : 1
          }} 
          onClick={handleApply}
          disabled={isLoading}
          onMouseEnter={() => setHoveredBtn('apply')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>
    </div>
  );
};

export default Filters;