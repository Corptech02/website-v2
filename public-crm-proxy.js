// Simple Node.js HTTP server to proxy CRM requests
// NO external dependencies - solves Mixed Content issue

const http = require('http');
const url = require('url');

// Function to fetch from backend
async function fetchCRMData(path = '', query = '') {
    return new Promise((resolve, reject) => {
        const backendUrl = `http://127.0.0.1:3001/api/vigagency/crm/leads${path}${query}`;

        const options = {
            hostname: '127.0.0.1',
            port: 3001,
            path: `/api/vigagency/crm/leads${path}${query}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'VigAgency-Proxy/1.0'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    reject(new Error('Invalid JSON from backend: ' + e.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error('Backend connection failed: ' + error.message));
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Backend request timeout'));
        });

        req.end();
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://vigagency.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`🔗 ${new Date().toISOString()} - ${req.method} ${req.url}`);

    try {
        if (pathname === '/api/crm/leads') {
            // Proxy CRM request - filter out JSONP params for backend
            const originalQuery = parsedUrl.query || {};
            const backendQuery = { ...originalQuery };

            // Remove JSONP-specific parameters before forwarding to backend
            delete backendQuery.callback;
            delete backendQuery.format;
            delete backendQuery._;

            // Reconstruct query string for backend
            const queryPairs = Object.entries(backendQuery).map(([k, v]) => `${k}=${v}`);
            const backendQueryString = queryPairs.length > 0 ? '?' + queryPairs.join('&') : '';

            const data = await fetchCRMData('', backendQueryString);

            // Add proxy metadata
            data.proxy_info = {
                proxy_type: 'vigagency-simple-node',
                timestamp: new Date().toISOString(),
                request_url: req.url,
                backend_success: true
            };

            console.log(`✅ CRM data served: ${data.leads?.length || 0} leads`);

            // Check if JSONP callback is requested
            const callback = parsedUrl.query.callback;
            const format = parsedUrl.query.format;

            if (callback && format === 'jsonp') {
                console.log(`🔗 Serving JSONP response with callback: ${callback}`);
                res.setHeader('Content-Type', 'application/javascript');
                res.writeHead(200);
                res.end(`${callback}(${JSON.stringify(data)});`);
            } else {
                res.writeHead(200);
                res.end(JSON.stringify(data, null, 2));
            }

        } else if (pathname === '/health') {
            // Health check
            const health = {
                status: 'healthy',
                service: 'vigagency-simple-crm-proxy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            };

            res.writeHead(200);
            res.end(JSON.stringify(health, null, 2));

        } else {
            // Not found
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not Found', path: pathname }));
        }

    } catch (error) {
        console.error('❌ Proxy error:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            leads: [],
            total: 0,
            proxy_info: {
                proxy_type: 'vigagency-simple-node-error',
                timestamp: new Date().toISOString(),
                error_details: error.message
            }
        };

        res.writeHead(500);
        res.end(JSON.stringify(errorResponse, null, 2));
    }
});

const PORT = 8085;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Public CRM Proxy Server started`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 CRM Endpoint: https://vigagency.com:${PORT}/api/crm/leads`);
    console.log(`❤️  Health Check: https://vigagency.com:${PORT}/health`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n📡 Shutting down proxy server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('📡 Received SIGTERM, shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});