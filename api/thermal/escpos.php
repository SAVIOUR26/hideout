<?php
/**
 * ESC/POS Thermal Printer Library
 * HGM POS System - Direct Thermal Printer Support
 *
 * Supports:
 * - ESC/POS protocol (Epson, Star, most thermal printers)
 * - 80mm thermal paper
 * - Text formatting, alignment, fonts
 * - Barcodes and QR codes
 * - Cut commands
 *
 * Usage:
 * $printer = new ThermalPrinter();
 * $printer->text("Hello World");
 * $printer->feed(2);
 * $printer->cut();
 * $escpos = $printer->generate();
 */

class ThermalPrinter {
    private $buffer = '';

    // ESC/POS Command Constants
    const ESC = "\x1B";
    const GS = "\x1D";
    const NUL = "\x00";
    const LF = "\x0A";
    const FF = "\x0C";
    const CR = "\x0D";
    const HT = "\x09";
    const DLE = "\x10";

    // Text Alignment
    const ALIGN_LEFT = 0;
    const ALIGN_CENTER = 1;
    const ALIGN_RIGHT = 2;

    // Text Style
    const STYLE_NORMAL = 0;
    const STYLE_BOLD = 1;
    const STYLE_UNDERLINE = 2;
    const STYLE_DOUBLE_HEIGHT = 4;
    const STYLE_DOUBLE_WIDTH = 8;

    // Font
    const FONT_A = 0;
    const FONT_B = 1;
    const FONT_C = 2;

    /**
     * Initialize printer
     */
    public function __construct() {
        $this->initialize();
    }

    /**
     * Initialize/reset printer
     */
    public function initialize() {
        $this->buffer .= self::ESC . "@";
        return $this;
    }

    /**
     * Add text to buffer
     */
    public function text($text) {
        $this->buffer .= $text;
        return $this;
    }

    /**
     * Add text with line feed
     */
    public function textLine($text = '') {
        $this->text($text);
        $this->feed();
        return $this;
    }

    /**
     * Set text alignment
     */
    public function align($alignment = self::ALIGN_LEFT) {
        $this->buffer .= self::ESC . "a" . chr($alignment);
        return $this;
    }

    /**
     * Set text emphasis (bold)
     */
    public function setBold($enabled = true) {
        $this->buffer .= self::ESC . "E" . chr($enabled ? 1 : 0);
        return $this;
    }

    /**
     * Set text underline
     */
    public function setUnderline($mode = 1) {
        $this->buffer .= self::ESC . "-" . chr($mode);
        return $this;
    }

    /**
     * Set text size
     */
    public function setTextSize($width = 1, $height = 1) {
        $width = max(1, min(8, $width)) - 1;
        $height = max(1, min(8, $height)) - 1;
        $n = ($width << 4) | $height;
        $this->buffer .= self::GS . "!" . chr($n);
        return $this;
    }

    /**
     * Set font
     */
    public function setFont($font = self::FONT_A) {
        $this->buffer .= self::ESC . "M" . chr($font);
        return $this;
    }

    /**
     * Set character spacing
     */
    public function setCharSpacing($spacing = 0) {
        $this->buffer .= self::ESC . " " . chr($spacing);
        return $this;
    }

    /**
     * Set line spacing
     */
    public function setLineSpacing($spacing = 30) {
        $this->buffer .= self::ESC . "3" . chr($spacing);
        return $this;
    }

    /**
     * Feed paper
     */
    public function feed($lines = 1) {
        $this->buffer .= str_repeat(self::LF, $lines);
        return $this;
    }

    /**
     * Feed and reverse
     */
    public function feedReverse($lines = 1) {
        $this->buffer .= self::ESC . "e" . chr($lines);
        return $this;
    }

    /**
     * Cut paper
     */
    public function cut($mode = 0, $lines = 3) {
        $this->feed($lines);
        $this->buffer .= self::GS . "V" . chr($mode);
        return $this;
    }

    /**
     * Partial cut
     */
    public function cutPartial($lines = 3) {
        return $this->cut(1, $lines);
    }

    /**
     * Print horizontal line
     */
    public function line($char = '-', $length = 48) {
        $this->textLine(str_repeat($char, $length));
        return $this;
    }

    /**
     * Print double line
     */
    public function doubleLine($length = 48) {
        return $this->line('=', $length);
    }

    /**
     * Print dashed line
     */
    public function dashedLine($length = 48) {
        return $this->line('-', $length);
    }

    /**
     * Print text in columns (2 columns)
     */
    public function columns($left, $right, $width = 48) {
        $leftLen = mb_strlen($left);
        $rightLen = mb_strlen($right);
        $spacing = $width - $leftLen - $rightLen;

        if ($spacing > 0) {
            $this->textLine($left . str_repeat(' ', $spacing) . $right);
        } else {
            $this->textLine($left);
            $this->align(self::ALIGN_RIGHT);
            $this->textLine($right);
            $this->align(self::ALIGN_LEFT);
        }

        return $this;
    }

    /**
     * Print barcode (CODE39, CODE128, EAN13, etc.)
     */
    public function barcode($data, $type = 73, $height = 80, $width = 3, $position = 2) {
        // Set barcode height
        $this->buffer .= self::GS . "h" . chr($height);

        // Set barcode width
        $this->buffer .= self::GS . "w" . chr($width);

        // Set HRI position (0=none, 1=above, 2=below, 3=both)
        $this->buffer .= self::GS . "H" . chr($position);

        // Print barcode
        $length = strlen($data);
        $this->buffer .= self::GS . "k" . chr($type) . chr($length) . $data;

        $this->feed();
        return $this;
    }

    /**
     * Print QR code
     */
    public function qrCode($data, $size = 6, $errorCorrection = 48) {
        // QR Code: Select model
        $this->buffer .= self::GS . "(k" . chr(4) . chr(0) . chr(49) . chr(65) . chr(50) . chr(0);

        // QR Code: Set size
        $this->buffer .= self::GS . "(k" . chr(3) . chr(0) . chr(49) . chr(67) . chr($size);

        // QR Code: Set error correction
        $this->buffer .= self::GS . "(k" . chr(3) . chr(0) . chr(49) . chr(69) . chr($errorCorrection);

        // QR Code: Store data
        $length = strlen($data) + 3;
        $pL = $length % 256;
        $pH = intval($length / 256);
        $this->buffer .= self::GS . "(k" . chr($pL) . chr($pH) . chr(49) . chr(80) . chr(48) . $data;

        // QR Code: Print
        $this->buffer .= self::GS . "(k" . chr(3) . chr(0) . chr(49) . chr(81) . chr(48);

        $this->feed();
        return $this;
    }

    /**
     * Print image (monochrome bitmap)
     */
    public function image($imageData, $width, $height) {
        // Image printing (basic implementation)
        // Full implementation would require image processing
        $this->buffer .= self::GS . "v0" . chr(0) .
                        chr($width % 256) . chr(intval($width / 256)) .
                        chr($height % 256) . chr(intval($height / 256)) .
                        $imageData;
        return $this;
    }

    /**
     * Enable/disable reverse printing
     */
    public function setReverse($enabled = true) {
        $this->buffer .= self::GS . "B" . chr($enabled ? 1 : 0);
        return $this;
    }

    /**
     * Open cash drawer
     */
    public function openDrawer($pin = 0) {
        $this->buffer .= self::DLE . self::DC4 . chr(1) . chr($pin * 2);
        return $this;
    }

    /**
     * Pulse cash drawer
     */
    public function pulse($pin = 0, $on = 100, $off = 500) {
        $this->buffer .= self::ESC . "p" . chr($pin) . chr($on) . chr($off);
        return $this;
    }

    /**
     * Generate and return ESC/POS data
     */
    public function generate() {
        return $this->buffer;
    }

    /**
     * Clear buffer
     */
    public function clear() {
        $this->buffer = '';
        return $this;
    }

    /**
     * Get buffer length
     */
    public function getLength() {
        return strlen($this->buffer);
    }
}
