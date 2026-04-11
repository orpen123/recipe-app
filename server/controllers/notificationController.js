const db = require('../config/db');

const notificationController = {
  
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.userId;

      const [notifications] = await db.query(
        `SELECT n.*,
          u.username as related_username,
          r.title as related_recipe_title
         FROM notifications n
         LEFT JOIN users u ON n.type = 'follow' AND n.related_id = u.id
         LEFT JOIN recipes r ON n.type IN ('like', 'comment', 'new_recipe') AND n.related_id = r.id
         WHERE n.user_id = ? 
         ORDER BY n.created_at DESC`,
        [userId]
      );

      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.userId;

      await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
        [userId]
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = notificationController;
