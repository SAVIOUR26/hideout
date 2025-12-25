<?php
/**
 * Thermal Printer Endpoint
 * HGM POS System - Generate ESC/POS Receipt
 *
 * Usage:
 * GET /api/thermal/print?id={transaction_id}&format={html|escpos|raw}
 *
 * Formats:
 * - html: Browser-friendly receipt (for print dialog)
 * - escpos: ESC/POS commands (for direct thermal printing)
 * - raw: Base64 encoded ESC/POS (for JavaScript printing)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/escpos.php';

// Verify authentication
$userData = JWT::verifyToken();

// Get transaction ID
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Transaction ID required"));
    exit();
}

$transaction_id = $_GET['id'];
$format = isset($_GET['format']) ? $_GET['format'] : 'html';

// Database connection
$database = new Database();
$db = $database->getConnection();

// Get transaction data
$query = "SELECT t.*, u.username as cashier_name
          FROM transactions t
          LEFT JOIN users u ON t.cashier_id = u.id
          WHERE t.id = :id
          LIMIT 1";

$stmt = $db->prepare($query);
$stmt->bindParam(':id', $transaction_id);
$stmt->execute();

if ($stmt->rowCount() == 0) {
    http_response_code(404);
    echo json_encode(array("success" => false, "message" => "Transaction not found"));
    exit();
}

$transaction = $stmt->fetch(PDO::FETCH_ASSOC);

// Get transaction items
$query = "SELECT ti.*, i.name as item_name
          FROM transaction_items ti
          LEFT JOIN items i ON ti.item_id = i.id
          WHERE ti.transaction_id = :id
          ORDER BY ti.id";

$stmt = $db->prepare($query);
$stmt->bindParam(':id', $transaction_id);
$stmt->execute();
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get business settings
$query = "SELECT * FROM business_settings LIMIT 1";
$stmt = $db->prepare($query);
$stmt->execute();
$settings = $stmt->fetch(PDO::FETCH_ASSOC);

// Generate receipt based on format
switch ($format) {
    case 'escpos':
        generateESCPOS($transaction, $items, $settings);
        break;

    case 'raw':
        generateRaw($transaction, $items, $settings);
        break;

    case 'html':
    default:
        generateHTML($transaction, $items, $settings);
        break;
}

/**
 * Generate ESC/POS receipt
 */
function generateESCPOS($transaction, $items, $settings) {
    $printer = new ThermalPrinter();

    // Header - Business Info
    $printer->align(ThermalPrinter::ALIGN_CENTER)
            ->setBold(true)
            ->setTextSize(2, 2)
            ->textLine($settings['business_name'] ?? 'HGM POS')
            ->setTextSize(1, 1)
            ->setBold(false)
            ->textLine($settings['phone'] ?? '')
            ->textLine($settings['email'] ?? '')
            ->textLine($settings['address'] ?? '')
            ->feed()
            ->doubleLine(48)
            ->feed();

    // Transaction Info
    $printer->align(ThermalPrinter::ALIGN_LEFT)
            ->textLine("Receipt #: " . $transaction['id'])
            ->textLine("Date: " . date('d/m/Y H:i', strtotime($transaction['created_at'])))
            ->textLine("Cashier: " . $transaction['cashier_name'])
            ->textLine("Section: " . strtoupper($transaction['section']))
            ->textLine("Payment: " . str_replace('_', ' ', strtoupper($transaction['payment_method'])))
            ->feed()
            ->dashedLine(48)
            ->feed();

    // Items Header
    $printer->columns("ITEM", "QTY  PRICE   TOTAL", 48)
            ->dashedLine(48);

    // Items
    foreach ($items as $item) {
        $name = substr($item['item_name'], 0, 20);
        $qty = $item['quantity'];
        $price = number_format($item['price'], 0);
        $total = number_format($item['total'], 0);

        $printer->textLine($name);

        // Qty, Price, Total line
        $line = sprintf("%3d x %6s = %7s", $qty, $price, $total);
        $printer->align(ThermalPrinter::ALIGN_RIGHT)
                ->textLine($line)
                ->align(ThermalPrinter::ALIGN_LEFT);
    }

    // Total
    $printer->feed()
            ->dashedLine(48)
            ->setBold(true)
            ->setTextSize(2, 2)
            ->columns("TOTAL", "UGX " . number_format($transaction['total'], 0), 48)
            ->setTextSize(1, 1)
            ->setBold(false)
            ->feed()
            ->doubleLine(48)
            ->feed();

    // QR Code for receipt verification
    $qrData = "RECEIPT:" . $transaction['id'] . ":" . $transaction['total'];
    $printer->align(ThermalPrinter::ALIGN_CENTER)
            ->qrCode($qrData, 6)
            ->feed();

    // Footer
    $printer->align(ThermalPrinter::ALIGN_CENTER)
            ->textLine($settings['footer_message'] ?? 'Thank you for your business!')
            ->feed(2)
            ->textLine("Powered by HGM POS v2.0")
            ->feed(3);

    // Cut paper
    $printer->cut();

    // Output ESC/POS data
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="receipt_' . $transaction['id'] . '.bin"');
    echo $printer->generate();
}

/**
 * Generate raw (base64) ESC/POS for JavaScript
 */
function generateRaw($transaction, $items, $settings) {
    ob_start();
    generateESCPOS($transaction, $items, $settings);
    $escpos = ob_get_clean();

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode(array(
        "success" => true,
        "data" => base64_encode($escpos),
        "encoding" => "base64",
        "format" => "escpos",
        "transaction_id" => $transaction['id']
    ));
}

/**
 * Generate HTML receipt (browser print)
 */
function generateHTML($transaction, $items, $settings) {
    // Redirect to existing receipt endpoint
    header('Location: /api/receipt?id=' . $transaction['id']);
    exit();
}
