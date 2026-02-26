const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware – allow Vercel frontend in production; set FRONTEND_URL on Render
const normalizeOrigin = (url) => (url ? url.replace(/\/+$/, '') : url);
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (no Origin header), and allow all in dev if FRONTEND_URL is unset.
    if (!origin || allowedOrigins.length === 0) return callback(null, true);

    const normalized = normalizeOrigin(origin);
    return callback(null, allowedOrigins.includes(normalized));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Plowing Service Booking Platform API' });
});

// API Routes
app.use('/api', require('./routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
