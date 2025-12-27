<?php
// Policy Detail Proxy - Forward requests to vanguard backend for detailed policy data
// This allows vigagency.com (HTTPS) to access 162.220.14.239 (HTTP) policy details securely

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests for policy detail data
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get policy number from URL parameter
$policy_number = $_GET['policy_number'] ?? '';

if (empty($policy_number)) {
    http_response_code(400);
    echo json_encode(['error' => 'Policy number required']);
    exit();
}

try {
    // Make HTTP request to vanguard backend policy detail endpoint
    $vanguard_policy_url = 'http://162.220.14.239/api/policies/' . urlencode($policy_number);

    // Initialize curl
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $vanguard_policy_url);
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
    error_log("Policy Detail Proxy: Successfully fetched policy " . $policy_number);

    // Return the JSON response
    echo $response;

} catch (Exception $e) {
    // Log the error
    error_log("Policy Detail Proxy Error: " . $e->getMessage());

    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'policy_number' => $policy_number,
        'source' => 'Policy Detail Proxy Error',
        'message' => 'Failed to fetch detailed policy data from CRM system via proxy'
    ]);
}
?>