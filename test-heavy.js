const https = require('https');

const TARGET_HOST = 'shoeon-websitedemo.onrender.com'; // Live Link
// const TARGET_HOST = 'localhost'; // Local ke liye uncomment karein (aur port add karein)

// Product ID (Zinda product ki ID daalna)
const PRODUCT_ID = "6762dc891c327092957b450c"; 

const TOTAL_ORDERS = 100;
const BATCH_SIZE = 100; // Ek baar mein 100 bhejo
let ordersSent = 0;

console.log(`🚀 STARTING HEAVY LOAD TEST: ${TOTAL_ORDERS} Orders`);

async function sendBatch() {
    if (ordersSent >= TOTAL_ORDERS) {
        console.log("\n✅ ALL BATCHES FINISHED! Server Still Alive.");
        return;
    }

    const promises = [];
    const currentBatch = Math.min(BATCH_SIZE, TOTAL_ORDERS - ordersSent);

    console.log(`\n🌊 Sending Batch: ${currentBatch} orders...`);

    for (let i = 0; i < currentBatch; i++) {
        promises.push(makeRequest());
    }

    await Promise.all(promises); // Wait karo sabke khatam hone ka
    ordersSent += currentBatch;
    
    // Thoda sa saans lene do (1 second break) fir agli wave
    setTimeout(sendBatch, 500); 
}

function makeRequest() {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            customerName: `Bot ${Date.now()}`,
            customerPhone: "9999999999",
            shippingAddress: "Stress Test Lane",
            totalAmount: 500,
            paymentMethod: "COD",
            orderItems: [{ productId: PRODUCT_ID, name: "Test Shoe", quantity: 1, price: 500 }]
        });

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
            if (res.statusCode === 201) process.stdout.write("✅");
            else process.stdout.write("❌");
            resolve();
        });

        req.on('error', (e) => {
            process.stdout.write("💀"); // Connection Dead
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

sendBatch(); // Start the War