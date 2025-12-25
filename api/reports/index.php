<?php
/**
 * Reports Endpoint
 * HGM POS System - Sales Reports & Analytics
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Verify authentication
$user = JWT::verifyToken();

// Only admin can view reports
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Unauthorized"));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : date('Y-m-d');
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : date('Y-m-d');
    $section = isset($_GET['section']) ? $_GET['section'] : 'all';

    // Build WHERE clause
    $where = "WHERE DATE(t.created_at) BETWEEN :startDate AND :endDate";
    $params = array(':startDate' => $startDate, ':endDate' => $endDate);

    if ($section && $section !== 'all') {
        $where .= " AND t.section = :section";
        $params[':section'] = $section;
    }

    // Total sales
    $totalQuery = "SELECT
                   COUNT(*) as transaction_count,
                   COALESCE(SUM(total), 0) as total_sales
                   FROM transactions t
                   $where";
    $totalStmt = $db->prepare($totalQuery);
    foreach ($params as $key => $value) {
        $totalStmt->bindValue($key, $value);
    }
    $totalStmt->execute();
    $totals = $totalStmt->fetch(PDO::FETCH_ASSOC);

    // Sales by payment method
    $paymentQuery = "SELECT
                     payment_method,
                     COUNT(*) as count,
                     COALESCE(SUM(total), 0) as total
                     FROM transactions t
                     $where
                     GROUP BY payment_method";
    $paymentStmt = $db->prepare($paymentQuery);
    foreach ($params as $key => $value) {
        $paymentStmt->bindValue($key, $value);
    }
    $paymentStmt->execute();
    $byPaymentMethod = $paymentStmt->fetchAll(PDO::FETCH_ASSOC);

    // Sales by section
    $sectionQuery = "SELECT
                     section,
                     COUNT(*) as count,
                     COALESCE(SUM(total), 0) as total
                     FROM transactions t
                     $where
                     GROUP BY section";
    $sectionStmt = $db->prepare($sectionQuery);
    foreach ($params as $key => $value) {
        $sectionStmt->bindValue($key, $value);
    }
    $sectionStmt->execute();
    $bySection = $sectionStmt->fetchAll(PDO::FETCH_ASSOC);

    // Top selling items
    $topItemsQuery = "SELECT
                      i.name,
                      i.category,
                      i.section,
                      SUM(ti.quantity) as total_quantity,
                      SUM(ti.total) as total_sales
                      FROM transaction_items ti
                      JOIN items i ON ti.item_id = i.id
                      JOIN transactions t ON ti.transaction_id = t.id
                      $where
                      GROUP BY ti.item_id
                      ORDER BY total_quantity DESC
                      LIMIT 10";
    $topItemsStmt = $db->prepare($topItemsQuery);
    foreach ($params as $key => $value) {
        $topItemsStmt->bindValue($key, $value);
    }
    $topItemsStmt->execute();
    $topItems = $topItemsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Low stock items
    $lowStockQuery = "SELECT id, name, section, stock, low_stock_alert
                      FROM items
                      WHERE stock <= low_stock_alert
                      ORDER BY stock ASC
                      LIMIT 20";
    $lowStockStmt = $db->prepare($lowStockQuery);
    $lowStockStmt->execute();
    $lowStock = $lowStockStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array(
        'period' => array(
            'startDate' => $startDate,
            'endDate' => $endDate,
            'section' => $section
        ),
        'summary' => $totals,
        'byPaymentMethod' => $byPaymentMethod,
        'bySection' => $bySection,
        'topItems' => $topItems,
        'lowStock' => $lowStock
    ));

} else {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed"));
}
