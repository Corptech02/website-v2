<?php
// CRM Proxy - Forward requests to vanguard backend to avoid Mixed Content issues
// This allows vigagency.com (HTTPS) to access 162.220.14.239 (HTTP) data securely

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests for CRM data
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Make HTTP request to vanguard backend CRM endpoint
    $vanguard_crm_url = 'http://162.220.14.239/api/crm/leads';

    // Initialize curl
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $vanguard_crm_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    // Execute request
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    // Check for curl errors
    if ($curl_error) {
        throw new Exception("CURL Error: " . $curl_error);
    }

    // Check HTTP status
    if ($http_code !== 200) {
        throw new Exception("HTTP Error: " . $http_code . " - " . $response);
    }

    // Validate JSON response
    $json_data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON response: " . json_last_error_msg());
    }

    // Log successful request
    error_log("CRM Proxy: Successfully fetched " . count($json_data['leads'] ?? []) . " leads");

    // Return the JSON response
    echo $response;

} catch (Exception $e) {
    // Log the error
    error_log("CRM Proxy Error: " . $e->getMessage());

    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'leads' => [],
        'total' => 0,
        'source' => 'Proxy Error',
        'message' => 'Failed to connect to CRM system via proxy'
    ]);
}
?>