const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/:id', optionalAuth, userController.getUserProfile);

router.put('/:id', authenticate, userController.updateProfile);

router.post('/:id/follow', authenticate, userController.followUser);

router.delete('/:id/follow', authenticate, userController.unfollowUser);

router.delete('/followers/:followerId', authenticate, userController.removeFollower);

router.get('/:id/followers', userController.getFollowers);

router.get('/:id/following', userController.getFollowing);

router.get('/:id/liked', optionalAuth, userController.getLikedRecipes);

module.exports = router;