const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');const {
  getRecipeReviews,
  createOrUpdateReview,
  deleteReview,
  getUserReview,
} = require('../controllers/reviewController');

router.get('/:recipeId/reviews', getRecipeReviews);
router.get('/:recipeId/reviews/me', authenticate, getUserReview);
router.post('/:recipeId/reviews', authenticate, createOrUpdateReview);
router.delete('/:recipeId/reviews', authenticate, deleteReview);

module.exports = router;