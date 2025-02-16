// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Pool configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ea_builder',
  password: process.env.DB_PASS || 'password',
  port: process.env.DB_PORT || 5432,
});

// Basic API endpoint to test server
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

// User Signup Endpoint
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    // In a real app, hash the password before storing
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'User signup failed' });
  }
});

// User Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Generate a JWT token. Use a secure secret in production!
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'User login failed' });
  }
});

// Create EA Model Endpoint
app.post('/api/eamodels', async (req, res) => {
  const { userId, name, configuration } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ea_models (user_id, name, configuration) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, configuration]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('EA model creation error:', err);
    res.status(500).json({ error: 'Creating EA model failed' });
  }
});

// Get EA Models for a User
app.get('/api/eamodels/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM ea_models WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetching EA models error:', err);
    res.status(500).json({ error: 'Fetching EA models failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
