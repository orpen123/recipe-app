const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All message routes require authentication
router.use(authenticate);

// GET /api/messages/conversations - Get all conversations
router.get('/conversations', messageController.getConversations);

// GET /api/messages/:userId - Get messages with a user
router.get('/:userId', messageController.getMessagesWithUser);

// POST /api/messages/:userId - Send a message
router.post('/:userId', messageController.sendMessage);

module.exports = router;