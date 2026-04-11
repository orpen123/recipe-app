const db = require('../config/db');

const recipeController = {

  getAllRecipes: async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user?.userId || null;
    
    let query = `
      SELECT r.*, u.username, u.avatar,
        COUNT(DISTINCT l.user_id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count,
        ROUND(AVG(rv.rating), 1) AS avg_rating,
        COUNT(DISTINCT rv.id) AS total_reviews
        ${userId ? ', MAX(CASE WHEN l2.user_id = ? THEN 1 ELSE 0 END) as isLiked, MAX(CASE WHEN sr.user_id = ? THEN 1 ELSE 0 END) as isSaved' : ''}
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN likes l ON r.id = l.recipe_id
      LEFT JOIN comments c ON r.id = c.recipe_id
      LEFT JOIN reviews rv ON r.id = rv.recipe_id
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

  getRecipeById: async (req, res) => {
    try {

      const { idAndSlug } = req.params;
      const id = idAndSlug.split('-')[0];

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

      const recipe = recipes[0];

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
          for (const ing of validIngredients) {
            await db.query(
              'INSERT INTO ingredients (recipe_id, name, quantity) VALUES (?, ?, ?)',
              [recipeId, ing.name.trim(), ing.quantity || '']
            ).catch(err => console.error('Ingredient insert error:', err));
          }
        }
      }

      const [followers] = await db.query('SELECT follower_id FROM follows WHERE following_id = ?', [userId]);
      if (followers.length > 0) {
        const [userRows] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
        const creatorName = userRows[0]?.username || 'Someone';
        const notifMessage = `✨ ${creatorName} posted a new recipe: "${title}"`;

        const notifValues = followers.map(f => [f.follower_id, 'new_recipe', recipeId, notifMessage]);
        await db.query(
          'INSERT INTO notifications (user_id, type, related_id, message) VALUES ?',
          [notifValues]
        ).catch(err => console.error('Error inserting follower notifications', err));

        if (req.io) {
          followers.forEach(f => {
            req.io.to(f.follower_id.toString()).emit('new_notification', {
              type: 'new_recipe',
              message: notifMessage,
              recipe_id: recipeId,
              recipe_title: title
            });
          });
        }
      }

      res.status(201).json({ message: 'Recipe created successfully', id: recipeId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

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
          for (const ing of validIngredients) {
            await db.query(
              'INSERT INTO ingredients (recipe_id, name, quantity) VALUES (?, ?, ?)',
              [id, ing.name.trim(), ing.quantity || '']
            ).catch(err => console.error('Ingredient update error:', err));
          }
        }
      }

      res.json({ message: 'Recipe updated successfully' });
    } catch (error) {
      console.error('updateRecipe error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

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

      const [recipes] = await db.query(
        'SELECT user_id, title FROM recipes WHERE id = ?',
        [id]
      );

      if (recipes.length > 0 && recipes[0].user_id !== userId) {
        const [liker] = await db.query(
          'SELECT username FROM users WHERE id = ?',
          [userId]
        );
        const likerName = liker[0]?.username || 'Someone';
        const notifMessage = `❤️ ${likerName} liked your recipe "${recipes[0].title}"`;
        await db.query(
          'INSERT INTO notifications (user_id, type, related_id, message) VALUES (?, ?, ?, ?)',
          [recipes[0].user_id, 'like', id, notifMessage]
        ).catch(e => console.error('Failed to insert like notification', e));

        if (req.io) {
          req.io.to(recipes[0].user_id.toString()).emit('new_notification', {
            type: 'like',
            message: notifMessage,
            recipe_id: id,
            recipe_title: recipes[0].title,
          });
        }
      }

      const [[{ count }]] = await db.query(
        'SELECT COUNT(*) as count FROM likes WHERE recipe_id = ?',
        [id]
      );

      res.json({ message: 'Recipe liked successfully', likes_count: count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getRecipeLikes: async (req, res) => {
    try {
      const { id } = req.params;
      const [likes] = await db.query(`
        SELECT u.id, u.username, u.avatar 
        FROM likes l
        JOIN users u ON l.user_id = u.id
        WHERE l.recipe_id = ?
      `, [id]);
      res.json(likes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  unlikeRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await db.query(
        'DELETE FROM likes WHERE user_id = ? AND recipe_id = ?',
        [userId, id]
      );

      const [recipes] = await db.query(
        'SELECT user_id, title FROM recipes WHERE id = ?',
        [id]
      );

      if (recipes.length > 0 && recipes[0].user_id !== userId) {
        const [liker] = await db.query(
          'SELECT username FROM users WHERE id = ?',
          [userId]
        );
        const likerName = liker[0]?.username || 'Someone';
        const notifMessage = `❤️ ${likerName} liked your recipe "${recipes[0].title}"`;
        
        await db.query(
          'DELETE FROM notifications WHERE user_id = ? AND type = "like" AND related_id = ? AND message = ?',
          [recipes[0].user_id, id, notifMessage]
        ).catch(e => console.error('Failed to delete like notification', e));
      }

      const [[{ count }]] = await db.query(
        'SELECT COUNT(*) as count FROM likes WHERE recipe_id = ?',
        [id]
      );

      res.json({ message: 'Recipe unliked successfully', likes_count: count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

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