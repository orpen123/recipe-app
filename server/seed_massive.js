const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipe_app',
  ssl: {
    rejectUnauthorized: false
  }
});

const usernames = [
  'Chef_Tarik', 'Amina_Cuisine', 'Karim_Bites', 'Fatima_Zahra', 'Youssef_M',
  'Laila_Kitchen', 'Hassan_Cooks', 'Salma_Spices', 'Omar_Chef', 'Nadia_Delights',
  'Rachid_Foodie', 'Khadija_Bakes', 'Mehdi_Atlas', 'Hind_Tastes', 'Jamal_Sidi',
  'Samira_Sweets', 'Ilias_Marrakech', 'Sanae_Fez', 'Ayoub_Casa', 'Zineb_Tangier'
];

const recipesList = [
  {
    title: 'Chicken Tagine with Olives & Lemons',
    cat: 'Main Course',
    desc: 'A soul-warming Moroccan classic that fills the kitchen with the scent of saffron and spice. Start by marinating the chicken pieces in a blend of cumin, ginger, turmeric, and saffron for at least an hour. In a heavy tagine or Dutch oven, sauté sliced onions and garlic in olive oil until soft and golden. Add the marinated chicken and brown it on all sides to seal in the juices. Pour in a splash of water or chicken broth, then nestle in the preserved lemon quarters and green olives around the chicken. Cover tightly and let everything slow-cook on low heat for about an hour, allowing the flavors to meld beautifully. Serve directly from the tagine with crusty bread to soak up every last drop of the silky, citrusy sauce.',
    pt: 20, ct: 60,
    ing: ['1 Whole Chicken', '2 Preserved Lemons', '1 cup Olives', 'Saffron'],
    image: 'https://static01.nyt.com/images/2017/04/27/dining/27COOKING-CHICKENTAGINE1/27COOKING-CHICKENTAGINE1-threeByTwoMediumAt2X-v2.jpg?quality=75&auto=webp'
  },
  {
    title: 'Seven-Vegetable Royal Couscous',
    cat: 'Main Course',
    desc: 'The crown jewel of Moroccan cooking, traditionally prepared for Friday family gatherings. Begin by seasoning beef chunks with ras el hanout, salt, and pepper, then brown them in a large pot with onions and olive oil. Layer in the heartier vegetables first — carrots, turnips, and pumpkin — along with a handful of chickpeas and a generous pinch of saffron. Meanwhile, steam the couscous in a couscoussier, fluffing it with butter between each steam cycle until every grain is perfectly light and separate. As the stew simmers and the broth deepens in flavor, add the quicker-cooking vegetables like zucchini and cabbage. To serve, mound the couscous into a large communal dish, arrange the vegetables on top in a colorful dome, and ladle the rich, fragrant broth over everything.',
    pt: 45, ct: 120,
    ing: ['Couscous', 'Beef', 'Carrots', 'Turnips', 'Pumpkin', 'Zucchini'],
    image: 'https://static01.nyt.com/images/2011/10/10/health/Well_veggie_vegetable/Well_veggie_vegetable-jumbo-v3.jpg?quality=75&auto=webp'
  },
  {
    title: 'Harira Ramadan Soup',
    cat: 'Soup',
    desc: 'The iconic soup of Ramadan, served at sundown to break the fast with warmth and nourishment. Begin by sautéing diced onion, celery, and a handful of fresh coriander and parsley in a large pot with butter and oil. Add lamb or beef pieces and stir until browned. Pour in crushed tomatoes, soaked lentils, and chickpeas, then season generously with ginger, turmeric, cinnamon, and black pepper. Add water and let the soup simmer on medium heat for 30 minutes. In a small bowl, whisk together flour and water to make a smooth thickener called tadouira, then slowly stir it into the bubbling soup to give it its signature silky body. Finish with a squeeze of fresh lemon juice and a shower of chopped herbs. Serve piping hot alongside dates and chebakia cookies.',
    pt: 20, ct: 45,
    ing: ['Lentils', 'Chickpeas', 'Tomatoes', 'Coriander', 'Celery'],
    image: 'https://tasteofmaroc.com/wp-content/uploads/2017/05/harira-2-moroccan-soup-picturepartners-bigstock.jpg.webp'
  },
  {
    title: 'Maghrebi Mint Tea (Atay)',
    cat: 'Drink',
    desc: 'Moroccan mint tea is not just a drink — it is a ritual of hospitality. Start by rinsing a small teapot with a tiny amount of boiling water to warm it, then discard. Add a heaped teaspoon of gunpowder green tea and pour in a small amount of boiling water, swirl, and pour it away — this is the washing step that removes bitterness. Now add a full pot of boiling water and let the tea steep for 2 minutes. Pack in a generous handful of fresh spearmint leaves and add sugar to taste — traditionally quite sweet. Pour a glass, then pour it back into the pot to mix everything. Repeat this two or three times to develop the flavor and create the famous frothy foam. Finally, pour the tea into small glasses from a great height to aerate it and produce a beautiful froth on top. Serve immediately.',
    pt: 5, ct: 10,
    ing: ['Gunpowder Green Tea', 'Fresh Mint', 'Sugar', 'Boiling Water'],
    image: 'https://hijrahtomorocco.com/wp-content/uploads/2025/02/moroccan-mint-tea-atay.jpg'
  },
  {
    title: 'Chicken Pastilla (Bstilla)',
    cat: 'Main Course',
    desc: 'A legendary Moroccan pie that masterfully balances sweet and savory in every single bite. Start by slow-cooking chicken with onions, saffron, ginger, cinnamon, and fresh herbs until the meat is fall-off-the-bone tender. Shred the chicken and set aside. In the same pot, scramble eggs into the reduced cooking juices to create a soft, custardy layer. Toast almonds and blitz them with sugar and cinnamon into a coarse crumble. Now assemble: butter a round baking dish and layer sheets of thin warqa pastry, overlapping and overhanging the edges. Add the egg mixture, then the shredded chicken, then the almond crumble. Fold the pastry over the top, add more buttered layers, and tuck everything in neatly. Bake at 180°C until deeply golden and crispy. Dust lavishly with powdered sugar and cinnamon for the iconic finish.',
    pt: 60, ct: 45,
    ing: ['Warqa Pastry', 'Chicken', 'Almonds', 'Cinnamon', 'Eggs'],
    image: 'https://static01.nyt.com/images/2024/10/18/multimedia/NB-Chicken-Pastillarex-plfc/NB-Chicken-Pastillarex-plfc-threeByTwoMediumAt2X.jpg?quality=75&auto=webp'
  },
  {
    title: 'Seafood Pastilla',
    cat: 'Main Course',
    desc: 'A stunning savory pie from the coastal cities of Morocco, bursting with the flavors of the Atlantic. Sauté a mix of shrimp, squid rings, and flaked white fish with garlic, harissa, cumin, and a squeeze of lemon until just cooked through. Cook thin vermicelli noodles separately and toss them with the seafood filling along with fresh herbs. Prepare your baking dish by layering generously buttered sheets of warqa pastry, letting them hang over the edges. Spoon in the seafood and noodle filling, spreading it evenly. Fold the overhanging pastry back over, add a few more buttered sheets on top, and brush everything with egg wash. Bake at 190°C for 25 to 30 minutes until the pastry is shatteringly crisp and a deep golden brown. Serve immediately, cut into wedges, with lemon on the side.',
    pt: 50, ct: 45,
    ing: ['Shrimp', 'White Fish', 'Vermicelli', 'Harissa', 'Warqa'],
    image: 'https://tasteofmaroc.com/wp-content/uploads/2018/08/seafood-bastilla-bigstock-picturepartners.jpg.webp'
  },
  {
    title: 'Rfissa',
    cat: 'Main Course',
    desc: 'A deeply comforting postpartum dish traditionally made for new mothers, now beloved by all. Begin by slow-cooking a whole chicken with onions, lentils, fenugreek seeds, and a rich mixture of spices including ras el hanout, ginger, and turmeric. Let the stew simmer for a full hour until the lentils are creamy and the broth is thick and deeply perfumed. While the stew cooks, prepare msemen flatbreads and let them cool before tearing them into rough pieces by hand. To serve, spread the torn msemen pieces across the bottom of a large communal platter. Ladle the hot, steaming chicken and lentil stew generously over the top, making sure to soak every piece of bread with the fragrant broth. Place the whole chicken pieces on top and serve family-style.',
    pt: 40, ct: 90,
    ing: ['Msemen', 'Chicken', 'Lentils', 'Fenugreek (Helba)', 'Ras el Hanout'],
    image: 'https://tasteofmaroc.com/wp-content/uploads/2017/11/rfissa-2b-1080x716.jpg.webp'
  },
  {
    title: 'Tanjia Marrakchia',
    cat: 'Main Course',
    desc: 'The ultimate bachelor dish of Marrakech, traditionally cooked by men in the communal oven of a hammam. Pack chunks of beef shank or lamb into a narrow clay urn called a tanjia. Add a whole head of garlic, a generous pinch of saffron, preserved lemon, smen (fermented butter), cumin, and a drizzle of olive oil. Seal the top tightly with parchment paper and tie it shut with string. The tanjia is then taken to the local hammam and buried in the hot ashes of the furnace, where it slow-cooks for 6 to 8 hours completely unattended. The result is meat so impossibly tender it dissolves at the touch of a fork, infused with deep, earthy, complex flavors. At home, you can replicate this in a low oven at 150°C for 4 to 5 hours. Serve directly from the urn with warm khobz bread.',
    pt: 15, ct: 480,
    ing: ['Beef shank', 'Garlic', 'Cumin', 'Saffron', 'Preserved Lemon'],
    image: 'https://www.thespruceeats.com/thmb/Hl0gAPBGkeYvz4NeQ_C-XVo7lGI=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/lamb-tajine-56297955-5876612e5f9b584db37bb97b.jpg'
  },
  {
    title: 'Zaalouk Eggplant Dip',
    cat: 'Appetizer',
    desc: 'A smoky, velvety cooked salad that is one of the most beloved starters in Moroccan cuisine. Begin by roasting whole eggplants directly over a gas flame or under a hot grill, turning occasionally, until the skin is completely charred and the inside is completely soft. Let them cool, then peel away the burnt skin and roughly chop the flesh. In a wide pan, cook crushed tomatoes with garlic, olive oil, paprika, cumin, and a touch of harissa until thick and jammy. Add the chopped eggplant and mash everything together with a fork, keeping some texture. Continue cooking on low heat, stirring often, until the mixture thickens and the oil begins to separate. Finish with fresh lemon juice, a handful of chopped cilantro, and a generous pour of your best olive oil. Serve at room temperature with warm Moroccan bread.',
    pt: 15, ct: 30,
    ing: ['Eggplant', 'Tomatoes', 'Garlic', 'Olive Oil', 'Paprika'],
    image: 'https://tasteofmaroc.com/wp-content/uploads/2021/02/zaalouk-on-plate-2-1200w-opt.jpg.webp'
  },
  {
    title: 'Taktouka Tomato & Pepper Dip',
    cat: 'Appetizer',
    desc: 'A bright, fresh, and lightly spiced cooked salad that showcases the simple beauty of Moroccan cooking. Start by roasting green bell peppers directly over a flame or in the oven until blistered and soft all over. Place them in a covered bowl to steam for 10 minutes, then peel, seed, and slice them into strips. In a pan, gently cook diced fresh tomatoes with garlic and olive oil until they completely break down into a thick sauce. Add the roasted pepper strips, season with cumin, paprika, salt, and a pinch of cayenne for gentle heat. Stir everything together and let it cook on low for another 10 minutes until the flavors marry and the mixture is jammy and thick. Drizzle with olive oil and scatter with fresh flat-leaf parsley before serving. Best enjoyed at room temperature alongside other Moroccan salads and fresh bread.',
    pt: 15, ct: 20,
    ing: ['Bell Peppers', 'Tomatoes', 'Olive Oil', 'Garlic', 'Parsley'],
    image: 'https://www.themediterraneandish.com/wp-content/uploads/2023/10/taktouka-recipe-2.jpg'
  },
  {
    title: 'Bissara Fava Bean Soup',
    cat: 'Soup',
    desc: 'A humble, hearty, and incredibly nourishing street food soup that has warmed Moroccans for centuries. The night before, soak dried peeled fava beans in plenty of cold water. The next day, drain and place them in a large pot with water, a whole head of garlic, and a drizzle of olive oil. Bring to a boil and then reduce to a steady simmer for about an hour until the beans are completely soft and beginning to fall apart. Use an immersion blender to purée the soup into a smooth, thick, creamy consistency. Adjust with hot water and season generously with salt. Ladle into bowls and finish each one with a heavy drizzle of extra-virgin olive oil, a good dusting of ground cumin, and a sprinkle of paprika. Serve alongside warm bread — this is a breakfast or lunch dish best enjoyed on a cold winter morning.',
    pt: 10, ct: 60,
    ing: ['Dried Fava Beans', 'Garlic', 'Olive Oil', 'Cumin', 'Water'],
    image: 'https://tasteofmaroc.com/wp-content/uploads/2020/10/bessara-soup-picturepartners-bigstock.jpg.webp'
  },
  {
    title: 'Kefta Mkaouara (Meatball Tagine)',
    cat: 'Main Course',
    desc: 'A rustic, deeply satisfying tagine of spiced meatballs bathed in a rich tomato sauce, crowned with runny eggs. Mix ground beef or lamb with finely grated onion, chopped parsley and cilantro, cumin, paprika, cinnamon, and salt until well combined. Roll the mixture into small, walnut-sized meatballs. In a wide tagine or skillet, cook diced tomatoes with garlic, olive oil, and the same warming spices until the sauce is thick and fragrant — about 15 minutes. Gently nestle the raw kefta meatballs into the bubbling sauce. Cover and cook on medium-low heat for 20 minutes, turning the meatballs once halfway through. Create small wells in the sauce between the meatballs and crack an egg into each one. Cover again and cook for just 3 to 4 more minutes until the egg whites are set but the yolks are still gloriously runny. Finish with fresh herbs and serve immediately with crusty bread.',
    pt: 20, ct: 40,
    ing: ['Ground Beef', 'Tomatoes', 'Eggs', 'Cumin', 'Parsley'],
    image: 'https://tasteofmaroc.com/wp-content/uploads/2018/02/kefta-tagine-oysy-bigstock-kofta-tajine-kefta-tagine-mo-65105917.jpg.webp'
  },
  {
    title: 'Msemen (Square Pancakes)',
    cat: 'Bread',
    desc: 'A flaky, buttery, layered Moroccan flatbread that is an essential part of any traditional breakfast spread. Combine flour, fine semolina, salt, sugar, yeast, and warm water and knead the dough for 10 minutes until very smooth and elastic. Divide into equal balls and let them rest under a cloth for 20 minutes. Working one at a time, flatten a dough ball on an oiled surface as thinly as possible. Brush generously with melted butter mixed with oil, then sprinkle with a pinch of fine semolina. Fold in the sides to form a rectangle, fold again into a square, then flatten slightly. Cook the msemen on a dry, lightly greased griddle over medium heat for about 4 minutes per side, pressing down gently, until golden brown with dark spots and crispy edges. Serve warm with butter, honey, or argan oil — best enjoyed fresh off the pan.',
    pt: 30, ct: 20,
    ing: ['Flour', 'Semolina', 'Butter', 'Oil', 'Salt'],
    image: 'https://tasteofmaroc.com/wp-content/uploads/2017/09/msemen-picturepartners-bigstock.jpg.webp'
  },
  {
    title: 'Baghrir (Thousand Hole Crepes)',
    cat: 'Bread',
    desc: 'Magical semolina crepes that seem to bloom with hundreds of tiny holes as they cook — a beloved Moroccan breakfast. Blend fine semolina, a small amount of flour, instant yeast, baking powder, a pinch of salt, and warm water in a blender until completely smooth. Let the batter rest for 20 to 30 minutes until it becomes slightly frothy and bubbles begin to form on the surface. Heat a non-stick pan over medium heat without greasing it. Pour a ladleful of batter into the center and let it spread naturally. Cook on one side only without ever flipping. Watch as hundreds of tiny holes bubble up and the surface goes from shiny and wet to matte and fully set — this takes about 2 to 3 minutes. Remove and stack on a plate. Serve warm, drizzled with melted butter and honey, alongside a pot of Moroccan mint tea.',
    pt: 15, ct: 30,
    ing: ['Semolina', 'Flour', 'Yeast', 'Baking Powder', 'Water'],
    image: 'https://silkroadrecipes.com/wp-content/uploads/2021/03/Baghrir-Moroccan-Pancakessquare.jpg'
  },
  {
    title: 'Chebakia Honey Cookies',
    cat: 'Dessert',
    desc: 'The most iconic Moroccan sweet, made in enormous quantities during Ramadan and lovingly shared with neighbors. Combine flour with toasted sesame seeds, anise, cinnamon, saffron, orange blossom water, vinegar, and enough oil to bring the dough together into a firm, workable consistency. Roll the dough thin and cut into rectangles, then make a series of slits and fold the dough through them to create the intricate flower shape. Deep-fry the chebakia in batches in hot oil until they are deeply golden and crispy all the way through. Immediately remove them and plunge them straight into a pot of hot, liquid honey infused with orange blossom water. Let them soak and absorb the honey for a full minute before removing and rolling in toasted sesame seeds. They keep for weeks in an airtight container and improve with time.',
    pt: 60, ct: 45,
    ing: ['Flour', 'Sesame Seeds', 'Honey', 'Orange Blossom Water', 'Anise'],
    image: 'https://tasteofmaroc.com/wp-content/uploads/2020/04/chebakia-picturepartners-bigstock-1536x990.jpg.webp'
  },
  {
    title: 'Sfenj (Moroccan Donuts)',
    cat: 'Dessert',
    desc: 'Airy, chewy, and utterly addictive fried dough rings that are a staple of Moroccan street food culture. Dissolve fresh or instant yeast in warm water with a pinch of sugar and let it activate and foam for 10 minutes. Combine flour and salt in a large bowl, then pour in the yeast mixture and enough warm water to create a very wet, sticky, and loose dough — nothing like a regular bread dough. Beat the dough vigorously with your hand for several minutes until it becomes smooth and elastic. Cover the bowl and leave it in a warm place to rise for 1 to 2 hours until puffed and full of bubbles. Heat a generous amount of oil in a deep pan. Wet your hands, take a handful of dough, poke a hole through it with your thumb, and slide it into the hot oil. Fry until golden on both sides, drain on paper towels, and roll in sugar. Best eaten immediately.',
    pt: 20, ct: 15,
    ing: ['Flour', 'Yeast', 'Water', 'Salt', 'Sugar'],
    image: 'https://i.pinimg.com/1200x/29/07/28/29072812a9b480916138bf8bf4dfe345.jpg'
  },
  {
    title: 'Fekkas (Moroccan Biscotti)',
    cat: 'Dessert',
    desc: 'Twice-baked Moroccan cookies that are crunchy, studded with almonds and raisins, and perfect for dunking in tea. Mix flour, sugar, baking powder, eggs, a splash of orange blossom water, and melted butter into a soft dough. Fold in whole blanched almonds, raisins, and sesame seeds until evenly distributed. Shape the dough into two or three long logs on a lined baking sheet. Bake at 175°C for about 20 to 25 minutes until the logs are firm and lightly golden. Remove from the oven and let them cool for 10 minutes. Using a serrated knife, slice the logs diagonally into 1cm-thick rounds. Lay the slices flat on the baking sheet and return to the oven for another 15 to 20 minutes, flipping once, until they are completely dry, hard, and golden throughout. Let them cool fully before storing — they will keep for a month in a tin.',
    pt: 20, ct: 60,
    ing: ['Flour', 'Almonds', 'Raisins', 'Eggs', 'Sugar'],
    image: 'https://i0.wp.com/petitapron.com/wp-content/uploads/2022/06/DSC_0007-scaled.jpg?resize=1365%2C2048&ssl=1'
  },
  {
    title: 'Makrout Date Cookies',
    cat: 'Dessert',
    desc: 'Golden semolina diamonds filled with spiced date paste and soaked in fragrant honey — a festive treat made for Eid and Ramadan. Begin the filling by blending soft Medjool dates with a little melted butter, cinnamon, and orange blossom water until you have a smooth, pliable paste. Roll it into long thin cylinders and set aside. For the dough, mix fine semolina with flour, baking powder, melted butter, a pinch of salt, and enough orange blossom water to bring it together into a firm dough. Roll the dough into a long rectangle, place the date cylinder along one edge, and roll the dough tightly around it. Seal the seam, then use a sharp knife to cut it into diamond shapes. Deep-fry the diamonds in hot oil until beautifully golden, then immediately transfer them into warm liquid honey to soak for a minute. Drain and serve.',
    pt: 40, ct: 30,
    ing: ['Semolina', 'Date Paste', 'Honey', 'Cinnamon'],
    image: 'https://sweetlycakes.com/wp-content/uploads/2021/05/makrout-16blog-1.jpg'
  },
  {
    title: 'Almond Briouats',
    cat: 'Dessert',
    desc: 'Delicate, crispy triangular pastries encasing a perfumed almond filling — a staple at Moroccan weddings and celebrations. Start by blanching almonds, then toasting them until golden. Pulse them in a food processor with powdered sugar, cinnamon, a spoon of butter, and enough orange blossom water to bind everything into a soft, fragrant paste. Roll the paste into small cylinders. Cut sheets of warqa or brick pastry into long strips and brush them lightly with melted butter. Place a cylinder of almond filling at one end of a strip, then fold repeatedly in a triangular motion, keeping the pastry taut with each fold, until you reach the end of the strip. Seal the final edge with a little egg white. Fry the briouats in batches in medium-hot oil until they are a rich, even golden color and shatteringly crisp. Immediately dip them in warm honey and sprinkle with toasted sesame seeds. Serve warm or at room temperature.',
    pt: 30, ct: 20,
    ing: ['Almonds', 'Sugar', 'Warqa', 'Honey', 'Butter'],
    image: 'https://salimaskitchen.com/wp-content/uploads/2022/11/Almond-Briouat-Salimas-Kitchen-52.jpg'
  },
  {
    title: 'Harcha Semolina Bread',
    cat: 'Bread',
    desc: 'A rich, golden, pan-fried semolina bread with a tender crumb and slightly crispy crust — the quintessential Moroccan breakfast bread. Combine coarse semolina with fine semolina, baking powder, sugar, and a good pinch of salt in a large bowl. Rub in soft butter with your fingertips until the mixture resembles coarse, damp sand with no dry patches remaining. Add warm milk gradually, mixing until the dough just comes together — it should be soft and slightly sticky. Let the dough rest for 10 minutes. Divide into equal portions and flatten each one into a round disc about 1.5cm thick. Coat each disc lightly on both sides with extra fine semolina to create a delicate crust. Cook on a dry, preheated non-stick pan over medium-low heat for 6 to 8 minutes per side, until deep golden with a firm, set crumb. Slice and fill with butter, cheese, honey, or khlii. Serve with a glass of hot Moroccan tea.',
    pt: 10, ct: 15,
    ing: ['Semolina', 'Butter', 'Milk', 'Sugar', 'Baking Powder'],
    image: 'https://blueteatile.com/wp-content/uploads/2024/01/Moroccan-Harcha-semolina-bread-0.jpg'
  },
];

async function runSeed() {
  console.log('🧹 Formatting database completely...');

  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['messages', 'notifications', 'comments', 'saved_recipes', 'likes', 'ingredients', 'recipes', 'follows', 'users'];
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

    for (let r of recipesList) {
      const authorId = userIds[Math.floor(Math.random() * userIds.length)];

      const [rec] = await pool.query(
        'INSERT INTO recipes (user_id, title, description, category, prep_time, cook_time, servings, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [authorId, r.title, r.desc, r.cat, r.pt, r.ct, Math.floor(Math.random() * 6) + 2, r.image]
      );
      const rId = rec.insertId;
      recipeIds.push(rId);

      for (let ing of r.ing) {
        await pool.query('INSERT INTO ingredients (recipe_id, name, quantity) VALUES (?, ?, ?)', [rId, ing, 'To taste']);
      }
    }

    console.log('💬 Simulating social interactions...');

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

    for (let rId of recipeIds) {
      let likedBy = [...userIds].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 11) + 5);
      for (let uId of likedBy) {
        await pool.query('INSERT IGNORE INTO likes (user_id, recipe_id) VALUES (?, ?)', [uId, rId]);
      }

      let savedBy = [...userIds].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 7) + 2);
      for (let uId of savedBy) {
        await pool.query('INSERT IGNORE INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)', [uId, rId]);
      }

      let commentedBy = [...userIds].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 1);
      for (let uId of commentedBy) {
        let txt = commentTexts[Math.floor(Math.random() * commentTexts.length)];
        await pool.query('INSERT INTO comments (user_id, recipe_id, content) VALUES (?, ?, ?)', [uId, rId, txt]);
      }
    }

    console.log('👥 Simulating follow relationships between chefs...');
    for (let i = 0; i < userIds.length; i++) {
      const followerId = userIds[i];
      const candidates = userIds.filter(uid => uid !== followerId);
      const toFollow = [...candidates].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 7) + 3);
      for (const followingId of toFollow) {
        await pool.query('INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
      }
    }

    console.log('✅ DONE! All 20 recipes seeded with real photos and full step descriptions. Bssaha!');
    console.log('⭐ Seeding reviews...');

    const reviewTexts = [
      'Absolutely incredible, made it twice already!',
      'Perfect recipe, the whole family loved it.',
      'Tastes just like my grandmother used to make.',
      'Good but I added a bit more spice to my taste.',
      'Easy to follow and delicious result. 10/10!',
      'The instructions were very clear, turned out perfect.',
      'A bit time consuming but completely worth it.',
      'Made this for a dinner party, everyone asked for the recipe!',
      'Good flavor but needed a little more salt for me.',
      'Bsha wraha! Authentic taste, highly recommend.'
    ];

    for (let rId of recipeIds) {

      const numReviews = Math.floor(Math.random() * 6) + 3;
      const reviewers = [...userIds].sort(() => 0.5 - Math.random()).slice(0, numReviews);

      for (let uId of reviewers) {
        const rating = Math.floor(Math.random() * 3) + 3;
        const content = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        await pool.query(
          'INSERT IGNORE INTO reviews (user_id, recipe_id, rating, content) VALUES (?, ?, ?, ?)',
          [uId, rId, rating, content]
        );
      }
    }
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    pool.end();
  }
}

runSeed();