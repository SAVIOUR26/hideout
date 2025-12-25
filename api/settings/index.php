<?php
/**
 * Settings Endpoint
 * HGM POS System - Business Settings Management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Verify authentication
$user = JWT::verifyToken();

$database = new Database();
$db = $database->getConnection();

// Get path segments to determine sub-endpoint
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$segments = explode('/', trim($uri, '/'));
$subEndpoint = $segments[count($segments) - 1];

if ($subEndpoint === 'business') {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            // Get business settings
            $query = "SELECT * FROM business_settings WHERE id = 1";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($settings) {
                echo json_encode($settings);
            } else {
                // Return defaults if not found
                echo json_encode(array(
                    'business_name' => 'HGM Properties Ltd',
                    'phone' => '+256-XXX-XXXXXX',
                    'email' => 'info@hgmproperties.com',
                    'address' => 'Kampala, Uganda',
                    'footer_message' => 'Thank you for your business!\nPlease visit us again'
                ));
            }
            break;

        case 'PUT':
            // Update business settings (admin only)
            if ($user['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(array("success" => false, "message" => "Unauthorized"));
                exit();
            }

            $data = json_decode(file_get_contents("php://input"));

            // Check if settings exist
            $checkQuery = "SELECT id FROM business_settings WHERE id = 1";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute();

            if ($checkStmt->rowCount() > 0) {
                // Update existing
                $query = "UPDATE business_settings SET
                          business_name = :business_name,
                          phone = :phone,
                          email = :email,
                          address = :address,
                          footer_message = :footer_message,
                          updated_at = CURRENT_TIMESTAMP
                          WHERE id = 1";
            } else {
                // Insert new
                $query = "INSERT INTO business_settings (id, business_name, phone, email, address, footer_message)
                          VALUES (1, :business_name, :phone, :email, :address, :footer_message)";
            }

            $stmt = $db->prepare($query);
            $stmt->bindParam(':business_name', $data->business_name);
            $stmt->bindParam(':phone', $data->phone);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':address', $data->address);
            $stmt->bindParam(':footer_message', $data->footer_message);

            if ($stmt->execute()) {
                echo json_encode(array(
                    "success" => true,
                    "message" => "Business settings updated successfully"
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Failed to update business settings"
                ));
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(array("success" => false, "message" => "Method not allowed"));
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(array("success" => false, "message" => "Settings endpoint not found"));
}
