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

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const rateLimit = require('express-rate-limit');


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



// Existing endpoint updated to use node-cache
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
  const cacheKey = `ea_models_${userId}`;
  try {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    const result = await pool.query('SELECT * FROM ea_models WHERE user_id = $1', [userId]);
    cache.set(cacheKey, result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching EA models:', err);
    res.status(500).json({ error: 'Failed to fetch EA models' });
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
 *     summary: Generate advanced EA code based on provided configuration including multiple indicators and risk management settings.
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
 *                 description: Contains an array of indicators, risk management settings, and conditions.
 *                 properties:
 *                   indicators:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - name
 *                         - parameter
 *                       properties:
 *                         name:
 *                           type: string
 *                         parameter:
 *                           type: number
 *                   riskSettings:
 *                     type: object
 *                     properties:
 *                       stopLoss:
 *                         type: number
 *                       trailingStop:
 *                         type: number
 *                   conditions:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Array of conditions for trading logic.
 *     responses:
 *       200:
 *         description: Generated EA code successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *       400:
 *         description: Invalid or missing configuration.
 *       500:
 *         description: EA code generation failed.
 */
app.post('/api/eacode', async (req, res) => {
  const { configuration } = req.body;
  if (!configuration || typeof configuration !== 'object' || !configuration.indicators) {
    return res.status(400).json({ error: 'Invalid or missing configuration or indicators array' });
  }
  try {
    const { indicators, riskSettings, conditions } = configuration;
    let codeLines = [];
    codeLines.push("// EA Generated Code with Advanced Features");
    indicators.forEach((ind, index) => {
      codeLines.push(`// Indicator ${index + 1}: ${ind.name} with parameter: ${ind.parameter}`);
    });
    if (riskSettings) {
      const { stopLoss, trailingStop } = riskSettings;
      codeLines.push(`// Risk Settings: Stop Loss: ${stopLoss}, Trailing Stop: ${trailingStop}`);
    }
    if (conditions && conditions.length > 0) {
      codeLines.push("// Conditional Logic:");
      conditions.forEach((cond, index) => {
        codeLines.push(`// Condition ${index + 1}: ${cond}`);
      });
    }
    codeLines.push(`void OnInit() {`);
    codeLines.push(`   // Initialize indicators and risk management settings`);
    codeLines.push(`}`);
    codeLines.push(`void OnTick() {`);
    codeLines.push(`   // Evaluate trading conditions`);
    codeLines.push(`   if (/* condition based on indicators */) {`);
    codeLines.push(`      // Execute trade logic`);
    codeLines.push(`   } else {`);
    codeLines.push(`      // Alternative trading logic`);
    codeLines.push(`   }`);
    codeLines.push(`}`);
    const generatedCode = codeLines.join("\n");
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

/**
 * @swagger
 * /api/eamodels/{id}/version:
 *   post:
 *     summary: Save a new version of an EA model
 *     tags: [Version Control]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The EA model ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: The current EA code to be saved as a version.
 *     responses:
 *       201:
 *         description: Version saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: object
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Failed to save version.
 */
app.post('/api/eamodels/:id/version', async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing code for versioning.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO ea_model_versions (ea_model_id, code, version_date) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
      [id, code]
    );
    res.status(201).json({ message: 'Version saved successfully.', version: result.rows[0] });
  } catch (err) {
    console.error('Error saving EA model version:', err);
    res.status(500).json({ error: 'Failed to save version', details: err.message });
  }
});


/**
 * @swagger
 * /api/eamodels/{id}/versions:
 *   get:
 *     summary: Retrieve the version history for an EA model
 *     tags: [Version Control]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The EA model ID.
 *     responses:
 *       200:
 *         description: Version history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   code:
 *                     type: string
 *                   version_date:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Failed to retrieve versions.
 */
app.get('/api/eamodels/:id/versions', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, code, version_date FROM ea_model_versions WHERE ea_model_id = $1 ORDER BY version_date DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving EA model versions:', err);
    res.status(500).json({ error: 'Failed to retrieve versions', details: err.message });
  }
});

/**
 * @swagger
 * /api/eamodels/{id}/rollback:
 *   post:
 *     summary: Roll back an EA model to a previous version
 *     tags: [Version Control]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The EA model ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - versionId
 *             properties:
 *               versionId:
 *                 type: integer
 *                 description: The version ID to roll back to.
 *     responses:
 *       200:
 *         description: EA model rolled back successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ea_model:
 *                   type: object
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Version not found.
 *       500:
 *         description: Rollback failed.
 */
app.post('/api/eamodels/:id/rollback', async (req, res) => {
  const { id } = req.params;
  const { versionId } = req.body;
  if (!versionId || isNaN(versionId)) {
    return res.status(400).json({ error: 'Invalid or missing versionId.' });
  }
  try {
    const versionResult = await pool.query(
      'SELECT code FROM ea_model_versions WHERE id = $1 AND ea_model_id = $2',
      [versionId, id]
    );
    if (versionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Version not found for this EA model.' });
    }
    const code = versionResult.rows[0].code;
    const updateResult = await pool.query(
      'UPDATE ea_models SET code = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [code, id]
    );
    res.json({ message: 'EA model rolled back successfully.', ea_model: updateResult.rows[0] });
  } catch (err) {
    console.error('Rollback error:', err);
    res.status(500).json({ error: 'Rollback failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Create a new payment order for premium subscription and store payer details
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 description: Payment amount.
 *     responses:
 *       200:
 *         description: Payment order created and stored successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     user_id:
 *                       type: number
 *                     order_id:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                 paymentUrl:
 *                   type: string
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Payment order creation failed.
 */
app.post('/api/payments/create', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || isNaN(userId) || !amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid or missing userId or amount' });
  }
  try {
    // Generate a random order ID using slice (instead of deprecated substr)
    const orderId = 'order_' + Math.random().toString(36).slice(2, 11);
    // Simulate a payment URL (to be integrated with an actual payment gateway later)
    const paymentUrl = `https://payment-gateway.example.com/pay/${orderId}`;
    
    // Insert the payment order details into the database
    const insertQuery = `
      INSERT INTO payment_orders (user_id, order_id, amount, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [userId, orderId, amount, 'pending']);
    
    res.json({ order: result.rows[0], paymentUrl });
  } catch (err) {
    console.error('Payment order creation error:', err);
    res.status(500).json({ error: 'Payment order creation failed', details: err.message });
  }
});




// Setup rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);


/**
 * @swagger
 * /api/eamodels/{id}/share:
 *   post:
 *     summary: Submit an EA model for marketplace sharing
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The EA model ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *             properties:
 *               price:
 *                 type: number
 *                 description: The sale price for the EA model.
 *     responses:
 *       200:
 *         description: EA model submitted for sharing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ea_model:
 *                   type: object
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Submission failed.
 */
app.post('/api/eamodels/:id/share', async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  if (!price || isNaN(price)) {
    return res.status(400).json({ error: 'Invalid or missing price' });
  }
  try {
    const result = await pool.query(
      'UPDATE ea_models SET approval_status = $1, price = $2 WHERE id = $3 RETURNING *',
      ['pending', price, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'EA model not found' });
    }
    res.json({ message: 'EA model submitted for sharing. Pending approval.', ea_model: result.rows[0] });
  } catch (err) {
    console.error('Error submitting EA model for sharing:', err);
    res.status(500).json({ error: 'Submission failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/eamodels/{id}/approve:
 *   post:
 *     summary: Approve an EA model for marketplace sharing (admin only)
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The EA model ID.
 *     responses:
 *       200:
 *         description: EA model approved for sharing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ea_model:
 *                   type: object
 *       404:
 *         description: EA model not found.
 *       500:
 *         description: Approval failed.
 */
app.post('/api/eamodels/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE ea_models SET approval_status = $1 WHERE id = $2 RETURNING *',
      ['approved', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'EA model not found' });
    }
    res.json({ message: 'EA model approved for sharing.', ea_model: result.rows[0] });
  } catch (err) {
    console.error('Error approving EA model:', err);
    res.status(500).json({ error: 'Approval failed', details: err.message });
  }
});

/**
 * @swagger
 * /api/marketplace:
 *   get:
 *     summary: Get all approved EA models available in the marketplace
 *     tags: [Marketplace]
 *     responses:
 *       200:
 *         description: A list of approved EA models.
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
 *                   price:
 *                     type: number
 *                   approval_status:
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
 *         description: Failed to retrieve marketplace EA models.
 */
app.get('/api/marketplace', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ea_models WHERE approval_status = 'approved' AND price > 0"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching marketplace EA models:', err);
    res.status(500).json({ error: 'Failed to retrieve marketplace EA models', details: err.message });
  }
});

/**
 * @swagger
 * /api/marketplace/purchase:
 *   post:
 *     summary: Purchase an EA model from the marketplace
 *     tags: [Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ea_model_id
 *               - buyer_id
 *             properties:
 *               ea_model_id:
 *                 type: integer
 *               buyer_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Purchase successful and revenue share processed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 purchase:
 *                   type: object
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Purchase failed.
 */
app.post('/api/marketplace/purchase', async (req, res) => {
  const { ea_model_id, buyer_id } = req.body;
  if (!ea_model_id || isNaN(ea_model_id) || !buyer_id || isNaN(buyer_id)) {
    return res.status(400).json({ error: 'Invalid or missing ea_model_id or buyer_id' });
  }
  try {
    // Retrieve the EA model details
    const modelResult = await pool.query('SELECT user_id, price FROM ea_models WHERE id = $1 AND approval_status = $2', [ea_model_id, 'approved']);
    if (modelResult.rows.length === 0) {
      return res.status(404).json({ error: 'EA model not found or not approved for sale' });
    }
    const eaModel = modelResult.rows[0];
    const salePrice = parseFloat(eaModel.price);
    const commissionRate = 0.20; // 20% commission
    const commissionAmount = salePrice * commissionRate;
    const developerShare = salePrice - commissionAmount;
    // Simulate purchase processing; record purchase in payment_orders table
    const purchaseResult = await pool.query(
      `INSERT INTO payment_orders (user_id, order_id, amount, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [buyer_id, 'purchase_' + Math.random().toString(36).slice(2, 11), salePrice, 'completed']
    );
    res.json({ 
      message: `Purchase successful. Commission: ${commissionAmount.toFixed(2)}, Developer Share: ${developerShare.toFixed(2)}.`,
      purchase: purchaseResult.rows[0]
    });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ error: 'Purchase failed', details: err.message });
  }
});


/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get analytics summary for EA models.
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalModels:
 *                   type: integer
 *                 avgProfit:
 *                   type: number
 *                 avgDrawdown:
 *                   type: number
 *       500:
 *         description: Failed to retrieve analytics.
 */
app.get('/api/analytics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS "totalModels",
        COALESCE(AVG((backtest_results->>'profit')::numeric), 0) AS "avgProfit",
        COALESCE(AVG((backtest_results->>'drawdown')::numeric), 0) AS "avgDrawdown"
      FROM ea_models
      WHERE backtest_results IS NOT NULL;
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics', details: err.message });
  }
});






app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
