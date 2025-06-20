const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 8080;

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'DogWalkService'
};

let pool;

async function insertTestData() {
  const conn = await pool.getConnection();
  try {

    await conn.query(`
      INSERT IGNORE INTO Users (username, email, password_hash, role)
      VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('davewalker', 'dave@example.com', 'hashedabc', 'walker'),
      ('eveowner', 'eve@example.com', 'hashedxyz', 'owner')
    `);

    await conn.query(`
      INSERT IGNORE INTO Dogs (owner_id, name, size)
      VALUES
      ((SELECT user_id FROM Users WHERE username='alice123'), 'Max', 'medium'),
      ((SELECT user_id FROM Users WHERE username='carol123'), 'Bella', 'small'),
      ((SELECT user_id FROM Users WHERE username='alice123'), 'Rocky', 'large'),
      ((SELECT user_id FROM Users WHERE username='eveowner'), 'Luna', 'medium'),
      ((SELECT user_id FROM Users WHERE username='carol123'), 'Charlie', 'small')
    `);


  } finally {
    conn.release();
  }
}

app.use(express.static(__dirname));

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});