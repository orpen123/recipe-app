const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port (dev) or configured CLIENT_URL (prod)
    const allowed = process.env.CLIENT_URL || 'http://localhost:5173';
    if (!origin || origin === allowed || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});