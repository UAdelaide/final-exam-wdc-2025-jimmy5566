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

    await conn.query(`
      INSERT IGNORE INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
      VALUES
      ((SELECT dog_id FROM Dogs WHERE name='Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name='Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
      ((SELECT dog_id FROM Dogs WHERE name='Rocky'), '2025-06-11 10:00:00', 60, 'Central Park', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name='Luna'), '2025-06-12 14:00:00', 40, 'Riverside', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name='Charlie'), '2025-06-13 16:30:00', 30, 'Hilltop', 'open')
    `);
  } finally {
    conn.release();
  }
}

app.use(express.static(__dirname));

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});