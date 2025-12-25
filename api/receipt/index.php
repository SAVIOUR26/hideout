<?php
/**
 * Receipt Endpoint
 * HGM POS System - Receipt Data Generation
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Verify authentication
$user = JWT::verifyToken();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get receipt data for a transaction
    $transaction_id = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$transaction_id) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Transaction ID is required"));
        exit();
    }

    // Get business settings
    $businessQuery = "SELECT * FROM business_settings WHERE id = 1 LIMIT 1";
    $businessStmt = $db->prepare($businessQuery);
    $businessStmt->execute();
    $businessSettings = $businessStmt->fetch(PDO::FETCH_ASSOC);

    $business = array(
        'name' => $businessSettings ? $businessSettings['business_name'] : 'HGM Properties Ltd',
        'address' => $businessSettings ? $businessSettings['address'] : 'Kampala, Uganda',
        'phone' => $businessSettings ? $businessSettings['phone'] : '+256-XXX-XXXXXX',
        'email' => $businessSettings ? $businessSettings['email'] : 'info@hgmproperties.com'
    );

    // Get transaction details
    $query = "SELECT t.*, u.username as cashier_name
              FROM transactions t
              LEFT JOIN users u ON t.cashier_id = u.id
              WHERE t.id = :transaction_id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':transaction_id', $transaction_id);
    $stmt->execute();
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$transaction) {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "Transaction not found"));
        exit();
    }

    // Get transaction items
    $itemsQuery = "SELECT ti.*, i.name as item_name
                  FROM transaction_items ti
                  LEFT JOIN items i ON ti.item_id = i.id
                  WHERE ti.transaction_id = :transaction_id";
    $itemsStmt = $db->prepare($itemsQuery);
    $itemsStmt->bindParam(':transaction_id', $transaction_id);
    $itemsStmt->execute();
    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Build receipt data
    $receiptData = array(
        'business' => $business,
        'transaction' => array(
            'id' => $transaction['id'],
            'date' => $transaction['created_at'],
            'cashier' => $transaction['cashier_name'],
            'payment_method' => $transaction['payment_method'],
            'customer_name' => $transaction['customer_name']
        ),
        'items' => $items,
        'total' => $transaction['total'],
        'footer' => $businessSettings ? $businessSettings['footer_message'] : 'Thank you for your business!'
    );

    echo json_encode($receiptData);

} else {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed"));
}
