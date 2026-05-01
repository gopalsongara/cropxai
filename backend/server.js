const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
const cropRoutes = require('./routes/crop.routes');
const weatherRoutes = require('./routes/weather.routes');
const marketRoutes = require('./routes/market.routes');
const pestRoutes = require('./routes/pest.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const notificationRoutes = require('./routes/notification.routes');
const { startNotificationCron } = require('./jobs/notification.cron');
const { verifyToken, authorizeRoles } = require('./middleware/auth.middleware');
const { testGroqAI } = require('./controllers/ai.controller');

dotenv.config({ path: path.resolve(__dirname, '.env') });
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log('GROQ KEY:', process.env.GROQ_API_KEY ? 'Loaded' : 'Missing');
}

const app = express();
const PORT = process.env.PORT || 4000;

const defaultAllowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);

const envAllowedOrigins = String(process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    if (!allowedOrigins.has(origin)) {
      return res.status(403).json({ success: false, error: 'Origin not allowed by CORS policy' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use((req, _res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok', service: 'cropxai-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.get('/api/test-ai', testGroqAI);
app.use('/api/crop', cropRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/pest', pestRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

// Sample protected endpoints for future module integration (AI, uploads, lab ops).
app.get('/api/protected/user', verifyToken, (req, res) => {
  res.status(200).json({ message: 'User access granted', user: req.user });
});

app.get('/api/protected/admin', verifyToken, authorizeRoles('labadmin'), (_req, res) => {
  res.status(200).json({ message: 'Admin access granted' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const startServer = async () => {
  try {
    await connectDB();
    startNotificationCron();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on ${PORT}`);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${PORT}`);
      // eslint-disable-next-line no-console
      console.log('Registered routes:');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/health');
      // eslint-disable-next-line no-console
      console.log('  POST /api/auth/register');
      // eslint-disable-next-line no-console
      console.log('  POST /api/auth/login');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/auth/me');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/test-ai');
      console.log('  GET  /api/ai/test-ai');
      console.log('  POST /api/ai/chat');
      // eslint-disable-next-line no-console
      console.log('  POST /api/ai/smart-insights');
      // eslint-disable-next-line no-console
      console.log('  POST /api/crop/recommend');
      // eslint-disable-next-line no-console
      console.log('  POST /api/pest/detect');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/pest/recent');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/weather/current');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/weather/forecast');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/market?crop=wheat');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/protected/user');
      // eslint-disable-next-line no-console
      console.log('  GET  /api/protected/admin');
    }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('DB Startup Error:', error.message);
    // eslint-disable-next-line no-console
    console.error('Check MongoDB Atlas network access (0.0.0.0/0) and database user permissions.');
  }
};

startServer();
