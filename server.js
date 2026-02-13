require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const productsRoute = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// connect to MongoDB (optional)
const connectDB = require('./config/db');
connectDB();

// serve static files (root of repo)
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/products', productsRoute);

// fallback to index (optional for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'NIKE', 'index.html'));
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));

// server/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  price: Number,
  image: String,
  url: String,
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);

// server/routes/products.js
const express = require('express');
const path = require('path');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    // try DB first
    if (process.env.MONGODB_URI) {
      const items = await Product.find().lean().exec();
      if (items && items.length) return res.json(items);
    }

    // fallback: return data/products.json
    const jsonPath = path.join(__dirname, '..', '..', 'data', 'products.json');
    res.sendFile(jsonPath, err => {
      if (err) {
        console.error('sendFile error', err);
        res.status(500).json({ error: 'Failed to load products' });
      }
    });
  } catch (err) {
    console.error('products route error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;