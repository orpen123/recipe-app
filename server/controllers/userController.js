const db = require('../config/db');

const userController = {
  // GET /api/users/:id
  getUserProfile: async (req, res) => {
    try {
      const { id } = req.params;

      const [users] = await db.query(
        'SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?',
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's recipe count
      const [recipeCount] = await db.query(
        'SELECT COUNT(*) as count FROM recipes WHERE user_id = ?',
        [id]
      );

      // Get followers count
      const [followersCount] = await db.query(
        'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
        [id]
      );

      // Get following count
      const [followingCount] = await db.query(
        'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
        [id]
      );

      res.json({
        ...users[0],
        recipes_count: recipeCount[0].count,
        followers_count: followersCount[0].count,
        following_count: followingCount[0].count
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // PUT /api/users/:id
  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { username, avatar, bio } = req.body;

      // Check if user is updating their own profile
      if (parseInt(id) !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this profile' });
      }

      // Update profile
      await db.query(
        'UPDATE users SET username = ?, avatar = ?, bio = ? WHERE id = ?',
        [username, avatar, bio, id]
      );

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/users/:id/follow
  followUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Can't follow yourself
      if (parseInt(id) === userId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      // Check if already following
      const [existing] = await db.query(
        'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
        [userId, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Already following this user' });
      }

      // Add follow
      await db.query(
        'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
        [userId, id]
      );

      res.json({ message: 'User followed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // DELETE /api/users/:id/follow
  unfollowUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await db.query(
        'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
        [userId, id]
      );

      res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/users/:id/followers
  getFollowers: async (req, res) => {
    try {
      const { id } = req.params;

      const [followers] = await db.query(`
        SELECT u.id, u.username, u.avatar
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?
      `, [id]);

      res.json(followers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/users/:id/following
  getFollowing: async (req, res) => {
    try {
      const { id } = req.params;

      const [following] = await db.query(`
        SELECT u.id, u.username, u.avatar
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ?
      `, [id]);

      res.json(following);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = userController;