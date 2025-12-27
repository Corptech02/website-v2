<?php
// Server-side CRM data fetcher - NO Mixed Content issues!
// This runs on vigagency.com server and can fetch from localhost

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://vigagency.com');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Since both servers are on the same VPS, we can use internal networking
    $backend_url = 'http://127.0.0.1:3001/api/vigagency/crm/leads';

    // Add query parameters if any
    if (!empty($_SERVER['QUERY_STRING'])) {
        $backend_url .= '?' . $_SERVER['QUERY_STRING'];
    }

    // Use cURL to fetch from localhost backend
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $backend_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'User-Agent: VigAgency-CRM-Proxy/1.0'
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        throw new Exception("Connection failed: " . $curl_error);
    }

    if ($http_code !== 200) {
        throw new Exception("HTTP $http_code: Backend server error");
    }

    // Validate JSON
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON response: " . json_last_error_msg());
    }

    // Add proxy metadata
    $data['proxy_info'] = [
        'proxy_type' => 'vigagency-php',
        'timestamp' => date('c'),
        'server_ip' => $_SERVER['SERVER_ADDR'] ?? 'unknown',
        'user_ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];

    // Log successful fetch
    error_log("VigAgency CRM Proxy: Successfully served " . count($data['leads'] ?? []) . " leads");

    echo json_encode($data, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);

    $error_response = [
        'success' => false,
        'error' => $e->getMessage(),
        'leads' => [],
        'total' => 0,
        'proxy_info' => [
            'proxy_type' => 'vigagency-php-error',
            'timestamp' => date('c'),
            'error_details' => $e->getMessage()
        ]
    ];

    error_log("VigAgency CRM Proxy Error: " . $e->getMessage());

    echo json_encode($error_response, JSON_PRETTY_PRINT);
}
?>