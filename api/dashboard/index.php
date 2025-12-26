<?php
/**
 * Dashboard Endpoint
 * HGM POS System - Sales Dashboard Statistics
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

// Verify authentication
$user = JWT::verifyToken();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Get today's sales
        $todayQuery = "SELECT COUNT(*) as transactions, COALESCE(SUM(total), 0) as total
                      FROM transactions
                      WHERE DATE(created_at) = CURDATE()";
        $todayStmt = $db->prepare($todayQuery);
        $todayStmt->execute();
        $today = $todayStmt->fetch(PDO::FETCH_ASSOC);

        // Get yesterday's sales
        $yesterdayQuery = "SELECT COUNT(*) as transactions, COALESCE(SUM(total), 0) as total
                          FROM transactions
                          WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
        $yesterdayStmt = $db->prepare($yesterdayQuery);
        $yesterdayStmt->execute();
        $yesterday = $yesterdayStmt->fetch(PDO::FETCH_ASSOC);

        // Get last week's sales (last 7 days)
        $lastWeekQuery = "SELECT COUNT(*) as transactions, COALESCE(SUM(total), 0) as total
                         FROM transactions
                         WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        $lastWeekStmt = $db->prepare($lastWeekQuery);
        $lastWeekStmt->execute();
        $lastWeek = $lastWeekStmt->fetch(PDO::FETCH_ASSOC);

        // Get this month's sales
        $thisMonthQuery = "SELECT COUNT(*) as transactions, COALESCE(SUM(total), 0) as total
                          FROM transactions
                          WHERE MONTH(created_at) = MONTH(CURDATE())
                          AND YEAR(created_at) = YEAR(CURDATE())";
        $thisMonthStmt = $db->prepare($thisMonthQuery);
        $thisMonthStmt->execute();
        $thisMonth = $thisMonthStmt->fetch(PDO::FETCH_ASSOC);

        // Get sales by section (today)
        $sectionQuery = "SELECT section,
                               COUNT(*) as transactions,
                               COALESCE(SUM(total), 0) as total
                        FROM transactions
                        WHERE DATE(created_at) = CURDATE()
                        GROUP BY section";
        $sectionStmt = $db->prepare($sectionQuery);
        $sectionStmt->execute();
        $bySectiondata = $sectionStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get payment methods breakdown (today)
        $paymentQuery = "SELECT payment_method,
                               COUNT(*) as transactions,
                               COALESCE(SUM(total), 0) as total
                        FROM transactions
                        WHERE DATE(created_at) = CURDATE()
                        GROUP BY payment_method";
        $paymentStmt = $db->prepare($paymentQuery);
        $paymentStmt->execute();
        $byPayment = $paymentStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get top selling items (today)
        $topItemsQuery = "SELECT i.name,
                                i.category,
                                i.section,
                                SUM(ti.quantity) as quantity_sold,
                                COALESCE(SUM(ti.total), 0) as revenue
                         FROM transaction_items ti
                         LEFT JOIN items i ON ti.item_id = i.id
                         LEFT JOIN transactions t ON ti.transaction_id = t.id
                         WHERE DATE(t.created_at) = CURDATE()
                         GROUP BY ti.item_id
                         ORDER BY quantity_sold DESC
                         LIMIT 10";
        $topItemsStmt = $db->prepare($topItemsQuery);
        $topItemsStmt->execute();
        $topItems = $topItemsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get low stock items
        $lowStockQuery = "SELECT name, section, category, stock, low_stock_alert
                         FROM items
                         WHERE stock <= low_stock_alert
                         ORDER BY stock ASC
                         LIMIT 10";
        $lowStockStmt = $db->prepare($lowStockQuery);
        $lowStockStmt->execute();
        $lowStock = $lowStockStmt->fetchAll(PDO::FETCH_ASSOC);

        // Build dashboard response
        $dashboardData = array(
            'success' => true,
            'today' => array(
                'transactions' => (int)$today['transactions'],
                'total' => (float)$today['total']
            ),
            'yesterday' => array(
                'transactions' => (int)$yesterday['transactions'],
                'total' => (float)$yesterday['total']
            ),
            'last_week' => array(
                'transactions' => (int)$lastWeek['transactions'],
                'total' => (float)$lastWeek['total']
            ),
            'this_month' => array(
                'transactions' => (int)$thisMonth['transactions'],
                'total' => (float)$thisMonth['total']
            ),
            'by_section' => $byS​ectiondata,
            'by_payment' => $byPayment,
            'top_items' => $topItems,
            'low_stock' => $lowStock
        );

        echo json_encode($dashboardData);

    } catch (Exception $e) {
        error_log("Dashboard error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Failed to fetch dashboard data"
        ));
    }

} else {
    http_response_code(405);
    echo json_encode(array("success" => false, "message" => "Method not allowed"));
}
