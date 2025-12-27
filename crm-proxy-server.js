// Simple Express server to proxy CRM requests
// This solves the Mixed Content issue by serving data over HTTPS

const express = require('express');
const http = require('http');
const path = require('path');
const app = express();

// Enable CORS for vigagency.com
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://vigagency.com');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// CRM proxy endpoint
app.get('/api/crm/leads', async (req, res) => {
    try {
        console.log('🔗 CRM Proxy request received:', req.query);

        // Forward to local backend
        const backendUrl = `http://127.0.0.1:3001/api/vigagency/crm/leads`;

        const response = await fetch(backendUrl + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));

        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Add proxy metadata
        data.proxy_info = {
            proxy_type: 'vigagency-express',
            timestamp: new Date().toISOString(),
            request_id: Date.now(),
            backend_url: backendUrl
        };

        console.log('✅ CRM Proxy success:', data.leads?.length || 0, 'leads');

        res.json(data);

    } catch (error) {
        console.error('❌ CRM Proxy error:', error);

        res.status(500).json({
            success: false,
            error: error.message,
            leads: [],
            total: 0,
            proxy_info: {
                proxy_type: 'vigagency-express-error',
                timestamp: new Date().toISOString(),
                error_details: error.message
            }
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'vigagency-crm-proxy',
        timestamp: new Date().toISOString()
    });
});

const PORT = 8083;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VigAgency CRM Proxy running on port ${PORT}`);
    console.log(`📡 CRM endpoint: http://localhost:${PORT}/api/crm/leads`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('📡 Shutting down CRM proxy server...');
    server.close(() => {
        console.log('✅ CRM proxy server closed');
        process.exit(0);
    });
});

module.exports = app;