// Simple CRM proxy server for vigagency.com
const http = require('http');
const https = require('https');
const fs = require('fs');

// Simple proxy function
async function fetchCRMData(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 3001,
            path: `/api/vigagency/crm${path}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log('🔗 CRM proxy request:', req.method, req.url);

    try {
        if (req.url.startsWith('/api/crm/leads')) {
            // Extract query parameters
            const url = new URL(req.url, 'http://localhost');
            const queryString = url.search || '';

            const crmData = await fetchCRMData('/leads' + queryString);

            console.log('✅ CRM data fetched, leads:', crmData.leads?.length || 0);

            res.writeHead(200);
            res.end(JSON.stringify(crmData));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
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

const PORT = 8082;
server.listen(PORT, () => {
    console.log(`🚀 CRM Proxy Server running on http://localhost:${PORT}`);
    console.log('📡 Test endpoint: curl http://localhost:8082/api/crm/leads');
});