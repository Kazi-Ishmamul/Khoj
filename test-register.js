const http = require('http');

const postData = JSON.stringify({
    name: 'Test User',
    email: 'test3@example.com',
    phone: '1234567890',
    address: '123 Street',
    password: 'Test@123'
});

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response body:', data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(postData);
req.end();
