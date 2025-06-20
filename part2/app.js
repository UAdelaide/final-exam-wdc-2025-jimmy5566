const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

async function insertTestUsers() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'DogWalkService'
  });
  await db.query(`DELETE FROM Users WHERE username = 'bobwalker'`);
  await db.query(`
    INSERT IGNORE INTO Users (username, email, password_hash, role, created_at) VALUES
    ('ownerJane', 'jane@example.com', 'hashedpassword123', 'owner', '2025-06-06 01:32:58'),
    ('walkerMike', 'mike@example.com', 'hashedpassword456', 'walker', '2025-06-06 01:32:58'),
    ('ownerBob', 'bob@example.com', 'hashedpassword789', 'owner', '2025-06-06 01:34:32')
  `);
  await db.end();
}

insertTestUsers().catch(console.error);

// Export the app instead of listening here
module.exports = app;