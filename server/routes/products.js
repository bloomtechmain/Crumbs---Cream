const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
`;

// GET /api/products  — public
router.get('/', async (req, res) => {
  const { category, featured, available } = req.query;
  let where = [];
  let params = [];
  let i = 1;
  if (category) { where.push(`c.slug = $${i++}`); params.push(category); }
  if (featured === 'true') { where.push(`p.is_featured = true`); }
  if (available !== 'false') { where.push(`p.is_available = true`); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  try {
    const { rows } = await pool.query(`${SELECT} ${whereStr} ORDER BY p.sort_order, p.name`, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/all  — admin (includes unavailable)
router.get('/all', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT} ORDER BY c.sort_order, p.sort_order, p.name`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT} WHERE p.id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products  — admin
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { name, description, price, category_id, is_available, is_featured, is_seasonal, sort_order } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, category_id, image_url, is_available, is_featured, is_seasonal, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, description, price, category_id, image_url,
       is_available !== 'false', is_featured === 'true', is_seasonal === 'true', sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id  — admin
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const { name, description, price, category_id, is_available, is_featured, is_seasonal, sort_order } = req.body;
  let image_url = req.body.image_url || null;
  if (req.file) image_url = `/uploads/${req.file.filename}`;
  try {
    const { rows } = await pool.query(
      `UPDATE products SET
        name=$1, description=$2, price=$3, category_id=$4,
        ${image_url !== null ? 'image_url=$5,' : ''}
        is_available=$${image_url !== null ? 6 : 5},
        is_featured=$${image_url !== null ? 7 : 6},
        is_seasonal=$${image_url !== null ? 8 : 7},
        sort_order=$${image_url !== null ? 9 : 8},
        updated_at=NOW()
       WHERE id=$${image_url !== null ? 10 : 9} RETURNING *`,
      image_url !== null
        ? [name, description, price, category_id, image_url,
           is_available !== 'false', is_featured === 'true', is_seasonal === 'true', sort_order || 0, req.params.id]
        : [name, description, price, category_id,
           is_available !== 'false', is_featured === 'true', is_seasonal === 'true', sort_order || 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/availability  — admin quick toggle
router.patch('/:id/availability', auth, async (req, res) => {
  const { is_available } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE products SET is_available=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [is_available, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id  — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
