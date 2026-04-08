const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipe_app',
});

// A collection of great food images from Unsplash depicting various textures (soups, breads, stews, meats, desserts)
const foodImages = [
  'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1576086202456-ccdb6e81dbd9?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1484723091791-0fee59ca0b09?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&q=80&w=1000'
];

const usernames = [
  'Chef_Tarik', 'Amina_Cuisine', 'Karim_Bites', 'Fatima_Zahra', 'Youssef_M', 
  'Laila_Kitchen', 'Hassan_Cooks', 'Salma_Spices', 'Omar_Chef', 'Nadia_Delights',
  'Rachid_Foodie', 'Khadija_Bakes', 'Mehdi_Atlas', 'Hind_Tastes', 'Jamal_Sidi',
  'Samira_Sweets', 'Ilias_Marrakech', 'Sanae_Fez', 'Ayoub_Casa', 'Zineb_Tangier'
];

const recipesList = [
  { title: 'Chicken Tagine with Olives & Lemons', cat: 'Main Course', desc: 'Slow-cooked chicken with preserved lemons and green olives. A true Moroccan classic!', pt: 20, ct: 60, ing: ['1 Whole Chicken', '2 Preserved Lemons', '1 cup Olives', 'Saffron'] },
  { title: 'Seven-Vegetable Royal Couscous', cat: 'Main Course', desc: 'Fluffy semolina grains steamed over aromatics, topped with beef and tender root vegetables.', pt: 45, ct: 120, ing: ['Couscous', 'Beef', 'Carrots', 'Turnips', 'Pumpkin', 'Zucchini'] },
  { title: 'Harira Ramadan Soup', cat: 'Soup', desc: 'Hearty tomato, lentil, and chickpea soup typically used to break the fast during Ramadan.', pt: 20, ct: 45, ing: ['Lentils', 'Chickpeas', 'Tomatoes', 'Coriander', 'Celery'] },
  { title: 'Maghrebi Mint Tea (Atay)', cat: 'Drink', desc: 'Green tea steeped with large bunches of fresh mint and sugar. Poured from high up to create foam.', pt: 5, ct: 10, ing: ['Gunpowder Green Tea', 'Fresh Mint', 'Sugar', 'Boiling Water'] },
  { title: 'Chicken Pastilla (Bstilla)', cat: 'Main Course', desc: 'A remarkable sweet and savory pie. Thin warqa pastry enclosing spiced chicken and crushed almonds.', pt: 60, ct: 45, ing: ['Warqa Pastry', 'Chicken', 'Almonds', 'Cinnamon', 'Eggs'] },
  { title: 'Seafood Pastilla', cat: 'Main Course', desc: 'A savory version of the classic pie, filled with shrimp, calamari, fish, and vermicelli noodles.', pt: 50, ct: 45, ing: ['Shrimp', 'White Fish', 'Vermicelli', 'Harissa', 'Warqa'] },
  { title: 'Rfissa', cat: 'Main Course', desc: 'An incredibly comforting dish of shredded msemen (pancakes) topped with a rich chicken and lentil stew containing fenugreek.', pt: 40, ct: 90, ing: ['Msemen', 'Chicken', 'Lentils', 'Fenugreek (Helba)', 'Ras el Hanout'] },
  { title: 'Tanjia Marrakchia', cat: 'Main Course', desc: 'A Marrakech specialty! Beef or lamb slow-cooked in a clay urn in the ashes of a hammam over 8 hours.', pt: 15, ct: 480, ing: ['Beef shank', 'Garlic', 'Cumin', 'Saffron', 'Preserved Lemon'] },
  { title: 'Zaalouk Eggplant Dip', cat: 'Appetizer', desc: 'A smoky, cooked salad/dip made with roasted eggplants, tomatoes, garlic, and rich olive oil.', pt: 15, ct: 30, ing: ['Eggplant', 'Tomatoes', 'Garlic', 'Olive Oil', 'Paprika'] },
  { title: 'Taktouka Tomato & Pepper Dip', cat: 'Appetizer', desc: 'Refreshing and zesty cooked salad combining roasted green peppers and pureed tomatoes.', pt: 15, ct: 20, ing: ['Bell Peppers', 'Tomatoes', 'Olive Oil', 'Garlic', 'Parsley'] },
  { title: 'Bissara Fava Bean Soup', cat: 'Soup', desc: 'A thick, creamy, and warm dried fava bean soup topped with a heavy drizzle of olive oil and cumin.', pt: 10, ct: 60, ing: ['Dried Fava Beans', 'Garlic', 'Olive Oil', 'Cumin', 'Water'] },
  { title: 'Kefta Mkaouara (Meatball Tagine)', cat: 'Main Course', desc: 'Spiced beef or lamb meatballs simmering in a rich tomato sauce with poached eggs on top.', pt: 20, ct: 40, ing: ['Ground Beef', 'Tomatoes', 'Eggs', 'Cumin', 'Parsley'] },
  { title: 'Msemen (Square Pancakes)', cat: 'Bread', desc: 'Layered, flaky, buttery flatbread folded into squares. Perfect when dipped in honey and butter.', pt: 30, ct: 20, ing: ['Flour', 'Semolina', 'Butter', 'Oil', 'Salt'] },
  { title: 'Baghrir (Thousand Hole Crepes)', cat: 'Bread', desc: 'Spongy semolina crepes cooked only on one side until hundreds of tiny holes appear on the surface.', pt: 15, ct: 30, ing: ['Semolina', 'Flour', 'Yeast', 'Baking Powder', 'Water'] },
  { title: 'Chebakia Honey Cookies', cat: 'Dessert', desc: 'Intricately folded sesame dough, deep fried, and immediately soaked in hot honey and orange blossom water.', pt: 60, ct: 45, ing: ['Flour', 'Sesame Seeds', 'Honey', 'Orange Blossom Water', 'Anise'] },
  { title: 'Sfenj (Moroccan Donuts)', cat: 'Dessert', desc: 'Chewy, airy, and deeply unpretentious rings of dough, fried until crispy and dipped in sugar.', pt: 20, ct: 15, ing: ['Flour', 'Yeast', 'Water', 'Salt', 'Sugar'] },
  { title: 'Fekkas (Moroccan Biscotti)', cat: 'Dessert', desc: 'Twice-baked hard cookies packed with almonds, raisins, and sesame seeds. Perfect for tea dipping.', pt: 20, ct: 60, ing: ['Flour', 'Almonds', 'Raisins', 'Eggs', 'Sugar'] },
  { title: 'Makrout Date Cookies', cat: 'Dessert', desc: 'Semolina dough encasing a rich, spiced date paste filling, fried and soaked in honey.', pt: 40, ct: 30, ing: ['Semolina', 'Date Paste', 'Honey', 'Cinnamon'] },
  { title: 'Almond Briouats', cat: 'Dessert', desc: 'Crispy, bite-sized triangular pastries filled with sweet almond paste and dripping with honey.', pt: 30, ct: 20, ing: ['Almonds', 'Sugar', 'Warqa', 'Honey', 'Butter'] },
  { title: 'Harcha Semolina Bread', cat: 'Bread', desc: 'A rich, crumbly pan-fried bread made primarily from semolina and butter. Usually eaten for breakfast.', pt: 10, ct: 15, ing: ['Semolina', 'Butter', 'Milk', 'Sugar', 'Baking Powder'] },
];

async function runSeed() {
  console.log('🧹 Formatting database completely...');
  
  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['messages', 'notifications', 'comments', 'saved_recipes', 'likes', 'ingredients', 'recipes', 'users'];
    for (const d of tables) await pool.query('TRUNCATE TABLE ' + d);
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('👨‍🍳 Creating 20 Authentic Users...');
    const passwordHash = await bcrypt.hash('maghrib123', 10);
    const userIds = [];
    
    for (let u of usernames) {
      const email = u.toLowerCase() + '@morocco.com';
      const [res] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [u, email, passwordHash]);
      userIds.push(res.insertId);
    }

    console.log('🥘 Cooking up 20 Traditional Moroccan Recipes & Ingredients...');
    const recipeIds = [];
    let idx = 0;
    
    for (let r of recipesList) {
      const authorId = userIds[Math.floor(Math.random() * userIds.length)];
      const img = foodImages[idx % foodImages.length];
      
      const [rec] = await pool.query(
        'INSERT INTO recipes (user_id, title, description, category, prep_time, cook_time, servings, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [authorId, r.title, r.desc, r.cat, r.pt, r.ct, Math.floor(Math.random() * 6) + 2, img]
      );
      const rId = rec.insertId;
      recipeIds.push(rId);

      // Add corresponding ingredients
      for (let ing of r.ing) {
        await pool.query('INSERT INTO ingredients (recipe_id, name, quantity) VALUES (?, ?, ?)', [rId, ing, 'To taste']);
      }
      idx++;
    }

    console.log('💬 Simulating social interactions (Hundreds of likes, saves, and comments!)...');
    
    const commentTexts = [
      'This looks absolutely amazing! Tbarkallah.',
      'So delicious, I am making this tonight!',
      'Can I substitute the oil with butter?',
      'Bsha wraha! Gorgeous plate.',
      'My grandmother used to make it exactly like this.',
      'Wow! The presentation is superb 👌',
      'I tried it yesterday, my family loved it.',
      'Chokran for sharing this secret recipe!'
    ];

    // Give each recipe random likes, saves, comments
    for (let rId of recipeIds) {
      // 5-15 likes per recipe
      let numLikes = Math.floor(Math.random() * 11) + 5;
      let likedBy = [...userIds].sort(() => 0.5 - Math.random()).slice(0, numLikes);
      for (let uId of likedBy) {
        await pool.query('INSERT IGNORE INTO likes (user_id, recipe_id) VALUES (?, ?)', [uId, rId]);
      }

      // 2-8 saves per recipe
      let numSaves = Math.floor(Math.random() * 7) + 2;
      let savedBy = [...userIds].sort(() => 0.5 - Math.random()).slice(0, numSaves);
      for (let uId of savedBy) {
        await pool.query('INSERT IGNORE INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)', [uId, rId]);
      }

      // 1-5 comments per recipe
      let numComments = Math.floor(Math.random() * 5) + 1;
      let commentedBy = [...userIds].sort(() => 0.5 - Math.random()).slice(0, numComments);
      for (let uId of commentedBy) {
        let txt = commentTexts[Math.floor(Math.random() * commentTexts.length)];
        await pool.query('INSERT INTO comments (user_id, recipe_id, content) VALUES (?, ?, ?)', [uId, rId, txt]);
      }
    }

    console.log('✅ MASSIVE DATABASE GENERATION COMPLETE. Enoy the Moroccan feast!');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    pool.end();
  }
}

runSeed();
