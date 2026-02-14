const express = require('express');
const crypto = require('crypto');
const sharp = require('sharp');
const multer = require('multer');
const { generateCode } = require('../lib/openai');
const { query } = require('../lib/db');
const authenticate = require('../middleware/auth');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// GET user's components
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
       COUNT(conv.id) as message_count,
       COALESCE(MAX(conv.timestamp), c.created_at) as last_activity
       FROM components c
       LEFT JOIN conversations conv ON c.id = conv.component_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY last_activity DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new component
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, framework } = req.body;
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 50);
    
    await query(
      `INSERT INTO components (id, user_id, name, framework, current_code, base_prompt)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, req.user.id, name || 'New Component', framework || 'react', 
       framework === 'react' ? defaultReactCode() : defaultHtmlCode(),
       '']
    );
    
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET component details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
       array_agg(json_build_object('id', conv.id, 'message', conv.message, 'role', conv.role, 'timestamp', conv.timestamp)) as conversations
       FROM components c
       LEFT JOIN conversations conv ON c.id = conv.component_id AND c.user_id = $1
       WHERE c.id = $2 AND c.user_id = $1
       GROUP BY c.id`,
      [req.user.id, req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Component not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update component
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { current_code, css_props, name } = req.body;
    
    await query(
      `UPDATE components 
       SET current_code = $1, css_props = $2, name = COALESCE($3, name), updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5`,
      [current_code, css_props || '{}', name, req.params.id, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function defaultReactCode() {
  return `function MyComponent() {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto" style={{
      '--primary-color': '#3b82f6',
      '--bg-color': '#ffffff',
      '--text-color': '#1f2937',
      '--padding': '2rem',
      '--margin': '1rem',
      '--border-radius': '0.5rem'
    }}>
      <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">Hello World!</h2>
      <button className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-[var(--border-radius)] hover:bg-blue-600 transition-all">
        Click Me
      </button>
    </div>
  );
}

export default MyComponent;`;
}

function defaultHtmlCode() {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --primary-color: #3b82f6;
      --bg-color: #ffffff;
      --text-color: #1f2937;
      --padding: 2rem;
      --margin: 1rem;
      --border-radius: 0.5rem;
    }
    .container {
      padding: var(--padding);
      background: var(--bg-color);
      border-radius: var(--border-radius);
      box-shadow: 0 10px 15px rgba(0,0,0,0.1);
      max-width: 400px;
      margin: var(--margin) auto;
    }
    button {
      background: var(--primary-color);
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="color: var(--text-color); margin-bottom: 1rem;">Hello World!</h2>
    <button>Click Me</button>
  </div>
</body>
</html>`;
}

module.exports = router;
