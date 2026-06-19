const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/gallery  — public
router.get('/', async (req, res) => {
  const { tag } = req.query;
  try {
    const params = tag ? [tag] : [];
    const whereStr = tag ? 'WHERE tag = $1' : '';
    const { rows } = await pool.query(
      `SELECT * FROM gallery_images ${whereStr} ORDER BY sort_order, created_at DESC`, params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gallery  — admin
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { caption, tag, sort_order } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Image file required' });
  const image_url = `/uploads/${req.file.filename}`;
  try {
    const { rows } = await pool.query(
      'INSERT INTO gallery_images (image_url, caption, tag, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
      [image_url, caption, tag, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/gallery/:id  — admin
router.put('/:id', auth, async (req, res) => {
  const { caption, tag, sort_order } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE gallery_images SET caption=$1, tag=$2, sort_order=$3 WHERE id=$4 RETURNING *',
      [caption, tag, sort_order || 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Image not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/gallery/:id  — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery_images WHERE id=$1', [req.params.id]);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
