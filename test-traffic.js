const https = require('https');

// Yahan apni Render wali LIVE website ki link daalo
const TARGET_URL = 'https://shoeon-websitedemo.onrender.com'; // <--- CHANGE THIS LINK

const TOTAL_REQUESTS = 100; // Kitne fake users bhejne hain?
let successCount = 0;
let failCount = 0;

console.log(`🚀 Starting Load Test on: ${TARGET_URL}`);
console.log(`Sending ${TOTAL_REQUESTS} requests...`);

const start = Date.now();

for (let i = 0; i < TOTAL_REQUESTS; i++) {
    https.get(TARGET_URL, (res) => {
        // Agar status code 200 (OK) hai, matlab site mast chal rahi hai
        if (res.statusCode === 200) {
            successCount++;
        } else {
            failCount++;
            console.log(`❌ Failed with Status: ${res.statusCode}`);
        }
        checkDone();
    }).on('error', (e) => {
        failCount++;
        console.error(`❌ Error: ${e.message}`);
        checkDone();
    });
}

function checkDone() {
    if (successCount + failCount === TOTAL_REQUESTS) {
        const timeTaken = (Date.now() - start) / 1000;
        console.log(`\n=============================`);
        console.log(`✅ Test Completed in ${timeTaken} seconds`);
        console.log(`Successful Hits: ${successCount}`);
        console.log(`Failed Hits: ${failCount}`);
        
        if(failCount === 0) {
            console.log(`🎉 PASS: Site handle kar gayi! Koi crash nahi hua.`);
        } else {
            console.log(`⚠️ WARNING: Kuch requests fail huye.`);
        }
        console.log(`=============================`);
    }
}