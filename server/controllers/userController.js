const db = require('../config/db');

const userController = {
  getUserProfile: async (req, res) => {
    try {
      const { id: identifier } = req.params;

      const [users] = await db.query(
        'SELECT id, username, email, avatar, bio, cover_index, created_at FROM users WHERE username = ?',
        [String(identifier)]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const loggedInUserId = req.user?.userId || null;
      let recipesQuery = `
        SELECT r.*, 
          COUNT(DISTINCT l.user_id) as likes_count,
          COUNT(DISTINCT c.id) as comments_count
          ${loggedInUserId ? ', MAX(CASE WHEN l3.user_id = ? THEN 1 ELSE 0 END) as isLiked, MAX(CASE WHEN sr.user_id = ? THEN 1 ELSE 0 END) as isSaved' : ''}
        FROM recipes r
        LEFT JOIN likes l ON r.id = l.recipe_id
        LEFT JOIN comments c ON r.id = c.recipe_id
        ${loggedInUserId ? 'LEFT JOIN likes l3 ON r.id = l3.recipe_id AND l3.user_id = ? LEFT JOIN saved_recipes sr ON r.id = sr.recipe_id AND sr.user_id = ?' : ''}
        WHERE r.user_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;
      const recipeParams = [];
      if (loggedInUserId) recipeParams.push(loggedInUserId, loggedInUserId, loggedInUserId, loggedInUserId);
      recipeParams.push(users[0].id);

      const [recipes] = await db.query(recipesQuery, recipeParams);

      res.json({
        user: {
          ...users[0],
          recipes_count: recipes.length,
        },
        recipes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { username, avatar, bio, cover_index } = req.body;

      if (parseInt(id) !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this profile' });
      }

      await db.query(
        'UPDATE users SET username = ?, avatar = ?, bio = ?, cover_index = ? WHERE id = ?',
        [username, avatar || null, bio || null, cover_index ?? 0, id]
      );

      const [updated] = await db.query(
        'SELECT id, username, email, avatar, bio, cover_index, created_at FROM users WHERE id = ?',
        [id]
      );

      res.json(updated[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  followUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (parseInt(id) === userId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      const [existing] = await db.query(
        'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
        [userId, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Already following this user' });
      }

      await db.query(
        'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
        [userId, id]
      );

      const [follower] = await db.query(
        'SELECT username FROM users WHERE id = ?',
        [userId]
      );
      const followerName = follower[0]?.username || 'Someone';
      const notifMessage = `👤 ${followerName} started following you`;
      
      await db.query(
        'INSERT INTO notifications (user_id, type, related_id, message) VALUES (?, ?, ?, ?)',
        [id, 'follow', userId, notifMessage]
      ).catch(e => console.error('Failed to insert follow notification', e));

      if (req.io) {
        req.io.to(id.toString()).emit('new_notification', {
          type: 'follow',
          message: notifMessage,
          actor_username: followerName,
        });
      }

      res.json({ message: 'User followed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await db.query(
        'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
        [userId, id]
      );

      const [follower] = await db.query(
        'SELECT username FROM users WHERE id = ?',
        [userId]
      );
      const followerName = follower[0]?.username || 'Someone';
      const notifMessage = `👤 ${followerName} started following you`;
      
      await db.query(
        'DELETE FROM notifications WHERE user_id = ? AND type = "follow" AND related_id = ? AND message = ?',
        [id, userId, notifMessage]
      ).catch(e => console.error('Failed to delete follow notification', e));

      res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getFollowers: async (req, res) => {
    try {
      const { id: identifier } = req.params;
      
      const [users] = await db.query('SELECT id FROM users WHERE username = ?', [String(identifier)]);
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });
      const userId = users[0].id;

      const [followers] = await db.query(`
        SELECT u.id, u.username, u.avatar, u.bio
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?
        ORDER BY f.created_at DESC
      `, [userId]);res.json(followers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getFollowing: async (req, res) => {
    try {
      const { id: identifier } = req.params;

      const [users] = await db.query('SELECT id FROM users WHERE username = ?', [String(identifier)]);
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });
      const userId = users[0].id;

      const [following] = await db.query(`
        SELECT u.id, u.username, u.avatar, u.bio
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ?
        ORDER BY f.created_at DESC
      `, [userId]);res.json(following);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getLikedRecipes: async (req, res) => {
    try {
      const { id: identifier } = req.params;

      const [users] = await db.query('SELECT id FROM users WHERE username = ?', [String(identifier)]);
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });
      const userId = users[0].id;

      const loggedInUserId = req.user?.userId || null;
      let query = `
        SELECT r.*, u.username, u.avatar,
          COUNT(DISTINCT l2.user_id) as likes_count,
          COUNT(DISTINCT c.id) as comments_count
          ${loggedInUserId ? ', MAX(CASE WHEN l3.user_id = ? THEN 1 ELSE 0 END) as isLiked, MAX(CASE WHEN sr.user_id = ? THEN 1 ELSE 0 END) as isSaved' : ''}
        FROM likes l
        JOIN recipes r ON l.recipe_id = r.id
        JOIN users u ON r.user_id = u.id
        LEFT JOIN likes l2 ON r.id = l2.recipe_id
        LEFT JOIN comments c ON r.id = c.recipe_id
        ${loggedInUserId ? 'LEFT JOIN likes l3 ON r.id = l3.recipe_id AND l3.user_id = ? LEFT JOIN saved_recipes sr ON r.id = sr.recipe_id AND sr.user_id = ?' : ''}
        WHERE l.user_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;
      const params = [];
      if (loggedInUserId) params.push(loggedInUserId, loggedInUserId, loggedInUserId, loggedInUserId);
      params.push(userId);

      const [likedRecipes] = await db.query(query, params);

      res.json(likedRecipes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  removeFollower: async (req, res) => {
    try {
      const { followerId } = req.params;
      const userId = req.user.userId;

      await db.query(
        'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
        [followerId, userId]
      );

      res.json({ message: 'Follower removed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = userController;