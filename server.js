// --- 1. ZAROORI PACKAGES IMPORT KARO ---
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Yeh line .env file ko load karti hai
const Product = require('./models/product'); // Hamara Product blueprint (Schema)

// --- 2. APP SETUP (EXPRESS KI TAYYARI) ---
const app = express();
const PORT = 3000;

// Middleware (Translators)
// Express ko batao ki Admin Panel se aane waale JSON data ko kaise padhna hai
app.use(express.json()); 
// Express ko batao ki hamari static files (HTML, CSS, JS, Images) kahan hain
app.use(express.static(__dirname)); 

// --- 3. DATABASE CONNECTION ---
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then((result) => {
    // Database connect hone ke BAAD hi server chalu karo
    app.listen(PORT, () => {
      console.log('✅ Database se connect ho gaya!');
      console.log(`🚀 Server chalu ho gaya hai http://localhost:${PORT} par`);
    });
  })
  .catch((err) => {
    console.log('❌ Database connection fail!');
    console.log(err);
  });

// --- 4. API ROUTES (Jahaan Asli Kaam Hoga) ---

/**
 * (A) NAYA PRODUCT BANANE KA ROUTE (Admin Panel yahaan data bhejega)
 * Method: POST
 * URL: /api/products
 */
app.post('/api/products', (req, res) => {
  console.log('--- NAYA PRODUCT REQUEST AAYA ---');
  console.log('Data jo mila:', req.body);
  
  // Naye data se Product Model ka istemaal karke naya product banao
  const product = new Product(req.body);

  // Product ko database me save karo
  product.save()
    .then((result) => {
      console.log('Product database me save ho gaya:', result);
      // Client (Admin Panel) ko success message aur data wapas bhejo
      res.status(201).json(result); 
    })
    .catch((err) => {
      console.log('Error: Product save nahi hua:', err);
      res.status(400).json({ error: 'Failed to add product' });
    });
});


/**
 * (B) SAARE PRODUCTS LAANE KA ROUTE (Frontend yahaan se data lega)
 * Method: GET
 * URL: /api/products
 */
app.get('/api/products', (req, res) => {
  Product.find() // Database me se sab dhoondo
    .then((products) => {
      // Saare products client (frontend) ko bhej do
      res.status(200).json(products);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Could not fetch products' });
    });
});


/**
 * (C) EK SINGLE PRODUCT LAANE KA ROUTE (Detail Page ke liye)
 * Method: GET
 * URL: /api/products/ID... (jaise /api/products/60f8abc123...)
 */
app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  
  Product.findById(id)
    .then(product => {
      if (product) {
        // Agar product mila, toh client (detail.js) ko bhej do
        res.status(200).json(product);
      } else {
        // Agar uss ID ka product nahi mila
        res.status(404).json({ error: 'Product not found' });
      }
    })
    .catch(err => {
      // Agar ID galat format me hai (Database error)
      res.status(500).json({ error: 'Server error' });
    });
});