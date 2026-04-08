const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const commentController = require('../controllers/commentController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// GET /api/recipes — Get all recipes (public)
router.get('/', optionalAuth, recipeController.getAllRecipes);

// GET /api/recipes/saved — Get saved recipes for logged-in user
// ⚠️ Must be BEFORE /:id or Express will treat "saved" as an id param
router.get('/saved', authenticate, recipeController.getSavedRecipes);

// GET /api/recipes/:id — Get single recipe (optionalAuth so guests can view, logged-in users get isLiked/isSaved)
router.get('/:id', optionalAuth, recipeController.getRecipeById);

// Comments on a recipe
router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', authenticate, commentController.addComment);

// POST /api/recipes — Create recipe
router.post('/', authenticate, recipeController.createRecipe);

// PUT /api/recipes/:id — Update recipe (owner only)
router.put('/:id', authenticate, recipeController.updateRecipe);

// DELETE /api/recipes/:id — Delete recipe (owner only)
router.delete('/:id', authenticate, recipeController.deleteRecipe);

// Like / Unlike
router.post('/:id/like', authenticate, recipeController.likeRecipe);
router.delete('/:id/like', authenticate, recipeController.unlikeRecipe);

// Save / Unsave
router.post('/:id/save', authenticate, recipeController.saveRecipe);
router.delete('/:id/save', authenticate, recipeController.unsaveRecipe);

module.exports = router;