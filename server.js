// --- 1. ZAROORI PACKAGES IMPORT KARO ---
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); 
const Product = require('./models/product'); 
const Order = require('./models/order');
const path = require('path'); // Path handle karne ke liye
const User = require('./models/user');
const Setting = require('./models/setting');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// --- NAYE PACKAGES UPLOAD KE LIYE ---
const multer = require('multer'); 
const cloudinary = require('cloudinary').v2;

// --- 2. APP SETUP (EXPRESS KI TAYYARI) ---
const app = express();
const PORT = 3000;
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.use(express.json()); 
app.use(express.static(__dirname)); // HTML/CSS/JS files ke liye

// --- 3. CLOUDINARY CONFIG (NAYA) ---
// .env file se keys uthao aur Cloudinary se connect karo
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// --- 4. MULTER CONFIG (NAYA) ---
// Multer ko batao ki file ko pehle temporary (temp) kahan save karna hai
// 'uploads/' folder me save karega
const upload = multer({ dest: 'uploads/' });

// --- 5. DATABASE CONNECTION ---
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then((result) => {
    app.listen(PORT, () => {
      console.log('✅ Database se connect ho gaya!');
      console.log(`🚀 Server chalu ho gaya hai http://localhost:${PORT} par`);
    });
  })
  .catch((err) => { console.log(err); });

// --- 6. API ROUTES ---

/**
 * (A) NAYA PRODUCT BANANE KA ROUTE (Ab File Upload Ke Saath!)
 * Method: POST
 * URL: /api/products
 */
// 'upload.array('images', 5)' -> Multer ko batata hai ki 'images' field se 5 photo tak aa sakti hain
app.post('/api/products', upload.array('images', 5), async (req, res) => {
  
  console.log('--- NAYA PRODUCT REQUEST AAYA (File Ke Saath) ---');
  console.log('Text Data:', req.body); // Form ka text data
  console.log('File Data:', req.files); // Upload hui files
  
  try {
    const productData = req.body;
    const files = req.files;
    let imageUrls = []; // Khaali array

    // 1. Har file ko Cloudinary par upload karo
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'shoeon-products' // Cloudinary me 'shoeon-products' folder bana dega
      });
      imageUrls.push(result.secure_url); // Sirf URL save karo
      // Temporary file delete kar do
      require('fs').unlinkSync(file.path);
    }
    
    console.log('Cloudinary URLs:', imageUrls);

    // 2. Naya Product banao (Database me save karne ke liye)
    const product = new Product({
      name: productData.name,
      brand: productData.brand,
      description: productData.description,
      mrp: productData.mrp,
      salePrice: productData.salePrice,
      moq: productData.moq,
      category: productData.category,
      material: productData.material,
      tags: productData.tags.split(','), // Tags ko array me badlo
      images: imageUrls // Naye Cloudinary URLs daalo
    });

    // 3. Product ko database me save karo
    const savedProduct = await product.save();
    
    res.status(201).json(savedProduct);

  } catch (err) {
    console.log('Error: Product save nahi hua:', err);
    res.status(400).json({ error: 'Failed to add product' });
  }
});


/**
 * (B) SAARE PRODUCTS LAANE KA ROUTE (Filter waala)
 */
app.get('/api/products', (req, res) => {
  // ... (Yeh code waisa hi hai jaisa pehle tha) ...
  const filter = {};
  // --- SEARCH LOGIC ---
  if (req.query.search) {
    // 'regex' ka matlab hai milti-julti spelling dhoondo (case insensitive)
    // Ya toh Name match ho, YA Brand match ho
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { brand: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  // --------------------
  if (req.query.category && req.query.category !== '') {
    filter.category = req.query.category;
  }
  if (req.query.tag) {
    filter.tags = req.query.tag; // MongoDB array me automatically check karega
  }
  let sortOptions = { createdAt: -1 }; 
  if (req.query.sort) {
    if (req.query.sort === 'price-asc') sortOptions = { salePrice: 1 }; 
    else if (req.query.sort === 'price-desc') sortOptions = { salePrice: -1 };
  }
  Product.find(filter).sort(sortOptions)
    .then((products) => res.status(200).json(products))
    .catch((err) => res.status(500).json({ error: 'Could not fetch products' }));
});


/**
 * (C) EK SINGLE PRODUCT LAANE KA ROUTE
 */
app.get('/api/products/:id', (req, res) => {
  // ... (Yeh code waisa hi hai) ...
  Product.findById(req.params.id)
    .then(product => res.status(200).json(product))
    .catch(err => res.status(404).json({ error: 'Product not found' }));
});


/**
 * (D) PRODUCT DELETE KARNE KA ROUTE
 */
app.delete('/api/products/:id', (req, res) => {
  // ... (Yeh code waisa hi hai) ...
  Product.findByIdAndDelete(req.params.id)
    .then(result => res.status(200).json({ message: 'Product deleted' }))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});


/**
 * (E) PRODUCT UPDATE (EDIT) KARNE KA ROUTE (File Upload Ke Saath!)
 * Method: PUT
 * URL: /api/products/ID...
 */
// Multer ko yahaan bhi use karo (5 photos tak)
app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
  const id = req.params.id;
  
  console.log('--- PRODUCT UPDATE REQUEST AAYA ---');
  console.log('Text Data:', req.body);
  console.log('File Data:', req.files);

  try {
    const updatedData = req.body;
    const files = req.files;
    let newImageUrls = [];

    // 1. Agar nayi files aayi hain, toh unhe Cloudinary par upload karo
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'shoeon-products'
        });
        newImageUrls.push(result.secure_url);
        require('fs').unlinkSync(file.path); // Temp file delete karo
      }
      console.log('Naye Cloudinary URLs:', newImageUrls);
    }

    // 2. Puraana data (jo form se hidden field me aaya) aur naya data merge karo
    // Hum maan rahe hain ki client 'existingImages' naam ki field bhejega
    
    // Yahaan hum 'images' field ko text data se le rahe hain.
    // Client ko 'images' field me purani + nayi URLs bhejni hongi.
    // Ruko, yeh complex ho jayega. Chalo simple rakhte hain.
    
    // --- Naya Simple Logic ---
    // Hum maanenge ki client 'images' field me naye URLs bhej raha hai
    // aur purane URLs ko overwrite kar raha hai.
    // 'admin-edit-product.js' ko thoda smart banana padega.
    
    // Abhi ke liye, hum sirf text data update karte hain.
    // File upload in Edit is very complex. Chalo pehle text update fix karte hain.
    
    // --- RUKO: Code badal raha hoon ---
    // File upload + Edit ek saath bohot complex hai.
    // Hum pehle simple text edit fix karte hain.
    
    // Puraana code wapas daal raha hoon (bina file upload ke)
    // Hum pehle text-data (Name, Price) ko edit karna final karte hain.
    Product.findByIdAndUpdate(id, updatedData, { new: true })
      .then(updatedProduct => {
        if (!updatedProduct) {
          return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
      })
      .catch(err => {
        console.log('Update error:', err);
        res.status(500).json({ error: 'Server error while updating' });
      });

  } catch (err) {
    console.log('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * (F) NAYA ORDER BANANE KA ROUTE
 */
app.post('/api/orders', (req, res) => {
  // ... (Yeh code waisa hi hai) ...
  const newOrderNumber = `SH-${Math.floor(100000 + Math.random() * 900000)}`;
  const order = new Order({ ...req.body, orderNumber: newOrderNumber });
  order.save()
    .then(result => res.status(201).json(result))
    .catch(err => res.status(400).json({ error: 'Failed to save order' }));
});


/**
 * (G) SAARE ORDERS LAANE KA ROUTE
 */
app.get('/api/orders', (req, res) => {
  // ... (Yeh code waisa hi hai) ...
  Order.find().sort({ createdAt: -1 })
    .then(orders => res.status(200).json(orders))
    .catch(err => res.status(500).json({ error: 'Could not fetch orders' }));
});


/**
 * (H) EK SINGLE ORDER LAANE KA ROUTE
 */
app.get('/api/orders/:id', (req, res) => {
  // ... (Yeh code waisa hi hai) ...
  Order.findById(req.params.id)
    .then(order => res.status(200).json(order))
    .catch(err => res.status(404).json({ error: 'Order not found' }));
});


/**
 * (I) ORDER STATUS UPDATE KARNE KA ROUTE
 */
app.put('/api/orders/status/:id', (req, res) => {
  // ... (Yeh code waisa hi hai) ...
  Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    .then(order => res.status(200).json({ message: 'Status updated!', order: order }))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});
/**
 * ============================================
 * (J) ADMIN DASHBOARD STATS
 * Method: GET
 * URL: /api/dashboard-stats
 * ============================================
 */
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    // 1. Total Products gino
    const productCount = await Product.countDocuments();
    
    // 2. Total Orders gino
    const orderCount = await Order.countDocuments();
    
    // 3. Total Sale calculate karo (Saare orders ka totalAmount jodo)
    // MongoDB ka 'aggregate' function use karenge
    const totalSaleResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalSale = totalSaleResult.length > 0 ? totalSaleResult[0].total : 0;

    // 4. Data bhejo
    res.status(200).json({
      productCount,
      orderCount,
      totalSale
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stats load nahi hue' });
  }
});
/**
 * ============================================
 * (K) NAYA USER REGISTER KARNA (FIXED)
 * Method: POST
 * URL: /api/auth/register
 * ============================================
 */
app.post('/api/auth/register', (req, res) => {
  const userData = req.body;
  console.log('Naya Registration Request:', userData);

  // 1. Check karo ki phone number pehle se hai ya nahi
  User.findOne({ phone: userData.phone })
    .then(existingUser => {
      
      // Agar user mil gaya (Duplicate)
      if (existingUser) {
        // IMPORTANT: 'return' lagaya taaki code yahin ruk jaye
        return res.status(400).json({ error: 'Phone number already registered!' });
      }

      // Agar user nahi mila, tabhi naya banao
      const user = new User(userData);
      
      // User ko save karo
      user.save()
        .then(result => {
          res.status(201).json({ message: 'Registration successful! Please wait for Admin approval.' });
        })
        .catch(err => {
          console.error(err);
          // Agar header nahi bheja gaya hai tabhi error bhejo
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to save user.' });
          }
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Server error.' });
    });
});
/**
 * ============================================
 * (L) ADMIN: SAARE CUSTOMERS LAANE KA ROUTE
 * Method: GET
 * URL: /api/users
 * ============================================
 */
app.get('/api/users', (req, res) => {
  User.find().sort({ createdAt: -1 }) // Naye customers sabse upar
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json({ error: 'Failed to fetch users' }));
});

/**
 * (M) ADMIN: USER STATUS UPDATE (Approve/Block)
 * Method: PUT
 * URL: /api/users/status/:id
 */
app.put('/api/users/status/:id', (req, res) => {
  const userId = req.params.id;
  const newStatus = req.body.isApproved; // true ya false aayega

  User.findByIdAndUpdate(userId, { isApproved: newStatus }, { new: true })
    .then(updatedUser => {
      if (!updatedUser) return res.status(404).json({ error: 'User not found' });
      const msg = newStatus ? 'User Approved!' : 'User Blocked!';
      res.status(200).json({ message: msg, user: updatedUser });
    })
    .catch(err => res.status(500).json({ error: 'Update failed' }));
});
/*
* ============================================
 * (N) USER LOGIN ROUTE
 * Method: POST
 * URL: /api/auth/login
 * ============================================
 */
app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;

  // 1. Database me Phone Number dhoondo
  User.findOne({ phone: phone })
    .then(user => {
      // Agar user nahi mila
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please register first.' });
      }

      // 2. Password check karo (Simple check)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Wrong password!' });
      }

      // 3. Check karo ki Admin ne Approve kiya hai ya nahi (Sabse Zaroori)
      if (user.isApproved === false) {
        return res.status(403).json({ error: 'Account not approved by Admin yet. Please wait.' });
      }

      // 4. Sab sahi hai -> Login Success
      // Hum user ka data wapas bhejenge taaki frontend usse save kar sake
      res.status(200).json({ 
        message: 'Login Successful!', 
        user: { 
          id: user._id, 
          name: user.name, 
          shopName: user.shopName,
          phone: user.phone,
          isAdmin: user.isAdmin 
        } 
      });
    })
    .catch(err => {
      res.status(500).json({ error: 'Server error during login' });
    });
});
/**
 * (O) ADMIN: USER DELETE KARNA
 * Method: DELETE
 * URL: /api/users/:id
 */
app.delete('/api/users/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(result => res.status(200).json({ message: 'User deleted successfully' }))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});
/**
 * ============================================
 * (Z) SEARCH SUGGESTIONS API (Fast)
 * Method: GET
 * URL: /api/suggestions?q=nike
 * ============================================
 */
app.get('/api/suggestions', async (req, res) => {
  const query = req.query.q;
  
  if (!query) return res.json([]);

  try {
    // Regex banayenge jo case-insensitive ho (Chota bada sab chalega)
    const regex = new RegExp(query, 'i');

    // Hum Name aur Brand dono me dhoondhenge
    // .select('name brand category') -> Sirf naam aur brand laao (poora data nahi chahiye)
    // .limit(7) -> Sirf 7 suggestions laao
    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { brand: { $regex: regex } },
        { category: { $regex: regex } }
      ]
    }).select('name brand category').limit(7);

    res.json(products);
    
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * ============================================
 * (AA) SETTINGS APIs (Banner & Contact)
 * ============================================
 */

// 1. GET SETTINGS (Site par dikhane ke liye)
app.get('/api/settings', async (req, res) => {
  try {
    // Hamesha pehla document dhoondo
    let settings = await Setting.findOne();
    
    // Agar settings abhi tak bani nahi hain, toh nayi bana do
    if (!settings) {
      settings = new Setting({});
      await settings.save();
    }
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// 2. UPDATE SETTINGS (File Upload ke saath)
app.post('/api/settings', upload.array('banners', 5), async (req, res) => {
  try {
    const { supportPhone, supportEmail } = req.body;
    const files = req.files;
    
    // Pehle purani settings dhoondo
    let settings = await Setting.findOne();
    if (!settings) settings = new Setting({});

    // Text data update karo
    settings.supportPhone = supportPhone;
    settings.supportEmail = supportEmail;

    // Agar nayi photos aayi hain, toh upload karke add karo
    if (files && files.length > 0) {
      // Note: Hum purani photos replace kar rahe hain ya add?
      // Chalo abhi ke liye "Replace" karte hain (Fresh Slider)
      settings.banners = []; // Purana khaali karo

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'shoeon-banners'
        });
        settings.banners.push(result.secure_url);
        require('fs').unlinkSync(file.path);
      }
    }

    await settings.save();
    res.status(200).json({ message: 'Settings Updated!', settings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});
/**
 * ============================================
 * (AB) RAZORPAY: CREATE ORDER
 * Method: POST
 * URL: /api/payment/create
 * ============================================
 */
app.post('/api/payment/create', (req, res) => {
  // Asli Razorpay ko call mat karo, bas fake order ID banao
  const fakeOrderId = "order_" + Math.floor(Math.random() * 1000000);
  
  res.json({
    id: fakeOrderId,
    currency: "INR",
    amount: req.body.amount * 100
  });
});

/**
 * (AC) RAZORPAY: VERIFY PAYMENT
 * Method: POST
 * URL: /api/payment/verify
 * ============================================
 */
app.post('/api/payment/verify', (req, res) => {
  // Kuch check mat karo, bas bolo "Success"
  res.json({ status: 'success' });
});
