const http = require('http');
const url = require('url');

// Simple HTTP proxy server for vigagency.com CRM endpoint
const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://vigagency.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        console.log('🔗 CRM proxy request:', req.url);

        // Forward to localhost backend
        const backendUrl = 'http://127.0.0.1:3001/api/vigagency/crm/leads' + (url.parse(req.url).search || '');

        const response = await fetch(backendUrl);
        const data = await response.text();

        console.log('✅ CRM proxy success, data length:', data.length);

        res.writeHead(200);
        res.end(data);

    } catch (error) {
        console.error('❌ CRM proxy error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
            success: false,
            error: error.message,
            leads: [],
            total: 0
        }));
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`🚀 CRM Proxy server running on port ${PORT}`);
    console.log('📡 Serving live CRM data for vigagency.com admin dashboard');
});

module.exports = server;