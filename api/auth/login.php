<?php
/**
 * Authentication Endpoint
 * HGM POS System - User Login
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed"));
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (empty($data->username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Username and password are required"
    ));
    exit();
}

// Database connection
$database = new Database();
$db = $database->getConnection();

// Prepare query
$query = "SELECT id, username, password, role, created_at FROM users WHERE username = :username LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(':username', $data->username);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify password
    if (password_verify($data->password, $row['password'])) {
        // Generate JWT token
        $payload = array(
            "userId" => $row['id'],
            "username" => $row['username'],
            "role" => $row['role'],
            "iat" => time(),
            "exp" => time() + (24 * 60 * 60) // 24 hours
        );

        $jwt = JWT::encode($payload);

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login successful",
            "token" => $jwt,
            "user" => array(
                "id" => $row['id'],
                "username" => $row['username'],
                "role" => $row['role']
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid credentials"
        ));
    }
} else {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid credentials"
    ));
}
