const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const allowed = process.env.CLIENT_URL || '';
  if (allowed && origin === allowed) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  if (/^http:\/\/192\.168\./.test(origin)) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  return false;
}

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recipes', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
  });
});

io.on('connection', (socket) => {
  socket.on('setup', (userId) => {
    socket.userId = userId.toString();
    socket.join(userId.toString());
    socket.emit('connected');
  });

  socket.on('join_chat', (otherUserId) => {
    socket.activeChat = otherUserId.toString();
  });

  socket.on('leave_chat', () => {
    socket.activeChat = null;
  });

  socket.on('typing', (receiverId) => {
    if (socket.userId) {
      socket.to(receiverId.toString()).emit('typing', socket.userId);
    }
  });

  socket.on('stop_typing', (receiverId) => {
    if (socket.userId) {
      socket.to(receiverId.toString()).emit('stop_typing', socket.userId);
    }
  });

  socket.on('disconnect', () => { });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server and WebSockets running on port ${PORT}`);
});