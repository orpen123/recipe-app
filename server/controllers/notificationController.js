const db = require('../config/db');

const notificationController = {
  // GET /api/notifications
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.userId;

      const [notifications] = await db.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // PUT /api/notifications/:id/read
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

  // PUT /api/notifications/read-all
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
