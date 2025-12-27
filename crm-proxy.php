<?php
// Direct CRM proxy script for vigagency.com
// This creates a server-side bridge to fetch CRM data without Mixed Content issues

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Fetch data from vanguard backend CRM proxy
    $url = 'http://162.220.14.239/api/vigagency/crm/leads';

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 30,
            'header' => 'Content-Type: application/json'
        ]
    ]);

    $response = file_get_contents($url, false, $context);

    if ($response === false) {
        throw new Exception('Failed to fetch from vanguard backend');
    }

    // Validate JSON
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON from backend: ' . json_last_error_msg());
    }

    // Add proxy info
    $data['proxy_info'] = [
        'source' => 'vigagency.com PHP proxy',
        'timestamp' => date('c'),
        'success' => true
    ];

    echo json_encode($data, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'leads' => [],
        'total' => 0,
        'proxy_info' => [
            'source' => 'vigagency.com PHP proxy',
            'timestamp' => date('c'),
            'success' => false
        ]
    ], JSON_PRETTY_PRINT);
}
?>