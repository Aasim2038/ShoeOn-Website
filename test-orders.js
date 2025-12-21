const https = require('https');

// Apni LIVE site ka URL yahan daalo
const TARGET_HOST = 'shoeon-websitedemo.onrender.com'; // bina https:// ke

// Fake Order Data
const postData = JSON.stringify({
    customerName: "Stress Test User",
    customerPhone: "9999999999",
    shippingAddress: "Test Address, Matrix City",
    pincode: "110011",
    city: "Delhi",
    totalAmount: 500,
    paymentMethod: "COD",
    orderItems: [
        {
            productId: "6762dc891c327092957b450c", 
            quantity: 1,
            price: 500
        }
    ]
});

const TOTAL_ORDERS = 15;

let completed = 0;

console.log(`🚀 Bombarding Orders on: ${TARGET_HOST}`);

for (let i = 0; i < TOTAL_ORDERS; i++) {
    const options = {
        hostname: TARGET_HOST,
        path: '/api/orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = https.request(options, (res) => {
        // Status 201 matlab Order Created
        // Status 500 matlab Server Error (Crash)
        console.log(`Order #${i+1}: Status Code ${res.statusCode}`);
        completed++;
        if(completed === TOTAL_ORDERS) console.log("✅ Test Finished!");
    });

    req.on('error', (e) => {
        console.error(`❌ Request Failed: ${e.message}`);
    });

    req.write(postData);
    req.end();
}