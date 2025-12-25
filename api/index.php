<?php
/**
 * API Router
 * HGM POS System - Main API Entry Point
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in production
ini_set('log_errors', 1);

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and extract path
$uri_parts = parse_url($request_uri);
$path = $uri_parts['path'];

// Remove /api/ prefix if present
$path = preg_replace('#^/api/#', '', $path);
$path = trim($path, '/');

// Split path into segments
$segments = explode('/', $path);
$endpoint = $segments[0] ?? '';

// Route to appropriate endpoint
switch ($endpoint) {
    case 'auth':
    case 'login':
        require_once __DIR__ . '/auth/login.php';
        break;

    case 'change-password':
        require_once __DIR__ . '/auth/change-password.php';
        break;

    case 'health':
        echo json_encode([
            'status' => 'ok',
            'message' => 'HGM POS API is running',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '2.0.0-PWA'
        ]);
        break;

    case 'items':
        require_once __DIR__ . '/items/index.php';
        break;

    case 'users':
        require_once __DIR__ . '/users/index.php';
        break;

    case 'transactions':
        require_once __DIR__ . '/transactions/index.php';
        break;

    case 'receipt':
        require_once __DIR__ . '/receipt/index.php';
        break;

    case 'settings':
        require_once __DIR__ . '/settings/index.php';
        break;

    case 'reports':
        require_once __DIR__ . '/reports/index.php';
        break;

    default:
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Endpoint not found: " . $endpoint
        ));
        break;
}
