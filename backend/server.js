require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({ 
    message: 'MERN News Aggregation API',
    version: '2.0.0',
    features: [
      'Category filtering',
      'Date range filtering',
      'Language filtering',
      'Source filtering',
      'Status management',
      'Auto-save to database',
      'Read tracking'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('--- MERN NEWS APP v2.0 - BACKEND STARTED ---');
  console.log(`Port: ${PORT}`);
  console.log(`MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not Connected'}`);
  console.log(`News API: ${process.env.NEWS_API_KEY ? 'Configured' : 'Missing'}`);
  
  console.log('\n--- AUTH ENDPOINTS ---');
  console.log('POST   /api/auth/register');
  console.log('POST   /api/auth/login');
  console.log('GET    /api/auth/me');
  
  console.log('\n--- NEWS ENDPOINTS (Auto-save to DB) ---');
  console.log('GET    /api/news/headlines (?category=tech&country=us&sources=...)');
  console.log('GET    /api/news/search (?q=...&from=...&to=...&language=...)');
  console.log('GET    /api/news/filtered (From DB)');
  console.log('GET    /api/news/sources');
  console.log('GET    /api/news/categories');
  console.log('PATCH  /api/news/:id/read');
  console.log('PATCH  /api/news/:id/status');
  
  console.log('\n--- FAVORITES ENDPOINTS ---');
  console.log('GET    /api/favorites');
  console.log('POST   /api/favorites');
  console.log('DELETE /api/favorites/:id');
  
  console.log('\n--- ADMIN ENDPOINTS ---');
  console.log('POST   /api/admin/fetch-all');
  console.log('POST   /api/admin/fetch-category');
  console.log('GET    /api/admin/statistics');
  
  console.log('\n--- ACTIVE FEATURES ---');
  console.log('- Category, Date, Language, and Source filtering');
  console.log('- Status management (active/archived/deleted)');
  console.log('- Auto-save fetched news to MongoDB');
  console.log('- Read tracking and Bulk fetch operations');
  console.log('--------------------------------------------');
});