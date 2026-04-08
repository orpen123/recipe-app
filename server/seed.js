const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_password || '',
  database: process.env.DB_NAME || 'recipe_app',
});

async function runSeed() {
  console.log('🧹 Sweeping old data...');
  
  try {
    // Disable foreign key checks temporarily to clear data
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE messages');
    await pool.query('TRUNCATE TABLE notifications');
    await pool.query('TRUNCATE TABLE comments');
    await pool.query('TRUNCATE TABLE saved_recipes');
    await pool.query('TRUNCATE TABLE likes');
    await pool.query('TRUNCATE TABLE ingredients');
    await pool.query('TRUNCATE TABLE recipes');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🌱 Planting Moroccan Recipes...');
    const passwordHash = await bcrypt.hash('maghrib123', 10);
    
    // Create Users
    const [user1] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      ['Chef_Tarik', 'tarik@morocco.com', passwordHash]
    );
    const tarikId = user1.insertId;

    const [user2] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      ['Amina_Cuisine', 'amina@marrakech.com', passwordHash]
    );
    const aminaId = user2.insertId;

    // Create Moroccan Recipes
    const recipes = [
      {
        user_id: tarikId,
        title: 'Authentic Chicken Tagine with Preserved Lemons',
        description: 'A classic Moroccan dish slow-cooked in a traditional clay tagine. The beautiful harmony of salty preserved lemons, briny green olives, and tender chicken makes this a staple for any family gathering.',
        category: 'Main Course',
        prep_time: 20,
        cook_time: 60,
        servings: 4,
        image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=2000'
      },
      {
        user_id: aminaId,
        title: 'Seven-Vegetable Royal Couscous',
        description: 'Served traditionally every Friday in Morocco. This magnificent platter acts as a bed of fluffy, steamed semolina granules topped with aromatic broth, tender slow-cooked beef, and exactly seven different slow-cooked root vegetables.',
        category: 'Dinner',
        prep_time: 45,
        cook_time: 120,
        servings: 8,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=2000'
      },
      {
        user_id: aminaId,
        title: 'Harira Ramadan Soup',
        description: 'The national soup of Morocco! A rich, thick, and incredibly fragrant tomato-based soup packed with lentils, chickpeas, fresh celery, and a squeeze of fresh lemon. It is the ultimate comfort food.',
        category: 'Soup',
        prep_time: 20,
        cook_time: 45,
        servings: 6,
        image: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?auto=format&fit=crop&q=80&w=2000'
      },
      {
        user_id: tarikId,
        title: 'Maghrebi Mint Tea (Atay)',
        description: 'More than just a drink, passing the teapot high above the glass is an art form. Made generously with gunpowder green tea, huge handfuls of fresh spearmint, and sugar.',
        category: 'Drink',
        prep_time: 5,
        cook_time: 10,
        servings: 4,
        image: 'https://images.unsplash.com/photo-1576086202456-ccdb6e81dbd9?auto=format&fit=crop&q=80&w=2000'
      }
    ];

    let rIds = [];
    for (const r of recipes) {
      const [res] = await pool.query(
        'INSERT INTO recipes (user_id, title, description, category, prep_time, cook_time, servings, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [r.user_id, r.title, r.description, r.category, r.prep_time, r.cook_time, r.servings, r.image]
      );
      rIds.push(res.insertId);
    }

    // Ingredients for Tagine
    await pool.query('INSERT INTO ingredients (recipe_id, name, quantity) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)', [
      rIds[0], 'Whole Chicken (cut)', '1.5 kg',
      rIds[0], 'Preserved Lemons', '2 whole',
      rIds[0], 'Green Olives', '1 cup',
      rIds[0], 'Saffron Threads', '1 pinch'
    ]);

    // Ingredients for Couscous
    await pool.query('INSERT INTO ingredients (recipe_id, name, quantity) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)', [
      rIds[1], 'Semolina Couscous', '1 kg',
      rIds[1], 'Carrots', '4 large',
      rIds[1], 'Turnips', '3 medium',
      rIds[1], 'Pumpkin', '500g'
    ]);

    // Ingredients for Harira
    await pool.query('INSERT INTO ingredients (recipe_id, name, quantity) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)', [
      rIds[2], 'Lentils', '1 cup',
      rIds[2], 'Crushed Tomatoes', '3 cups',
      rIds[2], 'Fresh Coriander', '1 bunch'
    ]);

    // Ingredients for Atay
    await pool.query('INSERT INTO ingredients (recipe_id, name, quantity) VALUES (?, ?, ?), (?, ?, ?)', [
      rIds[3], 'Fresh Mint', '1 large bouquet',
      rIds[3], 'Gunpowder Green Tea', '2 tbsp'
    ]);

    // Add some social engagement to make the site look alive!
    await pool.query('INSERT INTO likes (user_id, recipe_id) VALUES (?, ?), (?, ?)', [aminaId, rIds[0], tarikId, rIds[1]]);
    await pool.query('INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)', [tarikId, rIds[2]]);
    await pool.query('INSERT INTO comments (user_id, recipe_id, content) VALUES (?, ?, ?)', [aminaId, rIds[0], 'Tarik, this Tagine looks incredible! Making it today.']);
    
    console.log('✅ Moroccan seeding complete! Everything is fresh.');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    pool.end();
  }
}

runSeed();
