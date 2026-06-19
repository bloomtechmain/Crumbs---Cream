-- Crumbs & Cream Database Schema

CREATE DATABASE crumbs_and_cream;

\c crumbs_and_cream;

-- Admin users
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(100) UNIQUE NOT NULL,
  email        VARCHAR(200) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(20) DEFAULT 'admin',
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  sort_order  INT DEFAULT 0
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  category_id  INT REFERENCES categories(id) ON DELETE SET NULL,
  image_url    VARCHAR(500),
  is_available BOOLEAN DEFAULT TRUE,
  is_featured  BOOLEAN DEFAULT FALSE,
  is_seasonal  BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Gallery images
CREATE TABLE IF NOT EXISTS gallery_images (
  id          SERIAL PRIMARY KEY,
  image_url   VARCHAR(500) NOT NULL,
  caption     VARCHAR(300),
  tag         VARCHAR(100),
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Customer reviews
CREATE TABLE IF NOT EXISTS reviews (
  id             SERIAL PRIMARY KEY,
  customer_name  VARCHAR(200) NOT NULL,
  rating         INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review_text    TEXT NOT NULL,
  product_name   VARCHAR(200),
  is_approved    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Contact inquiries
CREATE TABLE IF NOT EXISTS contacts (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  email       VARCHAR(200) NOT NULL,
  phone       VARCHAR(50),
  subject     VARCHAR(300),
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Delivery zones
CREATE TABLE IF NOT EXISTS delivery_zones (
  id              SERIAL PRIMARY KEY,
  suburb          VARCHAR(200) NOT NULL,
  postcode        VARCHAR(10) NOT NULL,
  delivery_fee    DECIMAL(10,2) DEFAULT 0.00,
  is_available    BOOLEAN DEFAULT TRUE,
  min_order       DECIMAL(10,2) DEFAULT 0.00
);

-- Seed: Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Cookies',   'cookies',   'Freshly baked homemade cookies in a variety of flavours',   1),
  ('Brownies',  'brownies',  'Rich, fudgy brownies made from scratch',                    2),
  ('Cupcakes',  'cupcakes',  'Beautifully decorated cupcakes for every occasion',          3),
  ('Pastries',  'pastries',  'Flaky, buttery pastries baked fresh daily',                 4)
ON CONFLICT (slug) DO NOTHING;

-- Seed: Admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@crumbsandcream.com.au', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Seed: Products
INSERT INTO products (name, description, price, category_id, is_available, is_featured, sort_order) VALUES
  ('Pistachio & White Chocolate Cookie', 'Buttery cookie loaded with roasted pistachios and creamy white chocolate chunks. A fan favourite.', 6.50, 1, true, true, 1),
  ('Ferrero Rocher Cookie', 'Our signature cookie stuffed with a whole Ferrero Rocher and drizzled with hazelnut chocolate.', 7.00, 1, true, true, 2),
  ('Kinder Bueno Cookie', 'Soft centre cookie filled with Kinder Bueno pieces and creamy hazelnut filling.', 6.50, 1, true, false, 3),
  ('Dolce Chocolate Cookie', 'Triple chocolate cookie with dark, milk and white chocolate chips — utterly indulgent.', 6.00, 1, true, false, 4),
  ('Red Velvet Cookie', 'Velvety red cookie with cream cheese filling and white chocolate drizzle.', 6.50, 1, true, true, 5),
  ('Biscoff Cookie', 'Crispy-edged, chewy-centre cookie swirled with Biscoff spread and topped with a cookie crumble.', 6.50, 1, true, false, 6),
  ('Oreo & White Chocolate Cookie', 'Chunky cookies packed with crushed Oreos and white chocolate — cookies on cookies.', 6.00, 1, true, false, 7),
  ('M&M & Nutella Cookie', 'Rainbow M&M cookie with a hidden Nutella centre. Colourful, fun and delicious.', 6.50, 1, true, false, 8),
  ('Classic Fudge Brownie', 'Dense, rich and ultra-fudgy brownie made with premium dark chocolate. Simply perfect.', 5.50, 2, true, true, 1),
  ('Biscoff Brownie', 'Fudge brownie swirled with Biscoff spread and topped with Biscoff biscuit crumble.', 6.50, 2, true, true, 2),
  ('Nutella Brownie', 'Gooey brownie layered with Nutella throughout. Hazelnut heaven.', 6.50, 2, true, false, 3),
  ('Reese''s Peanut Butter Brownie', 'Chocolate brownie topped with a peanut butter drizzle and Reese''s cups pieces.', 7.00, 2, true, false, 4),
  ('Vanilla Bean Cupcake', 'Light vanilla sponge with silky vanilla bean buttercream. Classic and elegant.', 5.00, 3, true, false, 1),
  ('Chocolate Fudge Cupcake', 'Rich chocolate cupcake with decadent fudge buttercream and chocolate shavings.', 5.50, 3, true, true, 2),
  ('Strawberry & Cream Cupcake', 'Fluffy strawberry sponge filled with fresh cream and topped with strawberry buttercream.', 5.50, 3, true, false, 3),
  ('Lemon Curd Cupcake', 'Zesty lemon cupcake filled with homemade lemon curd and topped with lemon buttercream.', 5.50, 3, true, false, 4),
  ('Croissant', 'Buttery, flaky all-butter croissant baked fresh. Perfect with a morning coffee.', 4.50, 4, true, false, 1),
  ('Pain au Chocolat', 'Classic French pastry with two rich dark chocolate batons encased in buttery layers.', 5.00, 4, true, false, 2)
ON CONFLICT DO NOTHING;

-- Seed: Reviews (pre-approved)
INSERT INTO reviews (customer_name, rating, review_text, product_name, is_approved) VALUES
  ('Sarah M.',    5, 'The Ferrero Rocher cookies are absolutely divine! I ordered a box for my birthday and everyone was raving about them. Will definitely be ordering again!', 'Ferrero Rocher Cookie', true),
  ('James T.',    5, 'Best brownies I have ever had. The Biscoff brownie is next level. Delivery was on time and everything was packaged so beautifully.', 'Biscoff Brownie', true),
  ('Priya K.',    5, 'Yasasi is incredibly talented! The custom cupcakes for my daughter''s baby shower were gorgeous and tasted even better than they looked.', 'Chocolate Fudge Cupcake', true),
  ('Emily R.',    5, 'I cannot stop thinking about the pistachio white chocolate cookies. Soft, chewy, perfectly sweet. A must-try for anyone in Melbourne!', 'Pistachio & White Chocolate Cookie', true),
  ('Michael L.',  4, 'Great quality cookies and fast delivery to Berwick. Packaging was lovely too. The Red Velvet cookie was my favourite.', 'Red Velvet Cookie', true),
  ('Natasha W.',  5, 'Ordered a box for my office and it was gone within minutes! Everyone loved the variety. Already planning my next order.', NULL, true),
  ('David C.',    5, 'The attention to detail is incredible. Every item looked like it came from a high-end bakery but tasted even better. 10/10.', NULL, true),
  ('Anika P.',    5, 'Crumbs & Cream has ruined other bakeries for me. Nothing compares! The Kinder Bueno cookies are my weakness.', 'Kinder Bueno Cookie', true)
ON CONFLICT DO NOTHING;

-- Seed: Delivery zones (Melbourne suburbs)
INSERT INTO delivery_zones (suburb, postcode, delivery_fee, is_available, min_order) VALUES
  ('Berwick',          '3806', 0.00,  true,  30.00),
  ('Narre Warren',     '3805', 0.00,  true,  30.00),
  ('Narre Warren South','3804', 5.00, true,  35.00),
  ('Cranbourne',       '3977', 5.00,  true,  35.00),
  ('Cranbourne North', '3977', 5.00,  true,  35.00),
  ('Cranbourne East',  '3977', 5.00,  true,  35.00),
  ('Clyde',            '3978', 5.00,  true,  35.00),
  ('Clyde North',      '3978', 5.00,  true,  35.00),
  ('Officer',          '3809', 5.00,  true,  35.00),
  ('Pakenham',         '3810', 8.00,  true,  40.00),
  ('Beaconsfield',     '3807', 5.00,  true,  35.00),
  ('Hallam',           '3803', 8.00,  true,  40.00),
  ('Hampton Park',     '3976', 8.00,  true,  40.00),
  ('Endeavour Hills',  '3802', 8.00,  true,  40.00),
  ('Dandenong',        '3175', 10.00, true,  45.00),
  ('Springvale',       '3171', 10.00, true,  45.00),
  ('Noble Park',       '3174', 10.00, true,  45.00),
  ('Rowville',         '3178', 10.00, true,  45.00),
  ('Wheelers Hill',    '3150', 12.00, true,  50.00),
  ('Glen Waverley',    '3150', 12.00, true,  50.00)
ON CONFLICT DO NOTHING;
