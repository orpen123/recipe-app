const pool = require('../config/db');

const getRecipeReviews = async (req, res) => {
  const { recipeId } = req.params;
  try {
    const [reviews] = await pool.query(
      `SELECT 
        r.id, r.rating, r.content, r.created_at, r.updated_at,
        u.id AS user_id, u.username, u.avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.recipe_id = ?
       ORDER BY r.created_at DESC`,
      [recipeId]
    );

    const [stats] = await pool.query(
      `SELECT 
        ROUND(AVG(rating), 1) AS avg_rating,
        COUNT(*) AS total_reviews
       FROM reviews WHERE recipe_id = ?`,
      [recipeId]
    );

    res.json({ ...stats[0], reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserReview = async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.userId;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM reviews WHERE user_id = ? AND recipe_id = ?`,
      [userId, recipeId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createOrUpdateReview = async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.userId;
  const { rating, content } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    
    const [recipe] = await pool.query(
      `SELECT user_id FROM recipes WHERE id = ?`, [recipeId]
    );
    if (!recipe[0]) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe[0].user_id === userId) {
      return res.status(403).json({ error: 'You cannot review your own recipe' });
    }

    await pool.query(
      `INSERT INTO reviews (user_id, recipe_id, rating, content)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), content = VALUES(content)`,
      [userId, recipeId, rating, content || null]
    );

    const [updated] = await pool.query(
      `SELECT r.*, u.username, u.avatar 
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.user_id = ? AND r.recipe_id = ?`,
      [userId, recipeId]
    );

    res.status(200).json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteReview = async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.userId;
  try {
    const [result] = await pool.query(
      `DELETE FROM reviews WHERE user_id = ? AND recipe_id = ?`,
      [userId, recipeId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRecipeReviews, createOrUpdateReview, deleteReview, getUserReview };