// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EA Builder API',
      version: '1.0.0',
      description: 'API documentation for EA Builder Platform',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./server.js'], // files containing annotations for the OpenAPI specification
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @swagger
 * /:
 *   get:
 *     summary: Basic endpoint to check if the API is running
 *     responses:
 *       200:
 *         description: Backend API is running
 */
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: User signup failed
 */
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'Invalid username. Must be at least 3 characters.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Invalid password. Must be at least 6 characters long.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username.trim(), hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'User signup failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: User login failed
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing username' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing password' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username.trim()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'User login failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/eamodels:
 *   post:
 *     summary: Create a new EA model
 *     tags: [EA Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *               - configuration
 *             properties:
 *               userId:
 *                 type: integer
 *               name:
 *                 type: string
 *               configuration:
 *                 type: object
 *     responses:
 *       201:
 *         description: EA model created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Creating EA model failed
 */
app.post('/api/eamodels', async (req, res) => {
  const { userId, name, configuration } = req.body;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid or missing userId' });
  }
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid or missing name' });
  }
  if (!configuration || typeof configuration !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing configuration; must be an object' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO ea_models (user_id, name, configuration) VALUES ($1, $2, $3) RETURNING *',
      [userId, name.trim(), configuration]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('EA model creation error:', err);
    res.status(500).json({ error: 'Creating EA model failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/eamodels/{userId}:
 *   get:
 *     summary: Get all EA models for a specific user
 *     tags: [EA Models]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A list of EA models
 *       400:
 *         description: Invalid userId parameter
 *       500:
 *         description: Fetching EA models failed
 */
app.get('/api/eamodels/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid userId parameter' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM ea_models WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetching EA models error:', err);
    res.status(500).json({ error: 'Fetching EA models failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/eamodels/{id}:
 *   put:
 *     summary: Update an EA model by its ID
 *     tags: [EA Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The EA model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - configuration
 *             properties:
 *               name:
 *                 type: string
 *               configuration:
 *                 type: object
 *     responses:
 *       200:
 *         description: EA model updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: EA model not found
 *       500:
 *         description: EA model update failed
 */
app.put('/api/eamodels/:id', async (req, res) => {
  const { id } = req.params;
  const { name, configuration } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid or missing name' });
  }
  if (!configuration || typeof configuration !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing configuration; must be an object' });
  }
  try {
    const result = await pool.query(
      'UPDATE ea_models SET name = $1, configuration = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name.trim(), configuration, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'EA model not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('EA model update error:', err);
    res.status(500).json({ error: 'EA model update failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/eamodels/{id}:
 *   delete:
 *     summary: Delete an EA model by its ID
 *     tags: [EA Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The EA model ID
 *     responses:
 *       200:
 *         description: EA model deleted successfully
 *       404:
 *         description: EA model not found
 *       500:
 *         description: EA model deletion failed
 */
app.delete('/api/eamodels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM ea_models WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'EA model not found' });
    }
    res.json({ message: 'EA model deleted successfully' });
  } catch (err) {
    console.error('EA model deletion error:', err);
    res.status(500).json({ error: 'EA model deletion failed', details: err.message });
  }
});
const { runBacktest } = require('./backtesting');

/**
 * @swagger
 * /api/backtest:
 *   post:
 *     summary: Run a backtest for an EA model configuration
 *     tags: [Backtesting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - configuration
 *             properties:
 *               configuration:
 *                 type: object
 *                 description: Contains indicator, parameter, spread, slippage, and commission.
 *                 properties:
 *                   indicator:
 *                     type: string
 *                   parameter:
 *                     type: number
 *                   spread:
 *                     type: number
 *                     default: 0.5
 *                   slippage:
 *                     type: number
 *                     default: 0.2
 *                   commission:
 *                     type: number
 *                     default: 0.1
 *     responses:
 *       200:
 *         description: Backtest completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profit:
 *                   type: number
 *                 drawdown:
 *                   type: number
 *                 winRatio:
 *                   type: number
 *                 sharpeRatio:
 *                   type: number
 *                 backtestDate:
 *                   type: string
 *                   format: date-time
 *                 configuration:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Backtest failed
 */
app.post('/api/backtest', async (req, res) => {
  const { configuration } = req.body;
  if (!configuration || typeof configuration !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing configuration' });
  }
  try {
    const results = runBacktest(configuration);
    res.json(results);
  } catch (err) {
    console.error('Backtest error:', err);
    res.status(500).json({ error: 'Backtest failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/eacode:
 *   post:
 *     summary: Generate EA code with risk management options based on provided configuration
 *     tags: [EA Code Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - configuration
 *             properties:
 *               configuration:
 *                 type: object
 *                 description: Contains indicator selections, parameters, and risk management settings.
 *                 properties:
 *                   indicator:
 *                     type: string
 *                   parameter:
 *                     type: number
 *                   stopLoss:
 *                     type: number
 *                     description: Adaptive stop loss value.
 *                   trailingStop:
 *                     type: number
 *                     description: Trailing stop value.
 *                   commission:
 *                     type: number
 *                     default: 0.1
 *     responses:
 *       200:
 *         description: Generated EA code successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *       400:
 *         description: Invalid or missing configuration
 *       500:
 *         description: EA code generation failed
 */
app.post('/api/eacode', async (req, res) => {
  const { configuration } = req.body;
  if (!configuration || typeof configuration !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing configuration' });
  }
  try {
    const { indicator, parameter, stopLoss, trailingStop, commission = 0.1 } = configuration;
    const generatedCode = `
      // EA Generated Code with Risk Management
      // Indicator: ${indicator}, Parameter: ${parameter}
      // Stop Loss: ${stopLoss}, Trailing Stop: ${trailingStop}, Commission: ${commission}
      
      void OnInit() {
        // Initialize indicators and risk management parameters...
      }
      
      void OnTick() {
        // Evaluate trading signals using risk management logic.
        if (/* condition based on risk management settings */) {
          // Execute adaptive stop loss or trailing stop logic.
        }
      }
    `;
    res.json({ code: generatedCode });
  } catch (err) {
    console.error('EA code generation error:', err);
    res.status(500).json({ error: 'EA code generation failed', details: err.message });
  }
});


/**
 * @swagger
 * /api/admin/top-eamodels:
 *   get:
 *     summary: Retrieve the top 20 EA models (admin access)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of top 20 EA models
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   configuration:
 *                     type: object
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Failed to retrieve top EA models
 */
app.get('/api/admin/top-eamodels', async (req, res) => {
  try {
    // For demonstration, we assume top models are flagged in the ea_models table with is_top = true.
    const result = await pool.query(
      'SELECT * FROM ea_models WHERE is_top = true ORDER BY created_at DESC LIMIT 20'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetching top EA models error:', err);
    res.status(500).json({ error: 'Failed to retrieve top EA models', details: err.message });
  }
});

// Subscription Management Endpoints

/**
 * @swagger
 * /api/subscriptions/free:
 *   post:
 *     summary: Activate free tier subscription for a user
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Free tier subscription activated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Free tier subscription activation failed
 */
app.post('/api/subscriptions/free', async (req, res) => {
  const { userId } = req.body;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid or missing userId' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO subscriptions (user_id, subscription_type, subscription_start, ea_model_count)
       VALUES ($1, 'free', CURRENT_TIMESTAMP, 0)
       RETURNING *`,
      [userId]
    );
    res.json({ message: 'Free tier subscription activated', subscription: result.rows[0] });
  } catch (err) {
    console.error('Free tier subscription error:', err);
    res.status(500).json({ error: 'Free tier subscription activation failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/subscriptions/{userId}:
 *   get:
 *     summary: Check a user's subscription status
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: Subscription status retrieved
 *       400:
 *         description: Invalid userId parameter
 *       500:
 *         description: Failed to retrieve subscription status
 */
app.get('/api/subscriptions/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid userId parameter' });
  }
  try {
    const result = await pool.query(
      'SELECT subscription_type, subscription_start, ea_model_count FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows[0] || { message: 'No subscription found for this user' });
  } catch (err) {
    console.error('Subscription retrieval error:', err);
    res.status(500).json({ error: 'Failed to retrieve subscription status', details: err.message });
  }
});

/**
 * @swagger
 * /api/subscriptions/upgrade:
 *   post:
 *     summary: Upgrade a user to premium subscription
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User upgraded to premium successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Subscription not found for user
 *       500:
 *         description: Premium upgrade failed
 */
app.post('/api/subscriptions/upgrade', async (req, res) => {
  const { userId } = req.body;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid or missing userId' });
  }
  try {
    const result = await pool.query(
      `UPDATE subscriptions SET subscription_type = 'premium', ea_model_count = 0, subscription_start = CURRENT_TIMESTAMP
       WHERE user_id = $1 RETURNING *`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found for user' });
    }
    res.json({ message: 'User upgraded to premium successfully', subscription: result.rows[0] });
  } catch (err) {
    console.error('Premium upgrade error:', err);
    res.status(500).json({ error: 'Premium upgrade failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/eamodels/{id}/backtest-update:
 *   post:
 *     summary: Update backtest results for an EA model
 *     tags: [EA Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The EA model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profit
 *               - drawdown
 *               - winRatio
 *             properties:
 *               profit:
 *                 type: number
 *               drawdown:
 *                 type: number
 *               winRatio:
 *                 type: number
 *     responses:
 *       200:
 *         description: EA model backtest results updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing required performance metrics
 *       404:
 *         description: EA model not found
 *       500:
 *         description: Updating backtest results failed
 */
app.post('/api/eamodels/:id/backtest-update', async (req, res) => {
  const { id } = req.params;
  const { profit, drawdown, winRatio } = req.body;
  if (profit === undefined || drawdown === undefined || winRatio === undefined) {
    return res.status(400).json({ error: 'Missing required performance metrics: profit, drawdown, winRatio' });
  }
  try {
    const result = await pool.query(
      `UPDATE ea_models 
       SET backtest_results = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [ { profit, drawdown, winRatio }, id ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'EA model not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update backtest error:', err);
    res.status(500).json({ error: 'Updating backtest results failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/eamodels/rank:
 *   post:
 *     summary: Rank EA models and flag the top 20 models
 *     tags: [EA Models]
 *     responses:
 *       200:
 *         description: EA models ranked successfully, top 20 flagged
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   backtest_results:
 *                     type: object
 *                   is_top:
 *                     type: boolean
 *       500:
 *         description: Ranking EA models failed
 */
app.post('/api/eamodels/rank', async (req, res) => {
  try {
    // Fetch all EA models with backtest_results available
    const allModelsResult = await pool.query('SELECT id, backtest_results FROM ea_models WHERE backtest_results IS NOT NULL');
    const models = allModelsResult.rows;

    // Compute a score for each model; for simplicity: score = profit - drawdown
    const scoredModels = models.map(model => {
      const bt = model.backtest_results || {};
      const profit = bt.profit || 0;
      const drawdown = bt.drawdown || 0;
      const score = profit - drawdown;
      return { id: model.id, score };
    });

    // Sort models by score descending and select top 20 IDs
    scoredModels.sort((a, b) => b.score - a.score);
    const top20Ids = scoredModels.slice(0, 20).map(model => model.id);

    // Reset is_top flag for all EA models
    await pool.query('UPDATE ea_models SET is_top = false');

    // Set is_top to true for the top 20 models
    if (top20Ids.length > 0) {
      await pool.query('UPDATE ea_models SET is_top = true WHERE id = ANY($1::int[])', [top20Ids]);
    }

    // Retrieve and return the top 20 EA models
    const topModelsResult = await pool.query('SELECT * FROM ea_models WHERE is_top = true ORDER BY created_at DESC LIMIT 20');
    res.json(topModelsResult.rows);
  } catch (err) {
    console.error('Ranking error:', err);
    res.status(500).json({ error: 'Ranking EA models failed', details: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
