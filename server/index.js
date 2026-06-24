const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db/pool');

async function applyImageMigration() {
  const productImages = [
    { name: 'Ferrero Rocher Cookie',        url: '/uploads/ferrero-rocher-cookie.jpg' },
    { name: 'Kinder Bueno Cookie',           url: '/uploads/kinder-bueno-cookie.jpg' },
    { name: 'Biscoff Cookie',                url: '/uploads/biscoff-cookie.jpg' },
    { name: 'Oreo & White Chocolate Cookie', url: '/uploads/oreo-white-chocolate-cookie.jpg' },
  ];
  for (const { name, url } of productImages) {
    await pool.query(
      'UPDATE products SET image_url = $1 WHERE name = $2 AND (image_url IS NULL OR image_url = $1)',
      [url, name]
    );
  }

  const galleryImages = [
    { url: '/uploads/ferrero-rocher-cookie.jpg',       caption: 'Ferrero Rocher Cookie',        tag: 'cookies', sort: 1 },
    { url: '/uploads/kinder-bueno-cookie.jpg',         caption: 'Kinder Bueno Cookie',          tag: 'cookies', sort: 2 },
    { url: '/uploads/biscoff-cookie.jpg',              caption: 'Biscoff Cookie',               tag: 'cookies', sort: 3 },
    { url: '/uploads/oreo-white-chocolate-cookie.jpg', caption: 'Oreo & White Chocolate Cookie',tag: 'cookies', sort: 4 },
  ];
  for (const { url, caption, tag, sort } of galleryImages) {
    await pool.query(
      `INSERT INTO gallery_images (image_url, caption, tag, sort_order)
       SELECT $1,$2,$3,$4 WHERE NOT EXISTS (SELECT 1 FROM gallery_images WHERE image_url = $1)`,
      [url, caption, tag, sort]
    );
  }
}

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true
    : (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173']),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/gallery',    require('./routes/gallery'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/contacts',   require('./routes/contacts'));
app.use('/api/delivery',   require('./routes/delivery'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', app: 'Crumbs & Cream API' }));

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(publicDir, 'index.html'), (err) => { if (err) next(err); });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await applyImageMigration().catch(err => console.error('Image migration error:', err));
});
