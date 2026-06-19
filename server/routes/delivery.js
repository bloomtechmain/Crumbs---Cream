const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// GET /api/delivery  — public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM delivery_zones WHERE is_available = true ORDER BY suburb'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/delivery/all  — admin
router.get('/all', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM delivery_zones ORDER BY suburb');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/delivery  — admin
router.post('/', auth, async (req, res) => {
  const { suburb, postcode, delivery_fee, is_available, min_order } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO delivery_zones (suburb, postcode, delivery_fee, is_available, min_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [suburb, postcode, delivery_fee || 0, is_available !== false, min_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/delivery/:id  — admin
router.put('/:id', auth, async (req, res) => {
  const { suburb, postcode, delivery_fee, is_available, min_order } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE delivery_zones SET suburb=$1, postcode=$2, delivery_fee=$3, is_available=$4, min_order=$5 WHERE id=$6 RETURNING *',
      [suburb, postcode, delivery_fee || 0, is_available, min_order || 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Zone not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/delivery/:id  — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM delivery_zones WHERE id=$1', [req.params.id]);
    res.json({ message: 'Zone deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
