const express = require('express');
const crypto = require('crypto');
const sharp = require('sharp');
const multer = require('multer');
const { generateCode } = require('../lib/openai');
const { query } = require('../lib/db');
const authenticate = require('../middleware/auth');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// POST chat message / generate
router.post('/generate', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { framework, prompt } = req.body;
    const userId = req.user.id;
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 50);
    
    let imageData = null;
    if (req.file) {
      const buffer = await sharp(req.file.buffer)
        .resize(1024, 1024, { fit: 'inside' })
        .png()
        .toBuffer();
      imageData = buffer.toString('base64');
    }

    // Save initial component
    await query(
      `INSERT INTO components (id, user_id, name, framework, current_code, base_prompt, image_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, userId, 'New Component', framework, '// Generating...', prompt, imageData]
    );

    // Save user message
    await query(
      `INSERT INTO conversations (id, component_id, user_id, message, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID().replace(/-/g, '').slice(0, 50), id, userId, prompt, 'user']
    );

    // Generate code
    const context = {
      current_code: '',
      conversation_history: [{ role: 'user', message: prompt }],
      image: imageData
    };

    const code = await generateCode(context, framework, prompt);

    // Save AI response and update component
    await query(
      `INSERT INTO conversations (id, component_id, user_id, message, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID().replace(/-/g, '').slice(0, 50), id, userId, code, 'assistant']
    );

    await query(
      `UPDATE components SET current_code = $1 WHERE id = $2`,
      [code, id]
    );

    res.json({ id, code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST conversational update
router.post('/:id/chat', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // Get component context
    const componentResult = await query(
      `SELECT * FROM components WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (!componentResult.rows[0]) {
      return res.status(404).json({ error: 'Component not found' });
    }

    const conversations = await query(
      `SELECT * FROM conversations 
       WHERE component_id = $1 AND user_id = $2 
       ORDER BY timestamp DESC 
       LIMIT 10`,
      [id, userId]
    );

    let imageData = componentResult.rows[0].image_data;
    if (req.file) {
      const buffer = await sharp(req.file.buffer)
        .resize(1024, 1024, { fit: 'inside' })
        .png()
        .toBuffer();
      imageData = buffer.toString('base64');
    }

    const context = {
      current_code: componentResult.rows[0].current_code,
      css_props: componentResult.rows[0].css_props,
      conversation_history: conversations.rows.map(row => ({
        role: row.role,
        message: row.message
      })).reverse(),
      image: imageData
    };

    // Generate updated code
    const updatedCode = await generateCode(context, componentResult.rows[0].framework, message);

    // Save conversation
    const userConvId = crypto.randomUUID().replace(/-/g, '').slice(0, 50);
    await query(
      `INSERT INTO conversations (id, component_id, user_id, message, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [userConvId, id, userId, message, 'user']
    );

    const aiConvId = crypto.randomUUID().replace(/-/g, '').slice(0, 50);
    await query(
      `INSERT INTO conversations (id, component_id, user_id, message, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [aiConvId, id, userId, updatedCode, 'assistant']
    );

    // Save version
    const versionId = crypto.randomUUID().replace(/-/g, '').slice(0, 50);
    const versionNumResult = await query(
      `SELECT COALESCE(MAX(version_number), 0) + 1 as next_version 
       FROM component_versions WHERE component_id = $1`,
      [id]
    );
    
    await query(
      `INSERT INTO component_versions (id, component_id, version_number, code, change_summary)
       VALUES ($1, $2, $3, $4, $5)`,
      [versionId, id, versionNumResult.rows[0].next_version, updatedCode, message]
    );

    // Update component
    await query(
      `UPDATE components SET current_code = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3`,
      [updatedCode, id, userId]
    );

    res.json({ code: updatedCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
