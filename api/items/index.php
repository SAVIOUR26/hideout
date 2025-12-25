<?php
/**
 * Items Endpoint
 * HGM POS System - Item Management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Verify authentication
$user = JWT::verifyToken();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all items or filtered by section/status
        $section = isset($_GET['section']) ? $_GET['section'] : null;
        $status = isset($_GET['status']) ? $_GET['status'] : 'active'; // Default to active only

        if ($section && $section !== 'all') {
            if ($status === 'all') {
                $query = "SELECT * FROM items WHERE section = :section ORDER BY name ASC";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':section', $section);
            } else {
                $query = "SELECT * FROM items WHERE section = :section AND status = :status ORDER BY name ASC";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':section', $section);
                $stmt->bindParam(':status', $status);
            }
        } else {
            if ($status === 'all') {
                $query = "SELECT * FROM items ORDER BY section ASC, name ASC";
                $stmt = $db->prepare($query);
            } else {
                $query = "SELECT * FROM items WHERE status = :status ORDER BY section ASC, name ASC";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':status', $status);
            }
        }

        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($items);
        break;

    case 'POST':
        // Add new item (admin only)
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("success" => false, "message" => "Unauthorized"));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->name) || empty($data->price)) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Name and price are required"));
            exit();
        }

        // Set default status if not provided
        $status = isset($data->status) ? $data->status : 'active';

        $query = "INSERT INTO items (name, category, section, price, stock, low_stock_alert, description, status)
                  VALUES (:name, :category, :section, :price, :stock, :low_stock_alert, :description, :status)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':category', $data->category);
        $stmt->bindParam(':section', $data->section);
        $stmt->bindParam(':price', $data->price);
        $stmt->bindParam(':stock', $data->stock);
        $stmt->bindParam(':low_stock_alert', $data->low_stock_alert);
        $stmt->bindParam(':description', $data->description);
        $stmt->bindParam(':status', $status);

        if ($stmt->execute()) {
            echo json_encode(array(
                "success" => true,
                "message" => "Item created successfully",
                "id" => $db->lastInsertId()
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Failed to create item"));
        }
        break;

    case 'PUT':
        // Update item (admin only)
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("success" => false, "message" => "Unauthorized"));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->id)) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Item ID is required"));
            exit();
        }

        $query = "UPDATE items SET
                  name = :name,
                  category = :category,
                  section = :section,
                  price = :price,
                  stock = :stock,
                  low_stock_alert = :low_stock_alert,
                  description = :description,
                  status = :status,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':category', $data->category);
        $stmt->bindParam(':section', $data->section);
        $stmt->bindParam(':price', $data->price);
        $stmt->bindParam(':stock', $data->stock);
        $stmt->bindParam(':low_stock_alert', $data->low_stock_alert);
        $stmt->bindParam(':description', $data->description);
        $stmt->bindParam(':status', $data->status);

        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Item updated successfully"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Failed to update item"));
        }
        break;

    case 'DELETE':
        // Delete item (admin only)
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("success" => false, "message" => "Unauthorized"));
            exit();
        }

        // Get ID from query string
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Item ID is required"));
            exit();
        }

        $query = "DELETE FROM items WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Item deleted successfully"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Failed to delete item"));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array("success" => false, "message" => "Method not allowed"));
        break;
}
