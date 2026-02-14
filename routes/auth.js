const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../lib/db');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 50);
    const password_hash = await bcrypt.hash(password, 12);

    await query(
      'INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)',
      [id, username, password_hash]
    );

    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, username } });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (!result.rows[0] || !await bcrypt.compare(password, result.rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
