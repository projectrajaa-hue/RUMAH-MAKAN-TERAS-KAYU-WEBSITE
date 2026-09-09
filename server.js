const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Trust proxy for ngrok and Render
app.set('trust proxy', 1);

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL || 'https://warung-ibu-tami.onrender.com',
  'https://warung-ibu-tami-frontend.onrender.com',
  'https://rumah-makan-api.onrender.com',
  /\.ngrok(-free)?\.dev$/, // Allow ngrok domains
];

// CORS configuration - Handle both development and production
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return allowedOrigin === origin;
  });
  
  // Set CORS headers
  if (isAllowed || process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Skip ngrok browser warning (for development with ngrok)
  res.setHeader('ngrok-skip-browser-warning', 'true');
  res.setHeader('ngrok-skip-browser-warning-html', 'true');
  
  // Always respond to OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  next();
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Import models
const { sequelize, Menu, Stock, Order, User, MenuStock, Settings } = require('./models');

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Sync database (use migrations for schema changes)
sequelize.sync({ force: false })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database sync error:', err));

// Routes
const auth = require('./middleware/auth');

// Auth routes (must come first - no auth needed)
app.use('/api/auth', require('./routes/auth'));

// Public API routes
app.use('/api/settings', require('./routes/settings'));
app.use('/api/menus/public', require('./routes/menusPublic'));
app.use('/api/orders/public', require('./routes/ordersPublic'));

// Protected routes (auth required)
app.use('/api/menus', auth, require('./routes/menus'));
app.use('/api/stocks', auth, require('./routes/stocks'));
app.use('/api/menu-stocks', auth, require('./routes/menuStocks'));
app.use('/api/orders', auth, require('./routes/orders'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
