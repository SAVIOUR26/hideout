<?php
/**
 * Users Endpoint
 * HGM POS System - User Management (Admin Only)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Verify authentication
$user = JWT::verifyToken();

// Only admin can manage users
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Unauthorized"));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all users
        $query = "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($users);
        break;

    case 'POST':
        // Create new user
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->username) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Username and password are required"));
            exit();
        }

        // Check if username already exists
        $checkQuery = "SELECT id FROM users WHERE username = :username";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':username', $data->username);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Username already exists"));
            exit();
        }

        // Hash password
        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);
        $role = isset($data->role) ? $data->role : 'cashier';

        $query = "INSERT INTO users (username, password, role) VALUES (:username, :password, :role)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':username', $data->username);
        $stmt->bindParam(':password', $hashed_password);
        $stmt->bindParam(':role', $role);

        if ($stmt->execute()) {
            echo json_encode(array(
                "success" => true,
                "message" => "User created successfully",
                "id" => $db->lastInsertId()
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Failed to create user"));
        }
        break;

    case 'DELETE':
        // Delete user
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required"));
            exit();
        }

        // Prevent deleting admin user
        $checkQuery = "SELECT role FROM users WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();
        $userToDelete = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($userToDelete && $userToDelete['role'] === 'admin') {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Cannot delete admin user"));
            exit();
        }

        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "User deleted successfully"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Failed to delete user"));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array("success" => false, "message" => "Method not allowed"));
        break;
}
