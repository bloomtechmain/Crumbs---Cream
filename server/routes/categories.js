const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories  (admin)
router.post('/', auth, async (req, res) => {
  const { name, slug, description, sort_order } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (name, slug, description, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, slug, description, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id  (admin)
router.put('/:id', auth, async (req, res) => {
  const { name, slug, description, sort_order } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE categories SET name=$1, slug=$2, description=$3, sort_order=$4 WHERE id=$5 RETURNING *',
      [name, slug, description, sort_order || 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
