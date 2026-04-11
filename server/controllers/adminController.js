const db = require('../config/db');

const adminController = {
  
  getStats: async (req, res) => {
    try {
      const [[userCount]] = await db.query('SELECT COUNT(*) as count FROM users');
      const [[recipeCount]] = await db.query('SELECT COUNT(*) as count FROM recipes');
      const [[commentCount]] = await db.query('SELECT COUNT(*) as count FROM comments');
      const [[reviewCount]] = await db.query('SELECT COUNT(*) as count FROM reviews');

      const [topUsers] = await db.query(`
        SELECT u.id, u.username, u.avatar,
        (SELECT COUNT(*) FROM recipes WHERE user_id = u.id) as total_recipes,
        (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as total_comments
        FROM users u
        ORDER BY (total_recipes + total_comments) DESC
        LIMIT 5
      `);

      res.json({
        totalUsers: userCount.count,
        totalRecipes: recipeCount.count,
        totalInteractions: commentCount.count + reviewCount.count,
        topUsers
      });
    } catch (error) {
      console.error('Admin Stats Error:', error);
      res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const [users] = await db.query(`
        SELECT id, username, email, is_admin, created_at,
        (SELECT COUNT(*) FROM recipes WHERE user_id = users.id) as recipes_count
        FROM users
        ORDER BY created_at DESC
      `);
      res.json(users);
    } catch (error) {
      console.error('Admin Users Error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const [user] = await db.query('SELECT is_admin FROM users WHERE id = ?', [id]);
      if (user.length > 0 && user[0].is_admin) {
        return res.status(403).json({ error: 'Cannot delete an administrator account' });
      }

      await db.query('DELETE FROM users WHERE id = ?', [id]);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Admin Delete User Error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  getAllRecipes: async (req, res) => {
    try {
      const [recipes] = await db.query(`
        SELECT r.id, r.title, r.category, r.created_at, u.username as author_name,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as likes_count
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);
      res.json(recipes);
    } catch (error) {
      console.error('Admin Recipes Error:', error);
      res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  },

  deleteRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM recipes WHERE id = ?', [id]);
      res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error('Admin Delete Recipe Error:', error);
      res.status(500).json({ error: 'Failed to delete recipe' });
    }
  }
};

module.exports = adminController;
