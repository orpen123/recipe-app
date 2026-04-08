const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authController = {
  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user already exists
      const [existingUser] = await db.query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const [result] = await db.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      res.status(201).json({
        message: 'User created successfully',
        userId: result.insertId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/auth/me
  getCurrentUser: async (req, res) => {
    try {
      const [users] = await db.query(
        'SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?',
        [req.user.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(users[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = authController;