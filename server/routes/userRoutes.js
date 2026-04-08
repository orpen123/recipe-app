const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// GET /api/users/:id - Get user profile
router.get('/:id', userController.getUserProfile);

// PUT /api/users/:id - Update profile (own only, requires authentication)
router.put('/:id', authenticate, userController.updateProfile);

// POST /api/users/:id/follow - Follow a user (requires authentication)
router.post('/:id/follow', authenticate, userController.followUser);

// DELETE /api/users/:id/follow - Unfollow a user (requires authentication)
router.delete('/:id/follow', authenticate, userController.unfollowUser);

// GET /api/users/:id/followers - Get followers list
router.get('/:id/followers', userController.getFollowers);

// GET /api/users/:id/following - Get following list
router.get('/:id/following', userController.getFollowing);

module.exports = router;