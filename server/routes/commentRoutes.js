const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');


// DELETE /api/comments/:id - Delete a comment (requires authentication)
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;