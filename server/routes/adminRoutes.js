const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.use(authenticate);
router.use(adminAuth);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/recipes', adminController.getAllRecipes);
router.delete('/recipes/:id', adminController.deleteRecipe);

module.exports = router;
