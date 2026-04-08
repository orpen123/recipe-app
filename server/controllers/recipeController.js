const db = require('../config/db');

const recipeController = {

  // GET /api/recipes
  getAllRecipes: async (req, res) => {
    try {
      const { search } = req.query;
      const userId = req.user?.userId || null;
      
      let query = `
        SELECT r.*, u.username, u.avatar,
          COUNT(DISTINCT l.user_id) as likes_count,
          COUNT(DISTINCT c.id) as comments_count
          ${userId ? ', MAX(CASE WHEN l2.user_id = ? THEN 1 ELSE 0 END) as isLiked, MAX(CASE WHEN sr.user_id = ? THEN 1 ELSE 0 END) as isSaved' : ''}
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN likes l ON r.id = l.recipe_id
        LEFT JOIN comments c ON r.id = c.recipe_id
        ${userId ? 'LEFT JOIN likes l2 ON r.id = l2.recipe_id AND l2.user_id = ? LEFT JOIN saved_recipes sr ON r.id = sr.recipe_id AND sr.user_id = ?' : ''}
      `;
      const params = [];
      if (userId) {
        params.push(userId, userId, userId, userId);
      }

      if (search) {
        query += ` WHERE (r.title LIKE ? OR r.description LIKE ? OR u.username LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      query += ' GROUP BY r.id ORDER BY r.created_at DESC';

      const [recipes] = await db.query(query, params);
      res.json(recipes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/recipes/saved
  getSavedRecipes: async (req, res) => {
    try {
      const userId = req.user.userId;

      const [recipes] = await db.query(`
        SELECT r.*, u.username, u.avatar,
          (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as likes_count,
          (SELECT COUNT(*) FROM comments WHERE recipe_id = r.id) as comments_count
        FROM saved_recipes sr
        JOIN recipes r ON sr.recipe_id = r.id
        JOIN users u ON r.user_id = u.id
        WHERE sr.user_id = ?
        ORDER BY r.created_at DESC
      `, [userId]);

      res.json(recipes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/recipes/:id
  getRecipeById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || null;

      const [recipes] = await db.query(`
        SELECT r.*, u.username, u.avatar
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `, [id]);

      if (recipes.length === 0) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      const [ingredients] = await db.query(
        'SELECT * FROM ingredients WHERE recipe_id = ?', [id]
      );

      const [likesCount] = await db.query(
        'SELECT COUNT(*) as count FROM likes WHERE recipe_id = ?', [id]
      );

      let isLiked = false;
      let isSaved = false;

      if (userId) {
        const [liked] = await db.query(
          'SELECT * FROM likes WHERE user_id = ? AND recipe_id = ?', [userId, id]
        );
        const [saved] = await db.query(
          'SELECT * FROM saved_recipes WHERE user_id = ? AND recipe_id = ?', [userId, id]
        );
        isLiked = liked.length > 0;
        isSaved = saved.length > 0;
      }

      res.json({
        ...recipes[0],
        ingredients,
        likes_count: likesCount[0].count,
        isLiked,
        isSaved,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/recipes
  createRecipe: async (req, res) => {
    try {
      const { title, description, image, category, prep_time, cook_time, servings, ingredients } = req.body;
      const userId = req.user.userId;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const [result] = await db.query(
        `INSERT INTO recipes (user_id, title, description, image, category, prep_time, cook_time, servings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, title, description || null, image || null, category || null, prep_time || null, cook_time || null, servings || null]
      );

      const recipeId = result.insertId;

      if (ingredients && ingredients.length > 0) {
        const validIngredients = ingredients.filter(ing => ing.name?.trim());
        if (validIngredients.length > 0) {
          const ingredientValues = validIngredients.map(ing => [recipeId, ing.name.trim(), ing.quantity || '']);
          await db.query(
            'INSERT INTO ingredients (recipe_id, name, quantity) VALUES ?',
            [ingredientValues]
          );
        }
      }

      res.status(201).json({ message: 'Recipe created successfully', id: recipeId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // PUT /api/recipes/:id
  updateRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { title, description, image, category, prep_time, cook_time, servings, ingredients } = req.body;

      const [recipes] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);

      if (recipes.length === 0) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      if (recipes[0].user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this recipe' });
      }

      const finalImage = image || recipes[0].image;

      await db.query(
        `UPDATE recipes 
         SET title = ?, description = ?, image = ?, category = ?, 
             prep_time = ?, cook_time = ?, servings = ?
         WHERE id = ?`,
        [title, description, finalImage, category, prep_time || null, cook_time || null, servings || null, id]
      );

      if (Array.isArray(ingredients)) {
        await db.query('DELETE FROM ingredients WHERE recipe_id = ?', [id]);

        const validIngredients = ingredients.filter(ing => ing.name?.trim());

        if (validIngredients.length > 0) {
          const ingredientValues = validIngredients.map(ing => [id, ing.name.trim(), ing.quantity || '']);
          await db.query(
            'INSERT INTO ingredients (recipe_id, name, quantity) VALUES ?',
            [ingredientValues]
          );
        }
      }

      res.json({ message: 'Recipe updated successfully' });
    } catch (error) {
      console.error('updateRecipe error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // DELETE /api/recipes/:id
  deleteRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const [recipes] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);

      if (recipes.length === 0) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      if (recipes[0].user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this recipe' });
      }

      await db.query('DELETE FROM recipes WHERE id = ?', [id]);
      res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/recipes/:id/like
  likeRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const [existing] = await db.query(
        'SELECT * FROM likes WHERE user_id = ? AND recipe_id = ?',
        [userId, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Recipe already liked' });
      }

      await db.query(
        'INSERT INTO likes (user_id, recipe_id) VALUES (?, ?)',
        [userId, id]
      );

      res.json({ message: 'Recipe liked successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // DELETE /api/recipes/:id/like
  unlikeRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await db.query(
        'DELETE FROM likes WHERE user_id = ? AND recipe_id = ?',
        [userId, id]
      );

      res.json({ message: 'Recipe unliked successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/recipes/:id/save
  saveRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const [existing] = await db.query(
        'SELECT * FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
        [userId, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Recipe already saved' });
      }

      await db.query(
        'INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)',
        [userId, id]
      );

      res.json({ message: 'Recipe saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // DELETE /api/recipes/:id/save
  unsaveRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await db.query(
        'DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
        [userId, id]
      );

      res.json({ message: 'Recipe unsaved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = recipeController;