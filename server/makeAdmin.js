const pool = require('./config/db');

async function makeAdmin() {
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query('UPDATE users SET is_admin = TRUE WHERE email = ?', ['soulaymaane@gmail.com']);
    
    if (result.affectedRows > 0) {
      console.log('✅ Successfully made soulaymaane@gmail.com an admin!');
    } else {
      console.log('❌ User soulaymaane@gmail.com not found. We will make the first user an admin instead.');
      await conn.query('UPDATE users SET is_admin = TRUE LIMIT 1');
      console.log('✅ Automatically made a random user an admin as fallback.');
    }
    
    conn.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

makeAdmin();
