// --- 1. ZAROORI PACKAGES IMPORT KARO ---
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); 
const Product = require('./models/product'); 
const Order = require('./models/order');
const User = require('./models/user');
const Setting = require('./models/setting');
const multer = require('multer'); // UPLOAD ke liye
const cloudinary = require('cloudinary').v2; // UPLOAD ke liye
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs'); // Password hash karne ke liye (Zaroori hai)
const Highlight = require('./models/Highlight');


const JWT_SECRET = 'shoeon_secret_key_123';

const rateLimit = require('express-rate-limit'); 

// Rule: 15 minute mein maximum 100 orders allow karo ek IP se
const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 100 requests per windowMs
    message: console.log("Too many orders from this IP, please try again later.")
});

// Ye function Cloudinary URL ke andar 'magic code' ghusa dega
function optimizeImage(url) {
    if (!url) return "";
    // Agar URL mein 'upload' shabd hai, toh uske baad optimization settings laga do
    if (url.includes("/upload/")) {
        return url.replace("/upload/", "/upload/w_600,f_auto,q_auto/");
    }
    return url;
}

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

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.use(express.static(__dirname));

// --- 3. CLOUDINARY CONFIG (File Upload) ---
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

app.use((req, res, next) => {
  console.log(`Request Aayi: ${req.method} ${req.url}`);
  next();
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

// --- HIGHLIGHTS API ---

// 1. Get All Highlights
app.get('/api/highlights', async (req, res) => {
    try {
        const highlights = await Highlight.find().sort({ createdAt: -1 });
        res.json(highlights);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching highlights" });
    }
});

// 2. Upload Multiple Highlights (Image OR Video)
app.post('/api/highlights', upload.array('mediaFiles', 10), async (req, res) => { // 🔥 Array of 10
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        const uploadedItems = [];

        // Loop through all files
        for (const file of req.files) {
            const isVideo = file.mimetype.startsWith('video');
            const resourceType = isVideo ? 'video' : 'image';

            // Cloudinary Upload
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'shoeon-highlights',
                resource_type: resourceType
            });

            // Save to DB
            const newHighlight = new Highlight({
                type: resourceType,
                url: result.secure_url,
                title: req.body.title || "" // Ek hi title sab par lagega (optional)
            });

            await newHighlight.save();
            uploadedItems.push(newHighlight);

            // Cleanup local file
            try { require('fs').unlinkSync(file.path); } catch(e) {}
        }

        res.json({ message: "Upload Successful", items: uploadedItems });

    } catch (err) {
        console.error("Highlight Upload Error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

// 3. Delete Highlight
app.delete('/api/highlights/:id', async (req, res) => {
    try {
        await Highlight.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// (A) NAYA PRODUCT BANANE KA ROUTE (File Upload Ke Saath!)
app.post('/api/products', upload.array('images', 5), async (req, res) => {
    try {
        const productData = req.body;
        const files = req.files;
        let imageUrls = [];

        // 1. Image Upload Logic (Ye same rahega)
        if (files && files.length > 0) {
            for (const file of files) {
                const result = await cloudinary.uploader.upload(file.path, { 
                    folder: 'shoeon-products',
                    transformation: [
                        { width: 1000, crop: "limit" }, 
                        { quality: "auto" },            
                        { fetch_format: "auto" }        
                    ]
                });
                imageUrls.push(result.secure_url);
                try { require('fs').unlinkSync(file.path); } catch(e) {}
            }
        }
        
        // 2. Product Save Logic
        const product = new Product({
            name: productData.name,
            brand: productData.brand,
            description: productData.description,
            mrp: productData.mrp,
            salePrice: productData.salePrice,
            offlinePrice: productData.offlinePrice, 

            comparePrice: productData.comparePrice,
            moq: productData.moq,
            stock: productData.stock,
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
            const catQuery = req.query.category;
            const flexiblePattern = catQuery.replace(/[- ]/g, '[- ]');
            filter.category = { $regex: new RegExp(`^${flexiblePattern}`, 'i') };
        }

        // --- 3. Material Filter ---
        if (req.query.material) {
            filter.material = { $in: req.query.material.split(',') };
        }

        // --- 4. Tag Filter ---
        if (req.query.tag) filter.tags = req.query.tag;

        // --- 5. Price Range Filter ---
        if (req.query.minPrice || req.query.maxPrice) {
            filter.salePrice = {}; 
            if (req.query.minPrice) filter.salePrice.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.salePrice.$lte = Number(req.query.maxPrice);
        }
        
        // --- 6. Sort Logic ---
        let sortOptions = { createdAt: -1 }; 
        if (req.query.sort) {
            if (req.query.sort === 'price-asc') sortOptions = { salePrice: 1 };
            else if (req.query.sort === 'price-desc') sortOptions = { salePrice: -1 };
        }

        // --- 7. PAGINATION LOGIC (NEW) ---
        // Agar 'page' query param aaya hai, tabhi pagination lagao
        if (req.query.page) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20; // Default 20 products
            const skip = (page - 1) * limit;

            const products = await Product.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);
            
            const totalProducts = await Product.countDocuments(filter);

            // Admin ko Object return karo (Orders jaisa)
            return res.status(200).json({
                products,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts
            });
        }

        // Agar 'page' nahi hai (Customer Side), to Saare bhejo (Array format me)
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
    // 1. Sabse pehle Data Receive karo
    const updatedData = req.body; 
    const files = req.files;
    let newImageUrls = [];
    
    // 2. Image Upload Logic (Agar nayi images aayi hain)
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'shoeon-products' });
        newImageUrls.push(result.secure_url);
        try { require('fs').unlinkSync(file.path); } catch(e) {}
      }
      updatedData.images = newImageUrls; 
    } else {
      // Agar nayi images nahi hain to purani retain karo
      if (updatedData.existingImages) {
        updatedData.images = updatedData.existingImages.split(',').filter(url => url !== '');
      } else {
        updatedData.images = [];
      }
    }

    // 3. Update Object Banao (Database ke liye)
    const update = {
        name: updatedData.name,
        brand: updatedData.brand,
        description: updatedData.description,
        mrp: updatedData.mrp,
        salePrice: updatedData.salePrice,
        offlinePrice: updatedData.offlinePrice, // Yahan data jod diya
        comparePrice: updatedData.comparePrice,
        moq: updatedData.moq,
        stock: updatedData.stock,
        category: updatedData.category,
        material: updatedData.material,
        sole: updatedData.sole,
        closure: updatedData.closure,
        origin: updatedData.origin,
        isLoose: updatedData.isLoose,
        
        // Tags array handle karo
        tags: updatedData.tags ? (Array.isArray(updatedData.tags) ? updatedData.tags : updatedData.tags.split(',')) : [],
        
        // Images update karo agar hain to
        ...(updatedData.images && updatedData.images.length > 0 && { images: updatedData.images }) 
    };

    // 4. Database me Update karo
    const updatedProduct = await Product.findByIdAndUpdate(id, update, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });

  } catch (err) {
    console.log('Update error:', err);
    res.status(400).json({ error: 'Failed to update product.' });
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
app.post('/api/auth/register', async (req, res) => {
  try {
    // 👇 Email bhi receive karo
    const { name, email, phone, password, shopName, shopAddress, gstNumber } = req.body;

    // Check karo Email ya Phone pehle se to nahi hai?
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: "Email or Phone already exists" });
    }

    // Naya user banao
    const newUser = new User({
      name,
      email, // 👈 Save Email
      phone,
      password, // (Note: Password hash karna mat bhoolna agar nahi kiya hai to)
      shopName,
      shopAddress,
      gstNumber
    });

    await newUser.save();
    res.json({ message: "Registration Successful" });

  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

/*
* ============================================
 * (N) USER LOGIN ROUTE
 * Method: POST
 * URL: /api/auth/login
 * ============================================
 */
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
      const user = await User.findOne({ phone: phone });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please register.' });
      }

      let isMatch = false;
        // Password Check Logic (Old + Bcrypt)
        if (user.password === req.body.password) {
            isMatch = true;
        } else {
            try {
                if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
                    isMatch = await bcrypt.compare(req.body.password, user.password);
                }
            } catch (err) { isMatch = false; }
        }

        if (!isMatch) return res.status(401).json({ message: 'Invalid Credentials' });
        if (user.isApproved === false) return res.status(403).json({ error: 'Account not approved yet.' });

      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

      // ✅ RESPONSE MEIN COMMA LAGA DIYA HAI
      res.status(200).json({ 
        message: 'Login Successful!', 
        token: token, 
        user: { 
          id: user._id, 
          name: user.name, 
          phone: user.phone,
         isOfflineCustomer: user.isOfflineCustomer,
          isCashAllowed: user.isCashAllowed, 
          advancePercent: user.advancePercent || 20, 
          shopName: user.shopName,
          shopAddress: user.shopAddress
        } 
      });

  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during login' });
  }
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

// 0. MODEL DEFINITION (Agar alag file me nahi hai to yahi bana lo)
const siteSettingsSchema = new mongoose.Schema({
    banners: { type: [String], default: [] }, 
    supportEmail: { type: String, default: "support@shoeon.com" },
    supportPhone: { type: String, default: "+91 98765 43210" }
});
const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);


// 1. GET SETTINGS
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings({});
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        console.error("Settings Load Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});


// 2. UPLOAD BANNERS (CLOUDINARY LOGIC)
app.post('/api/settings', upload.array('banners', 10), async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) settings = new SiteSettings({});

        // Limit Check
        const currentCount = settings.banners.length;
        const newFilesCount = req.files.length;
        if (currentCount + newFilesCount > 10) {
            return res.status(400).json({ 
                error: `Limit reached! Max 10 banners allowed.` 
            });
        }

        let newBannerUrls = [];

        // 🔥 CLOUDINARY UPLOAD LOOP
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Cloudinary pe bhejo
                const result = await cloudinary.uploader.upload(file.path, { 
                    folder: 'shoeon-banners', // Alag folder banners ke liye
                    resource_type: "image"
                });
                
                newBannerUrls.push(result.secure_url);

                // Local temp file delete karo (Safai)
                try { require('fs').unlinkSync(file.path); } catch(e) {}
            }
        }

        // Database me URLs jodo (Append)
        settings.banners = [...settings.banners, ...newBannerUrls];
        await settings.save();

        res.json({ message: "Banners uploaded to Cloudinary!", banners: settings.banners });

    } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        res.status(500).json({ error: "Server Error during upload" });
    }
});


// 3. DELETE BANNER
app.post('/api/settings/delete-banner', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        let settings = await SiteSettings.findOne();
        if (!settings) return res.status(404).json({ error: "Settings not found" });

        // Sirf List se hata rahe hain (Cloudinary se delete karna optional hai)
        settings.banners = settings.banners.filter(url => url !== imageUrl);
        
        await settings.save();
        res.json({ message: "Banner removed", banners: settings.banners });

    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete banner" });
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


// ==========================================
// UPDATE USER (ALL-IN-ONE: Approval + Offline + Details)
// ==========================================
app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // 🔥 STEP 1: Yahan se data nikaalna zaroori hai
        const { 
            name, phone, shopName, shopAddress, gstNumber, 
            isApproved, 
            isOfflineCustomer, 
            isCashAllowed,  // 👈 Ye zaroori hai
            advancePercent, // 👈 Ye bhi zaroori hai
            isCreditApproved, creditTermsDays, creditLimit 
        } = req.body;

        const updateFields = {};

        // Text fields update
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;
        if (shopName) updateFields.shopName = shopName;
        if (shopAddress) updateFields.shopAddress = shopAddress;
        if (gstNumber) updateFields.gstNumber = gstNumber;

        // 🔥 STEP 2: Advance Percent Logic
        if (advancePercent !== undefined && advancePercent !== "") {
            updateFields.advancePercent = parseInt(advancePercent);
        }

        // Boolean fields check
        if (typeof isApproved !== 'undefined') updateFields.isApproved = isApproved;
        if (typeof isOfflineCustomer !== 'undefined') updateFields.isOfflineCustomer = isOfflineCustomer;
        
        // 🔥 STEP 3: Cash Allowed Logic
        if (typeof isCashAllowed !== 'undefined') updateFields.isCashAllowed = isCashAllowed;
        
        // Database Update
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(updatedUser);

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: "Server Error updating user." });
    }
});

// 1. Email Sender Setup (Apna Gmail use karein)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aasim2038y@gmail.com', // 🔴 Apna Asli Email yahan daalo
        pass: 'mxcc halh dzgk iuzg'      // 🔴 Gmail App Password (Normal password nahi chalega)
    }
});

// --- API 1: SEND OTP ---
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 4 Digit OTP Generate karo
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Database mein OTP aur Expiry (10 min) save karo
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes
        await user.save();

        // Email Bhejo
        const mailOptions = {
            from: 'ShoeOn Support <no-reply@shoeon.in>',
            to: email,
            subject: 'Password Reset OTP - ShoeOn',
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Error sending email" });
            }
            res.json({ message: "OTP sent to email" });
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// --- API 2: VERIFY OTP ---
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        
        if (!user || user.resetPasswordOtp !== otp || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or Expired OTP" });
        }

        res.json({ message: "OTP Verified" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// --- API 3: RESET PASSWORD ---
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });

        // Security Check: Dobara check karo ki OTP valid hai (Hackers ko rokne ke liye)
        if (!user || user.resetPasswordOtp !== otp || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        // Password Hash karke save karo
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // OTP use ho gaya, ab hata do
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password Changed Successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ==============================================
// 🛠️ TEMPORARY: EK CLICK ME DUMMY PRODUCTS BANAO
// URL: http://localhost:3000/api/fill-dummy-data
// ==============================================
app.get('/api/fill-dummy-data', async (req, res) => {
    try {
        // Tumhari Categories ki List (Jo admin file me thi)
        const CATEGORY_DATA = {
            "men": ["Casual", "PU-Chappal", "Sandals", "Sports-Shoes", "Crocks", "Safty Shoe", "Loose-products"],
            "women": ["Bellies", "PU-Chappal", "PU-Sandals", "Crocks", "Safty Shoe", "Loose-products"],
            "boys": ["Sports-Shoes", "PU-Chappal", "Sandals", "School-Shoes", "Crocks", "Loose-Products"],
            "girls": ["Bellies", "PU-Chappal", "PU-Sandals", "School-Bellies", "Crocks", "Loose-Products"],
            "Loose": ["Womens", "Men", "Boys", "Girls", "Kids"], 
            "party": ["Womens", "Girls"],
        };

        let count = 0;

        // Har Category ke liye Loop chalayenge
        for (const [mainCat, subCats] of Object.entries(CATEGORY_DATA)) {
            for (const subCat of subCats) {
                
                // Category ka naam banana (Jaisa Admin Panel banata hai)
                // Example: men + Casual = men-casual
                const categoryName = `${mainCat}-${subCat.toLowerCase()}`; // Dash aur Lowercase
                
                // Product Create Karo
                const dummyProduct = new Product({
                    name: `Test ${subCat} (${mainCat})`,
                    brand: "Test Brand",
                    description: "This is a dummy product for testing.",
                    mrp: 999,
                    salePrice: 499,
                    offlinePrice: 450,
                    moq: 4,
                    stock: 100,
                    category: categoryName, // Asli Magic Yahan Hai
                    isLoose: mainCat === "Loose", // Agar Loose hai to true
                    images: ["images/placeholder.jpg"], // Ek nakli image
                    tags: ["Featured"]
                });

                await dummyProduct.save();
                count++;
            }
        }

        res.send(`<h1>Done! ✅</h1><p>${count} Dummy Products added. Ab site check karo!</p>`);

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// 🗑️ CLEANUP: SAARA KACHRA DELETE KARNE KE LIYE
// URL: http://localhost:3000/api/delete-dummy-data
// app.get('/api/delete-dummy-data', async (req, res) => {
//     try {
//         // Sirf wahi delete karenge jinka brand "Test Brand" hai
//         await Product.deleteMany({ brand: "Test Brand" });
//         res.send("<h1>Cleaned! 🧹</h1><p>Saare dummy products delete ho gaye.</p>");
//     } catch (err) {
//         res.status(500).send("Error: " + err.message);
//     }
// });

