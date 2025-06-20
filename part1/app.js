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

app.use(express.static(__dirname));

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});