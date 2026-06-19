const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// POST /api/contacts  — public
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: 'Name, email and message are required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [name, email, phone || null, subject || null, message]
    );
    res.status(201).json({ message: 'Message sent successfully', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contacts  — admin
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/contacts/:id/read  — admin
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await pool.query('UPDATE contacts SET is_read=true WHERE id=$1', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/contacts/:id  — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM contacts WHERE id=$1', [req.params.id]);
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
