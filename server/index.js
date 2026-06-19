const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
