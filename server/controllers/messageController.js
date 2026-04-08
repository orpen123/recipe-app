const db = require('../config/db');

const messageController = {
  // GET /api/messages/conversations
  getConversations: async (req, res) => {
    try {
      const userId = req.user.userId;

      const [conversations] = await db.query(`
        SELECT DISTINCT
          CASE 
            WHEN m.sender_id = ? THEN m.receiver_id
            ELSE m.sender_id
          END as user_id,
          u.username,
          u.avatar,
          (SELECT content FROM messages 
           WHERE (sender_id = ? AND receiver_id = user_id) 
              OR (sender_id = user_id AND receiver_id = ?)
           ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages 
           WHERE (sender_id = ? AND receiver_id = user_id) 
              OR (sender_id = user_id AND receiver_id = ?)
           ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM messages m
        JOIN users u ON u.id = CASE 
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY last_message_time DESC
      `, [userId, userId, userId, userId, userId, userId, userId, userId]);

      res.json(conversations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/messages/:userId
  getMessagesWithUser: async (req, res) => {
    try {
      const { userId: otherUserId } = req.params;
      const userId = req.user.userId;

      const [messages] = await db.query(`
        SELECT m.*, 
          sender.username as sender_username,
          sender.avatar as sender_avatar
        FROM messages m
        JOIN users sender ON m.sender_id = sender.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?)
           OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
      `, [userId, otherUserId, otherUserId, userId]);

      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/messages/:userId
  sendMessage: async (req, res) => {
    try {
      const { userId: receiverId } = req.params;
      const senderId = req.user.userId;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      // Can't message yourself
      if (parseInt(receiverId) === senderId) {
        return res.status(400).json({ error: 'Cannot send message to yourself' });
      }

      const [result] = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [senderId, receiverId, content]
      );

      const [senderInfo] = await db.query('SELECT username, avatar FROM users WHERE id = ?', [senderId]);

      // Create notification
      await db.query(
        'INSERT INTO notifications (user_id, type, related_id, message) VALUES (?, ?, ?, ?)',
        [receiverId, 'message', senderId, `New message from ${senderInfo[0].username}`]
      ).catch(e => console.error('Failed to insert notification', e));

      res.status(201).json({
        id: result.insertId,
        sender_id: senderId,
        receiver_id: parseInt(receiverId),
        content,
        created_at: new Date().toISOString(),
        sender_username: senderInfo[0].username,
        sender_avatar: senderInfo[0].avatar
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = messageController;