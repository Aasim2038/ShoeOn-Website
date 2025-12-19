const https = require('https');

// Apni LIVE site ka URL (bina https:// ke)
const TARGET_HOST = 'shoeon-websitedemo.onrender.com'; 

// Fake Order Data
const postData = JSON.stringify({
    customerName: "Spam Tester",
    customerPhone: "0000000000",
    totalAmount: 100,
    orderItems: [] // Khali bhej rahe taaki DB load na le, bas Request count ho
});

// Hum 110 requests bhejenge (Limit 100 hai)
const TOTAL_REQUESTS = 110; 

let successCount = 0;
let blockedCount = 0;
let completed = 0;

console.log(`🚀 Sending ${TOTAL_REQUESTS} requests to check Rate Limit...`);

for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const options = {
        hostname: TARGET_HOST,
        path: '/api/orders', // Hum Order API par hamla kar rahe hain
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = https.request(options, (res) => {
        // Status 429 matlab "Too Many Requests" (BLOCKED)
        if (res.statusCode === 429) {
            blockedCount++;
            process.stdout.write("⛔"); // Blocked icon
        } else {
            successCount++;
            process.stdout.write("✅"); // Success icon
        }

        completed++;
        if (completed === TOTAL_REQUESTS) {
            printResult();
        }
    });

    req.on('error', (e) => {
        console.error(`❌ Request Failed: ${e.message}`);
        completed++;
        if (completed === TOTAL_REQUESTS) printResult();
    });

    req.write(postData);
    req.end();
}

function printResult() {
    console.log(`\n\n=============================`);
    console.log(`📊 FINAL RESULT:`);
    console.log(`Allowed Requests: ${successCount}`);
    console.log(`Blocked Requests: ${blockedCount} (Status 429)`);
    
    if (blockedCount > 0) {
        console.log(`🎉 SUCCESS: Server ne Spam rok diya!`);
        console.log(`Message: "Too many orders from this IP..."`);
    } else {
        console.log(`⚠️ WARNING: Server ne roka nahi. Shayad limit abhi cross nahi hui.`);
    }
    console.log(`=============================`);
}