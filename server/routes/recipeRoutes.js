

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const commentController = require('../controllers/commentController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, recipeController.getAllRecipes);

router.get('/saved', authenticate, recipeController.getSavedRecipes);

router.get('/:idAndSlug', optionalAuth, recipeController.getRecipeById);

router.get('/:idAndSlug/comments', commentController.getComments);
router.post('/:idAndSlug/comments', authenticate, commentController.addComment);

router.post('/', authenticate, recipeController.createRecipe);

router.put('/:id', authenticate, recipeController.updateRecipe);
router.delete('/:id', authenticate, recipeController.deleteRecipe);

router.get('/:id/likes', recipeController.getRecipeLikes);
router.post('/:id/like', authenticate, recipeController.likeRecipe);
router.delete('/:id/like', authenticate, recipeController.unlikeRecipe);

router.post('/:id/save', authenticate, recipeController.saveRecipe);
router.delete('/:id/save', authenticate, recipeController.unsaveRecipe);

module.exports = router;