const db = require('../config/db');

const commentController = {
  
  getComments: async (req, res) => {
    try {
      const { idAndSlug } = req.params;
      const id = idAndSlug?.split('-')[0];

      const [comments] = await db.query(`
        SELECT c.*, u.username, u.avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.recipe_id = ?
        ORDER BY c.created_at DESC
      `, [id]);

      res.json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  addComment: async (req, res) => {
    try {
      const { idAndSlug } = req.params;
      const id = idAndSlug?.split('-')[0];
      const { content } = req.body;
      const userId = req.user.userId;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const [result] = await db.query(
        'INSERT INTO comments (user_id, recipe_id, content) VALUES (?, ?, ?)',
        [userId, id, content]
      );

      const [rows] = await db.query(
        `SELECT c.*, u.username, u.avatar
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const [comments] = await db.query(
        'SELECT * FROM comments WHERE id = ?',
        [id]
      );

      if (comments.length === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comments[0].user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }

      await db.query('DELETE FROM comments WHERE id = ?', [id]);

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = commentController;