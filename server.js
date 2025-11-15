// --- 1. ZAROORI PACKAGES IMPORT KARO ---
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Yeh line .env file ko load karti hai
const Product = require('./models/product'); // Hamara Product blueprint (Schema)
const Order = require('./models/order');

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
 * (B) SAARE PRODUCTS LAANE KA ROUTE (Upgraded with Filters!)
 * Method: GET
 * URL: /api/products?sort=price-asc&material=Leather
 */
app.get('/api/products', (req, res) => {
  
  // --- 1. Filter Logic ---
  // Pehle ek khaali filter object banao
  const filter = {};
  
  // Check karo ki URL me category hai (jaise products.html se aati hai)
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  // Check karo ki URL me material hai (jo filter menu se aayega)
  if (req.query.material) {
    // Agar material "Leather,Canvas" hai toh usse array me badlo
    filter.material = { $in: req.query.material.split(',') };
  }
  
  // --- 2. Sort Logic ---
  // Pehle ek default sort object banao (naye product pehle)
  let sortOptions = { createdAt: -1 }; 
  
  // Check karo ki URL me sort request hai
  if (req.query.sort) {
    if (req.query.sort === 'price-asc') {
      sortOptions = { salePrice: 1 }; // 1 matlab Low to High
    } else if (req.query.sort === 'price-desc') {
      sortOptions = { salePrice: -1 }; // -1 matlab High to Low
    }
  }

  // --- 3. Database Query ---
  console.log("Filtering with:", filter, "Sorting by:", sortOptions);

  Product.find(filter) // Filter object ko yahaan daalo
    .sort(sortOptions) // Sort object ko yahaan daalo
    .then((products) => {
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

//  (D) EK PRODUCT KO DELETE KARNE KA ROUTE
//  Method: DELETE
//   URL: /api/products/ID...
 
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id; // URL se ID nikalo
  
  // Database me se uss ID ko dhoondo aur delete karo
  Product.findByIdAndDelete(id)
    .then(result => {
      if (result) {
        // Agar delete hua, toh success message bhejo
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        // Agar uss ID ka product nahi mila
        res.status(404).json({ error: 'Product not found' });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Server error while deleting' });
    });
});

//  (E) EK PRODUCT KO UPDATE (EDIT) KARNE KA ROUTE
//   Method: PUT (PUT matlab 'poora replace karo')
//   URL: /api/products/ID...
 
app.put('/api/products/:id', (req, res) => {
  const id = req.params.id; // URL se ID nikalo
  const updatedData = req.body; // Form se naya data nikalo
  
  // Database me uss ID ko dhoondo aur naye data se update karo
  // { new: true } bolta hai ki "update karne ke baad naya wala data wapas bhejo"
  Product.findByIdAndUpdate(id, updatedData, { new: true })
    .then(updatedProduct => {
      if (updatedProduct) {
        // Agar update hua, toh success message aur naya product bhejo
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
      } else {
        // Agar uss ID ka product nahi mila
        res.status(404).json({ error: 'Product not found' });
      }
    })
    .catch(err => {
      console.log('Update error:', err);
      res.status(500).json({ error: 'Server error while updating' });
    });
});

/**
 * ============================================
 * (F) NAYA ORDER BANANE KA ROUTE (FIXED with Order Number)
 * Method: POST
 * URL: /api/orders
 * ============================================
 */
app.post('/api/orders', (req, res) => {
  const orderData = req.body;
  console.log('Naya Order request aaya hai:', orderData);
  
  // 1. NAYA: Ek simple Order Number generate karo
  // Example: "SH-" + 6 random digits
  const newOrderNumber = `SH-${Math.floor(100000 + Math.random() * 900000)}`;

  // 2. Naye data se naya Order banao
  const order = new Order({
    ...orderData, // Customer ka saara data
    orderNumber: newOrderNumber // Hamara naya Order Number
  });
  
  // 3. Order ko database me save karo
  order.save()
    .then(result => {
      console.log('Order database me save ho gaya:', result);
      // Client (checkout.js) ko success message aur naya data bhejo
      res.status(201).json(result); 
    })
    .catch(err => {
      console.log('Error: Order save nahi hua:', err);
      // Agar 'duplicate key' error aaye (matlab number pehle se tha),
      // toh client ko batao ki "fir se try karo"
      if (err.code === 11000) {
        return res.status(500).json({ error: 'Failed to generate unique Order ID, please try again.' });
      }
      res.status(400).json({ error: 'Failed to save order' });
    });
});

/**
 * ============================================
 * (G) ADMIN: SAARE ORDERS LAANE KA ROUTE
 * Method: GET
 * URL: /api/orders
 * ============================================
 */
app.get('/api/orders', (req, res) => {
  // Database me se saare orders dhoondo
  // .sort({ createdAt: -1 }) ka matlab hai naye order sabse upar dikhao
  Order.find().sort({ createdAt: -1 }) 
    .then(orders => {
      // Saare orders client (admin-orders.js) ko bhej do
      res.status(200).json(orders);
    })
    .catch(err => {
      res.status(500).json({ error: 'Could not fetch orders' });
    });
});
/**
 * ============================================
 * (H) ADMIN: EK SINGLE ORDER LAANE KA ROUTE
 * Method: GET
 * URL: /api/orders/ID...
 * ============================================
 */
app.get('/api/orders/:id', (req, res) => {
  const id = req.params.id; // URL se ID nikalo
  
  // Database me se uss ID ko dhoondo
  Order.findById(id)
    .then(order => {
      if (order) {
        // Agar order mila, toh client (admin-order-detail.js) ko bhej do
        res.status(200).json(order);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Server error' });
    });
});
/**
 * ============================================
 * (I) ADMIN: ORDER KA STATUS UPDATE KARNA
 * Method: PUT
 * URL: /api/orders/status/:id
 * ============================================
 */
app.put('/api/orders/status/:id', (req, res) => {
  const orderId = req.params.id; // URL se ID nikalo
  const newStatus = req.body.status; // Naya status (e.g., "Shipped") nikalo

  if (!newStatus) {
    return res.status(400).json({ error: 'Naya status zaroori hai' });
  }

  // Database me ID dhoondo aur 'status' field ko update karo
  Order.findByIdAndUpdate(
    orderId, 
    { status: newStatus }, // Sirf status ko update karo
    { new: true } // Taaki update hone ke baad naya data wapas mile
  )
    .then(updatedOrder => {
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(200).json({ message: 'Status updated!', order: updatedOrder });
    })
    .catch(err => {
      res.status(500).json({ error: 'Server error' });
    });
});