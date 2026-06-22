const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/reviews  — public (approved only)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM reviews WHERE is_approved = true ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/all  — admin (all reviews)
router.get('/all', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews  — public submission
router.post('/', async (req, res) => {
  const { customer_name, rating, review_text, product_name } = req.body;
  if (!customer_name || !rating || !review_text)
    return res.status(400).json({ error: 'Name, rating and review text are required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO reviews (customer_name, rating, review_text, product_name) VALUES ($1,$2,$3,$4) RETURNING *',
      [customer_name, rating, review_text, product_name || null]
    );
    res.status(201).json({ message: 'Review submitted, pending approval', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/admin  — admin manual creation (auto-approved)
router.post('/admin', auth, async (req, res) => {
  const { customer_name, rating, review_text, product_name } = req.body;
  if (!customer_name || !rating || !review_text)
    return res.status(400).json({ error: 'Name, rating and review text are required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO reviews (customer_name, rating, review_text, product_name, is_approved) VALUES ($1,$2,$3,$4,true) RETURNING *',
      [customer_name, rating, review_text, product_name || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reviews/:id/approve  — admin
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET is_approved=true WHERE id=$1 RETURNING *', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reviews/:id/reject  — admin
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET is_approved=false WHERE id=$1 RETURNING *', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id  — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id=$1', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
