const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));


app.use(session({
  secret: 'dogwalk-secret',
  resave: false,
  saveUninitialized: true
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'DogWalkService'
  });
  const [rows] = await db.query(
    'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
    [username, password]
  );
  await db.end();
  if (rows.length === 1) {
    req.session.user = {
      id: rows[0].user_id,
      username: rows[0].username,
      role: rows[0].role
    };
    if (rows[0].role === 'owner') {
      res.json({ success: true, redirect: '/owner-dashboard.html' });
    } else if (rows[0].role === 'walker') {
      res.json({ success: true, redirect: '/walker-dashboard.html' });
    } else {
      res.status(400).json({ success: false, message: 'Unknown role' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

async function insertTestUsers() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'DogWalkService'
  });
  await db.end();
}

insertTestUsers().catch(console.error);

// Export the app instead of listening here
module.exports = app;