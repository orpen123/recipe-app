const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/conversations', messageController.getConversations);

router.get('/:userId', messageController.getMessagesWithUser);

router.post('/:userId', messageController.sendMessage);

router.delete('/conversations/:userId', messageController.deleteConversation);

module.exports = router;