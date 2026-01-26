// Removed dependency on node-fetch
const http = require('http');

const testEndpoint = () => {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/inventory/available',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
            // Auth might be needed but let's check if it returns 401 vs 404 first.
            // 404 means route missing. 401 means auth needed (route exists).
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('BODY:', data.substring(0, 100)); // Print first 100 chars
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();
};

testEndpoint();
