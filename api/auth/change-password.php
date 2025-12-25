<?php
/**
 * Change Password Endpoint
 * HGM POS System - User Password Change
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Verify authentication
$user = JWT::verifyToken();

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed"));
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (empty($data->currentPassword) || empty($data->newPassword)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Current password and new password are required"
    ));
    exit();
}

// Validate new password length
if (strlen($data->newPassword) < 6) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "New password must be at least 6 characters long"
    ));
    exit();
}

// Database connection
$database = new Database();
$db = $database->getConnection();

// Get user's current password
$query = "SELECT id, password FROM users WHERE id = :user_id LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user['userId']);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(array(
        "success" => false,
        "message" => "User not found"
    ));
    exit();
}

$userRecord = $stmt->fetch(PDO::FETCH_ASSOC);

// Verify current password
if (!password_verify($data->currentPassword, $userRecord['password'])) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Current password is incorrect"
    ));
    exit();
}

// Hash new password
$hashedPassword = password_hash($data->newPassword, PASSWORD_BCRYPT);

// Update password
$updateQuery = "UPDATE users SET password = :password WHERE id = :user_id";
$updateStmt = $db->prepare($updateQuery);
$updateStmt->bindParam(':password', $hashedPassword);
$updateStmt->bindParam(':user_id', $user['userId']);

if ($updateStmt->execute()) {
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "message" => "Password changed successfully"
    ));
} else {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Failed to update password"
    ));
}
