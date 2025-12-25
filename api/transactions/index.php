<?php
/**
 * Transactions Endpoint
 * HGM POS System - Transaction Management
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
        // Get transactions with optional filters
        $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
        $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
        $section = isset($_GET['section']) ? $_GET['section'] : null;

        $query = "SELECT t.*, u.username as cashier_name
                  FROM transactions t
                  LEFT JOIN users u ON t.cashier_id = u.id
                  WHERE 1=1";

        $params = array();

        if ($startDate) {
            $query .= " AND DATE(t.created_at) >= :startDate";
            $params[':startDate'] = $startDate;
        }

        if ($endDate) {
            $query .= " AND DATE(t.created_at) <= :endDate";
            $params[':endDate'] = $endDate;
        }

        if ($section && $section !== 'all') {
            $query .= " AND t.section = :section";
            $params[':section'] = $section;
        }

        $query .= " ORDER BY t.created_at DESC LIMIT 100";

        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get items for each transaction
        foreach ($transactions as &$transaction) {
            $itemsQuery = "SELECT ti.*, i.name as item_name
                          FROM transaction_items ti
                          LEFT JOIN items i ON ti.item_id = i.id
                          WHERE ti.transaction_id = :transaction_id";
            $itemsStmt = $db->prepare($itemsQuery);
            $itemsStmt->bindParam(':transaction_id', $transaction['id']);
            $itemsStmt->execute();
            $transaction['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode($transactions);
        break;

    case 'POST':
        // Create new transaction
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->items) || !is_array($data->items)) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Items are required"));
            exit();
        }

        try {
            $db->beginTransaction();

            // Insert transaction
            $query = "INSERT INTO transactions (cashier_id, total, payment_method, section, customer_name)
                      VALUES (:cashier_id, :total, :payment_method, :section, :customer_name)";

            $stmt = $db->prepare($query);
            $stmt->bindParam(':cashier_id', $user['userId']);
            $stmt->bindParam(':total', $data->total);
            $stmt->bindParam(':payment_method', $data->payment_method);
            $stmt->bindParam(':section', $data->section);
            $customer_name = isset($data->customer_name) ? $data->customer_name : null;
            $stmt->bindParam(':customer_name', $customer_name);
            $stmt->execute();

            $transaction_id = $db->lastInsertId();

            // Insert transaction items and update stock
            $itemsQuery = "INSERT INTO transaction_items (transaction_id, item_id, quantity, price, total)
                          VALUES (:transaction_id, :item_id, :quantity, :price, :total)";
            $itemsStmt = $db->prepare($itemsQuery);

            $updateStockQuery = "UPDATE items SET stock = stock - :quantity WHERE id = :item_id";
            $updateStockStmt = $db->prepare($updateStockQuery);

            foreach ($data->items as $item) {
                // Insert transaction item
                $itemsStmt->bindParam(':transaction_id', $transaction_id);
                $itemsStmt->bindParam(':item_id', $item->id);
                $itemsStmt->bindParam(':quantity', $item->quantity);
                $itemsStmt->bindParam(':price', $item->price);
                $item_total = $item->price * $item->quantity;
                $itemsStmt->bindParam(':total', $item_total);
                $itemsStmt->execute();

                // Update stock
                $updateStockStmt->bindParam(':quantity', $item->quantity);
                $updateStockStmt->bindParam(':item_id', $item->id);
                $updateStockStmt->execute();
            }

            $db->commit();

            echo json_encode(array(
                "success" => true,
                "message" => "Transaction created successfully",
                "transaction_id" => $transaction_id
            ));

        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Failed to create transaction: " . $e->getMessage()
            ));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array("success" => false, "message" => "Method not allowed"));
        break;
}
