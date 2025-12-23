// --- 1. ZAROORI PACKAGES IMPORT KARO ---
const express = require('express');
app.set('trust proxy', 1);
const mongoose = require('mongoose');
require('dotenv').config(); 
const Product = require('./models/product'); 
const Order = require('./models/order');
const User = require('./models/user');
const Setting = require('./models/setting');
const multer = require('multer'); // UPLOAD ke liye
const cloudinary = require('cloudinary').v2; // UPLOAD ke liye
const jwt = require('jsonwebtoken');


const JWT_SECRET = 'shoeon_secret_key_123';

const rateLimit = require('express-rate-limit'); 

// Rule: 15 minute mein maximum 100 orders allow karo ek IP se
const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 100 requests per windowMs
    message: console.log("Too many orders from this IP, please try again later.")
});



const authMiddleware = (req, res, next) => {
    // 1. Header se token uthao
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access Denied: Login karo pehle!' });
    }

    try {
        // 2. Token verify karo
        const verified = jwt.verify(token, 'shoeon_secret_key_123');
        req.user = verified; // Token se nikli user ID req.user mein daal di
        next(); // 3. Sab sahi hai, ab aage jao final route par
    } catch (err) {
        res.status(400).json({ error: 'Token valid nahi hai!' });
    }
};

// --- 2. APP SETUP & MIDDLEWARE ---
const app = express();
const PORT = 3000;

app.use(express.json()); 
app.use(express.static(__dirname)); 

// --- 3. CLOUDINARY CONFIG (File Upload) ---
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// --- 4. MULTER CONFIG ---
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
  .catch((err) => { console.log('❌ Database connection fail!'); console.log(err); });

// --- 6. API ROUTES (FINAL) ---

// (A) NAYA PRODUCT BANANE KA ROUTE (File Upload Ke Saath!)
app.post('/api/products', upload.array('images', 5), async (req, res) => {
    try {
        const productData = req.body;
        const files = req.files;
        let imageUrls = [];

        // --- 1. MAGIC UPLOAD LOGIC (Yahan Compression Hoga) ---
        if (files && files.length > 0) {
            for (const file of files) {
                
                // Cloudinary ko bol rahe hain: "Bhai compress karke save kar"
                const result = await cloudinary.uploader.upload(file.path, { 
                    folder: 'shoeon-products',
                    
                    // --- YE HAI WO JADUI SETTING ---
                    transformation: [
                        { width: 1000, crop: "limit" },  // Image ko 1000px se bada mat hone do
                        { quality: "auto" },             // Quality maintain karte hue size kam karo
                        { fetch_format: "auto" }         // WebP format use karo (Fastest loading)
                    ]
                    // -----------------------------
                });

                imageUrls.push(result.secure_url);

                // Server se original heavy file delete kar do
                try {
                    require('fs').unlinkSync(file.path);
                } catch(e) { console.log("File delete error:", e); }
            }
        }
        
        // 2. Product Save Logic (Stock wagera sab same rahega)
        const product = new Product({
            name: productData.name,
            brand: productData.brand,
            description: productData.description,
            mrp: productData.mrp,
            salePrice: productData.salePrice,
            comparePrice: productData.comparePrice,
            
            moq: productData.moq,
            stock: productData.stock, // Stock save ho raha hai

            isLoose: productData.isLoose, 
            category: productData.category,
            material: productData.material,
            
            sole: productData.sole,
            closure: productData.closure,
            origin: productData.origin,
            
            sizes: productData.sizes ? productData.sizes.split(',') : [], 
            tags: productData.tags ? productData.tags.split(',') : [], 
            images: imageUrls 
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);

    } catch (err) {
        console.log('Error saving product:', err);
        res.status(400).json({ error: 'Failed to add product' });
    }
});


/**
 * (B) SAARE PRODUCTS LAANE KA ROUTE (Upgraded with all Filters!)
 * Method: GET
 * URL: /api/products?sort=price-asc&material=Leather
 */
app.get('/api/products', async (req, res) => {
    
    const filter = {};
    let searchRegex; 

    try { 
        
        // --- 1. Search Logic ---
        if (req.query.search) {
            searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { name: { $regex: searchRegex } },
                { brand: { $regex: searchRegex } },
                { category: { $regex: searchRegex } } 
            ];
        }

        // --- 2. Category Filter ---
        if (req.query.category && req.query.category !== '') {
            filter.category = req.query.category;
        }

        // --- 3. Loose Product Filter ---
        if (req.query.isLoose === 'true') {
            filter.isLoose = true;
        }

        // --- 4. Material Filter ---
        if (req.query.material) {
            filter.material = { $in: req.query.material.split(',') };
        }

        // --- 5. Tag Filter ---
        if (req.query.tag) {
            filter.tags = req.query.tag;
        }

        // =========================================================
        // --- 6. NEW: Price Range Filter (Min & Max) ---
        // =========================================================
        if (req.query.minPrice || req.query.maxPrice) {
            filter.salePrice = {}; // Hum 'salePrice' (Your Rate) par filter lagayenge

            if (req.query.minPrice) {
                // $gte matlab "Greater Than or Equal" (Isse bada ya barabar)
                filter.salePrice.$gte = Number(req.query.minPrice);
            }
            
            if (req.query.maxPrice) {
                // $lte matlab "Less Than or Equal" (Isse chhota ya barabar)
                filter.salePrice.$lte = Number(req.query.maxPrice);
            }
        }
        // =========================================================

        // --- 7. Sort Logic (Already Correct: Uses salePrice) ---
        let sortOptions = { createdAt: -1 }; 
        
        if (req.query.sort) {
            if (req.query.sort === 'price-asc') {
                sortOptions = { salePrice: 1 }; // Low to High (Your Rate)
            } else if (req.query.sort === 'price-desc') {
                sortOptions = { salePrice: -1 }; // High to Low (Your Rate)
            }
        }

        // --- 8. Execute Database Query ---
        const products = await Product.find(filter).sort(sortOptions); 

        res.status(200).json(products);
        
    } catch (err) { 
        console.error("CRITICAL SERVER ERROR IN /API/PRODUCTS:", err);
        res.status(500).json({ error: 'Could not fetch products' });
    }
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
app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
  const id = req.params.id;
  
  try {
    const updatedData = req.body;
    const files = req.files;
    let newImageUrls = [];
    
    // 1. File Upload Logic (Same)
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'shoeon-products' });
        newImageUrls.push(result.secure_url);
        require('fs').unlinkSync(file.path);
      }
      updatedData.images = newImageUrls; 
    } else {
      // Purani images retain karo
      if (updatedData.existingImages) {
        updatedData.images = updatedData.existingImages.split(',').filter(url => url !== '');
      } else {
        updatedData.images = [];
      }
    }

    // 2. Data Update karne ke liye Model Dhoondo
    // Naye fields ko Mongoose me update karo
    const update = {
        name: updatedData.name,
        brand: updatedData.brand,
        description: updatedData.description,
        mrp: updatedData.mrp,
        salePrice: updatedData.salePrice,
        comparePrice: updatedData.comparePrice,
        moq: updatedData.moq,
        stock: updatedData.stock,
        category: updatedData.category,
        material: updatedData.material,
        
        // --- NAYE TECHNICAL SPECS FIELDS (CRITICAL) ---
        sole: updatedData.sole,
        closure: updatedData.closure,
        origin: updatedData.origin,
        // ----------------------------------------------
        
        tags: updatedData.tags.split(','),
        images: updatedData.images 
    };

    // 3. Product ko ID se dhoondo aur naye data se update karo
    const updatedProduct = await Product.findByIdAndUpdate(id, update, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });

  } catch (err) {
    console.log('Update error:', err);
    res.status(400).json({ error: 'Failed to update product due to data validation.' });
  }
});



/**
 * (I) ORDER STATUS UPDATE KARNE KA ROUTE
 */
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        // Database mein status update karo
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(updatedOrder);
    } catch (err) {
        console.error("Status Update Error:", err);
        res.status(500).json({ error: "Failed to update status" });
    }
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
        // 1. Saare Orders nikalo
        const orders = await Order.find();
        
        // 2. Total Products count karo
        const productCount = await Product.countDocuments();
        
        // 3. Total Sale calculate karo
        // (Har order ka 'totalAmount' jodte jao)
        const totalSale = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        
        // 4. Data bhejo
        res.json({
            totalSale: totalSale,
            orderCount: orders.length,
            productCount: productCount
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
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
 * (M) ADMIN: USER STATUS UPDATE (Approve/Block)
 * Method: PUT
 * URL: /api/users/status/:id
 */
app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body; // Ismein { isApproved: true/false } aata hai
        
        // Ensure only allowed fields are updated (safety check)
        const updateFields = {};
        if (updates.isApproved !== undefined) {
            updateFields.isApproved = updates.isApproved;
        }
        // Agar aap creditLimit, shopName bhi update karte hain toh woh bhi yahan aayega

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { $set: updateFields },
            { new: true } // Updated document wapas chahiye
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ 
            message: 'User status successfully updated!',
            user: updatedUser 
        });

    } catch (err) {
        console.error("Error updating user status:", err);
        res.status(500).json({ error: 'Server error updating user status.' });
    }
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

  User.findOne({ phone: phone })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please register.' });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: 'Wrong password!' });
      }

      if (user.isApproved === false) {
        return res.status(403).json({ error: 'Account not approved yet.' });
      }

      // ✅ STEP 4: Token Generate Karna
      // 'mySecretKey' ki jagah koi strong secret use karein
      const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin }, 
    JWT_SECRET, // <--- Wahi variable jo upar define kiya
    { expiresIn: '7d' }
);

      // ✅ STEP 5: Token ko Response me bhejna
      res.status(200).json({ 
        message: 'Login Successful!', 
        token: token, // <--- YE BHEJNA ZAROORI HAI
        user: { 
          id: user._id, 
          name: user.name, 
          phone: user.phone,
          isAdmin: user.isAdmin 
        } 
      });
    })
    .catch(err => {
      console.error(err);
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
    const files = req.files;
    
    // Pehle purani settings dhoondo
    let settings = await Setting.findOne();
    if (!settings) settings = new Setting({});


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

/**
 * ============================================
 * (AD) GET Single User (Customer Edit Page ke liye)
 * Method: GET
 * URL: /api/users/:id
 * ============================================
 */
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user details' });
  }
});

// /**
//  * ============================================
//  * (AE) UPDATE Customer Details & Credit Terms
//  * Method: PUT
//  * URL: /api/users/:id
//  * ============================================
//  */
// app.put('/api/users/:id', async (req, res) => {
//   try {
//     // Ye new customer details aur credit terms honge
//     const update = req.body;
    
//     const updatedUser = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    
//     if (!updatedUser) return res.status(404).json({ error: 'User not found for update' });
    
//     res.status(200).json({ message: 'Customer details updated!', user: updatedUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Update failed' });
//   }
// });

/**
 * ============================================
 * (AF) USER PROFILE DATA
 * URL: /api/user/profile/:id
 * ============================================
 */
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    // 💡 req.params.id ki jagah req.user.id use karein
    const user = await User.findById(req.user.id).select('-password'); 
    
    if (!user) {
        return res.status(404).json({ error: 'User not found in database' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profile load nahi ho saki' });
  }
});

/**
 * ============================================
 * (AG) USER ORDERS DATA - FIX
 * URL: /api/user/my-orders/:userPhone
 * ============================================
 */
app.get('/api/user/my-orders/:userPhone', async (req, res) => {
    try {
        // FIX: userPhone se orders dhoondo, jaisa humne frontend me set kiya hai
        const orders = await Order.find({ customerPhone: req.params.userPhone }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Orders load error:", err);
        res.status(500).json({ error: 'Orders load nahi ho sake' });
    }
});


/**
 * ============================================
 * (AF) Invoice Order Save Route - CRITICAL FIX
 * Method: POST
 * URL: /api/orders
 * ============================================
 */

app.post('/api/orders', orderLimiter, async (req, res) => {
  console.log("Order from IP:", req.ip);
    try {
        const orderNumber = Math.floor(100000 + Math.random() * 900000); 
        
        // Items ensure kar rahe hain
        const itemsToSave = Array.isArray(req.body.orderItems) ? req.body.orderItems : [];

        const orderData = {
            ...req.body, 
            orderNumber: orderNumber,
            totalAmount: parseFloat(req.body.totalAmount) || 0,
            orderItems: itemsToSave, 
        };

        // 1. Order Save Karo
        const newOrder = new Order(orderData); 
        const savedOrder = await newOrder.save();
        
        // ====================================================
        // --- 2. STOCK UPDATE LOGIC (YEH NAYA ADD KIYA HAI) ---
        // ====================================================
        if (itemsToSave && itemsToSave.length > 0) {
            for (const item of itemsToSave) {
                // Hum database ko bol rahe hain: "Is Product ka stock 'quantity' jitna kam kar do"
                await Product.findByIdAndUpdate(
                    item.productId, 
                    { $inc: { stock: -item.quantity } } 
                );
            }
        }
        // ====================================================

        // 3. Order ko dobara fetch karke poora data lein
        const finalOrderWithDetails = await Order.findById(savedOrder._id); 

        // Success response
        res.status(201).json({ 
            message: 'Order placed successfully!', 
            order: finalOrderWithDetails 
        });

    } catch (err) {
        console.error("ORDER SAVE FAILED IN SERVER:", err);
        res.status(500).json({ error: 'Internal Server Error. Database or connection issue.' });
    }
});

// ==========================================
// GET ORDER COUNTS (STATS)
// ==========================================
app.get('/api/orders/stats', async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        const formattedStats = {
            All: 0,
            Pending: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        let totalOrders = 0;

        stats.forEach(item => {
            if (item._id) {
                // --- MAGIC FIX: Status ka pehla letter Bada karo, baaki chota ---
                // Example: "pending" -> "Pending", "SHIPPED" -> "Shipped"
                const statusKey = item._id.charAt(0).toUpperCase() + item._id.slice(1).toLowerCase();
                
                // Agar ye status hamari list me hai, to count add karo
                if (formattedStats[statusKey] !== undefined) {
                    formattedStats[statusKey] += item.count;
                }
                
                // Total me sab jodte jao
                totalOrders += item.count;
            }
        });

        formattedStats.All = totalOrders;
        
        res.json(formattedStats);
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

/**
 *  EK SINGLE ORDER LAANE KA ROUTE
 */
app.get('/api/orders/:id', (req, res) => {
  // ... (Yeh code waisa hi hai) ...
  Order.findById(req.params.id)
    .then(order => res.status(200).json(order))
    .catch(err => res.status(404).json({ error: 'Order not found' }));
});

app.get('/api/orders', async (req, res) => {
    try {
        // 1. Yahan 'status' ko bhi read karna zaroori hai (Pehle ye missing tha)
        const { search, page, limit, status } = req.query; 

        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 20;
        const skip = (pageNumber - 1) * pageSize;

        let query = {}; 

        // --- 2. FILTER LOGIC (YE ADD KARNA HAI) ---
        // Agar status aa raha hai aur wo 'All' nahi hai, to filter lagao
        if (status && status !== 'All') {
             // Case-insensitive match (Matlab 'shipped', 'Shipped', 'SHIPPED' sab chalega)
            query.status = new RegExp(`^${status}$`, 'i');
        }
        // ------------------------------------------

        // 3. Search Logic
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            // Search karte waqt hum status filter ko bhi dhyan me rakhenge
            // $and use karke ensure karenge ki Search + Status dono match ho
            const searchConditions = [
                { orderNumber: { $regex: searchRegex } }, 
                { customerName: { $regex: searchRegex } },
                { customerPhone: { $regex: searchRegex } }
            ];

            if (query.status) {
                // Agar status filter laga hai, to status wahi rehna chahiye
                query = { 
                    status: query.status,
                    $or: searchConditions
                };
            } else {
                // Agar status 'All' hai, to bas search karo
                query.$or = searchConditions;
            }
        }
        
        // 4. Data Fetching
        const orders = await Order.find(query)
            .select('orderNumber customerName customerPhone totalAmount status createdAt') 
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        // 5. Total Count (Pagination ke liye)
        const totalOrders = await Order.countDocuments(query);

        res.status(200).json({
            orders,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalOrders / pageSize),
            totalOrders
        });

    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ------------------------------------------------------------



/**
 * ============================================
 * (AH) Order Details Route - Safest Search Logic
 * URL: /api/orders/details/:orderNo
 * ============================================
 */
app.get('/api/orders/details/:orderNo', async (req, res) => {
    try {
        let rawOrderNo = req.params.orderNo;
        
        // Prefix hata kar sirf number nikaalo (Frontend se aa raha hai)
        let cleanedOrderNo = rawOrderNo.replace('SH-', '').replace('#SHO-', '').trim();
        
        // Safest MongoDB Query: String aur Number dono se search karo
        const query = { 
            orderNumber: { $in: [cleanedOrderNo, parseInt(cleanedOrderNo)] } 
        };

        const order = await Order.findOne(query);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found in database.' });
        }
        
        res.json({ order });
    } catch (err) {
        console.error("Database fetch error:", err);
        res.status(500).json({ error: 'Server error fetching order details' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const { search } = req.query; 
                
        let query = {}; 

        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            
            query = {
                $or: [
                    { name: { $regex: searchRegex } },        
                    { phone: { $regex: searchRegex } },       
                    { shopName: { $regex: searchRegex } },    
                    { shopAddress: { $regex: searchRegex } }, 
                ]
            };
            
        }
        
        const users = await User.find(query).sort({ createdAt: -1 }); 
        
        res.status(200).json(users); 
        
    } catch (err) {
        console.error("Error fetching users from DB:", err);
        res.status(500).json({ error: 'Failed to fetch users' }); 
    }
});


// /**
//  * ============================================
//  * (TEMP) RESET ALL ORDERS
//  * WARNING: Isse saare orders delete ho jayenge!
//  * URL: /api/reset-orders
//  * ============================================
//  */
// app.get('/api/reset-orders', async (req, res) => {
//   try {
//     // Saare orders delete karo
//     await Order.deleteMany({});
    
//     res.send('<h1>Reset Successful!</h1><p>All orders have been deleted. Dashboard is now 0.</p>');
//   } catch (err) {
//     res.send('Error resetting orders.');
//   }
// });

