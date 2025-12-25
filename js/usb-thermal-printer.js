/**
 * USB Thermal Printer Library - WebUSB API
 * Industry Standard Implementation for POS Systems
 *
 * Standards Compliance:
 * - WebUSB API (W3C Standard for browser USB communication)
 * - ESC/POS Protocol (Epson Standard Point of Sale)
 * - ISO/IEC 15416 (Barcode Print Quality)
 * - Cash Drawer Control: ESC p (Standard pulse command)
 *
 * Supported Browsers:
 * - Chrome 61+ (Full support)
 * - Edge 79+ (Full support)
 * - Opera 48+ (Full support)
 *
 * Supported Printers:
 * - Epson TM Series (TM-T20, TM-T88, TM-T82, etc.)
 * - Star Micronics (TSP100, TSP650, TSP700)
 * - Citizen CT-S Series
 * - Bixolon SRP Series
 * - Any ESC/POS compatible 80mm thermal printer
 *
 * Cash Drawer Support:
 * - Standard RJ11/RJ12 cash drawer interface
 * - ESC/POS pulse command (ESC p)
 * - Configurable pulse duration and timing
 *
 * Usage Example:
 *
 * const printer = new USBThermalPrinter();
 * await printer.connect();
 * await printer.printReceipt(receiptData);
 * await printer.openCashDrawer();
 * await printer.disconnect();
 *
 * @version 1.0.0
 * @license MIT
 * @author HGM POS System
 */

class USBThermalPrinter {
    constructor() {
        this.device = null;
        this.endpoint = null;
        this.connected = false;

        // Supported vendor IDs (major thermal printer manufacturers)
        this.VENDOR_IDS = {
            EPSON: 0x04b8,
            STAR: 0x0519,
            CITIZEN: 0x1D90,
            BIXOLON: 0x1504,
            CUSTOM: 0x0DD4,
            ZEBRA: 0x0A5F
        };

        // ESC/POS Commands (Industry Standard)
        this.ESC = 0x1B;  // Escape
        this.GS = 0x1D;   // Group Separator
        this.LF = 0x0A;   // Line Feed
        this.CR = 0x0D;   // Carriage Return
        this.HT = 0x09;   // Horizontal Tab
        this.DLE = 0x10;  // Data Link Escape
    }

    /**
     * Check if WebUSB is supported
     * @returns {boolean}
     */
    static isSupported() {
        return 'usb' in navigator;
    }

    /**
     * Request device access and connect
     * Opens browser's device selection dialog
     * Industry Standard: WebUSB requestDevice() API
     */
    async connect() {
        if (!USBThermalPrinter.isSupported()) {
            throw new Error('WebUSB is not supported. Please use Chrome, Edge, or Opera browser.');
        }

        try {
            // Request USB device (user selects from list)
            this.device = await navigator.usb.requestDevice({
                filters: Object.values(this.VENDOR_IDS).map(vendorId => ({ vendorId }))
            });

            // Open device
            await this.device.open();

            // Select configuration (usually configuration 1)
            if (this.device.configuration === null) {
                await this.device.selectConfiguration(1);
            }

            // Claim interface (usually interface 0)
            const interfaceNumber = this.device.configuration.interfaces[0].interfaceNumber;
            await this.device.claimInterface(interfaceNumber);

            // Find bulk OUT endpoint for sending data
            const interface = this.device.configuration.interfaces[0];
            const alternate = interface.alternates[0];
            this.endpoint = alternate.endpoints.find(
                ep => ep.direction === 'out' && ep.type === 'bulk'
            );

            if (!this.endpoint) {
                throw new Error('Could not find bulk OUT endpoint');
            }

            this.connected = true;
            console.log('✅ USB Thermal Printer connected:', this.device.productName);

            // Initialize printer
            await this.initialize();

            return {
                success: true,
                device: this.device.productName,
                manufacturer: this.device.manufacturerName
            };

        } catch (error) {
            console.error('❌ Failed to connect to printer:', error);
            throw new Error(`Connection failed: ${error.message}`);
        }
    }

    /**
     * Send raw data to printer
     * @param {Uint8Array} data
     */
    async send(data) {
        if (!this.connected) {
            throw new Error('Printer not connected. Call connect() first.');
        }

        try {
            await this.device.transferOut(this.endpoint.endpointNumber, data);
        } catch (error) {
            console.error('❌ Failed to send data to printer:', error);
            throw new Error(`Send failed: ${error.message}`);
        }
    }

    /**
     * Initialize printer
     * ESC/POS Command: ESC @ (Initialize)
     */
    async initialize() {
        await this.send(new Uint8Array([this.ESC, 0x40]));
    }

    /**
     * Print text
     * @param {string} text
     */
    async printText(text) {
        const encoder = new TextEncoder();
        await this.send(encoder.encode(text));
    }

    /**
     * Print text with line feed
     * @param {string} text
     */
    async printLine(text = '') {
        await this.printText(text + '\n');
    }

    /**
     * Feed paper (line breaks)
     * @param {number} lines - Number of lines to feed
     */
    async feed(lines = 1) {
        const data = new Uint8Array(lines).fill(this.LF);
        await this.send(data);
    }

    /**
     * Set text alignment
     * ESC/POS: ESC a n
     * @param {string} align - 'left', 'center', 'right'
     */
    async setAlignment(align = 'left') {
        const alignments = { left: 0, center: 1, right: 2 };
        await this.send(new Uint8Array([this.ESC, 0x61, alignments[align]]));
    }

    /**
     * Set text bold
     * ESC/POS: ESC E n
     * @param {boolean} enabled
     */
    async setBold(enabled = true) {
        await this.send(new Uint8Array([this.ESC, 0x45, enabled ? 1 : 0]));
    }

    /**
     * Set text size
     * ESC/POS: GS ! n
     * @param {number} width - 1-8
     * @param {number} height - 1-8
     */
    async setTextSize(width = 1, height = 1) {
        width = Math.max(1, Math.min(8, width)) - 1;
        height = Math.max(1, Math.min(8, height)) - 1;
        const n = (width << 4) | height;
        await this.send(new Uint8Array([this.GS, 0x21, n]));
    }

    /**
     * Print horizontal line
     * @param {number} length - Character width
     * @param {string} char - Character to use
     */
    async printLine(char = '-', length = 48) {
        await this.printText(char.repeat(length) + '\n');
    }

    /**
     * Print QR Code
     * ESC/POS: GS ( k (QR Code model 2)
     * Industry Standard: QR Code Model 2, ISO/IEC 18004
     * @param {string} data - Data to encode
     * @param {number} size - Module size 1-16 (default: 6)
     * @param {number} errorCorrection - Error correction level 48-51 (default: 48 = L)
     */
    async printQRCode(data, size = 6, errorCorrection = 48) {
        const dataBytes = new TextEncoder().encode(data);
        const length = dataBytes.length + 3;
        const pL = length % 256;
        const pH = Math.floor(length / 256);

        // QR Code: Select model
        await this.send(new Uint8Array([this.GS, 0x28, 0x6B, 4, 0, 49, 65, 50, 0]));

        // QR Code: Set module size
        await this.send(new Uint8Array([this.GS, 0x28, 0x6B, 3, 0, 49, 67, size]));

        // QR Code: Set error correction
        await this.send(new Uint8Array([this.GS, 0x28, 0x6B, 3, 0, 49, 69, errorCorrection]));

        // QR Code: Store data
        const storeCommand = new Uint8Array([this.GS, 0x28, 0x6B, pL, pH, 49, 80, 48]);
        const combined = new Uint8Array(storeCommand.length + dataBytes.length);
        combined.set(storeCommand);
        combined.set(dataBytes, storeCommand.length);
        await this.send(combined);

        // QR Code: Print
        await this.send(new Uint8Array([this.GS, 0x28, 0x6B, 3, 0, 49, 81, 48]));
    }

    /**
     * Print barcode
     * ESC/POS: GS k
     * @param {string} data - Barcode data
     * @param {number} type - Barcode type (73 = CODE39, 69 = CODE128, 67 = EAN13)
     * @param {number} height - Barcode height in dots (default: 80)
     * @param {number} width - Module width 2-6 (default: 3)
     */
    async printBarcode(data, type = 73, height = 80, width = 3) {
        // Set barcode height
        await this.send(new Uint8Array([this.GS, 0x68, height]));

        // Set barcode width
        await this.send(new Uint8Array([this.GS, 0x77, width]));

        // Set HRI position (2 = below)
        await this.send(new Uint8Array([this.GS, 0x48, 2]));

        // Print barcode
        const dataBytes = new TextEncoder().encode(data);
        const command = new Uint8Array([this.GS, 0x6B, type, dataBytes.length]);
        const combined = new Uint8Array(command.length + dataBytes.length);
        combined.set(command);
        combined.set(dataBytes, command.length);
        await this.send(combined);
    }

    /**
     * Cut paper
     * ESC/POS: GS V (Partial cut)
     * Industry Standard: Most thermal printers support auto-cutter
     * @param {boolean} partial - Partial cut (true) or full cut (false)
     */
    async cut(partial = true) {
        await this.feed(3); // Feed before cutting (safety margin)
        await this.send(new Uint8Array([this.GS, 0x56, partial ? 1 : 0]));
    }

    /**
     * Open cash drawer
     * ESC/POS: ESC p m t1 t2
     * Industry Standard: Standard cash drawer pulse command
     *
     * This is the most critical function for retail POS systems.
     * The cash drawer is connected to the printer via RJ11/RJ12 cable.
     *
     * @param {number} pin - Drawer pin (0 = pin 2, 1 = pin 5, default: 0)
     * @param {number} onTime - Pulse ON time in ms (default: 100ms)
     * @param {number} offTime - Pulse OFF time in ms (default: 500ms)
     *
     * Standard wiring:
     * - Pin 2 (most common): Used by most cash drawers
     * - Pin 5 (alternative): Some drawer models
     *
     * Pulse timing:
     * - ON time: 100-200ms (standard)
     * - OFF time: 500ms (standard)
     */
    async openCashDrawer(pin = 0, onTime = 100, offTime = 500) {
        // Convert milliseconds to units (1 unit = 2ms)
        const t1 = Math.floor(onTime / 2);
        const t2 = Math.floor(offTime / 2);

        // ESC p m t1 t2
        // m: 0 = drawer kick connector pin 2, 1 = pin 5
        await this.send(new Uint8Array([this.ESC, 0x70, pin, t1, t2]));

        console.log(`💰 Cash drawer opened (pin ${pin === 0 ? '2' : '5'}, ${onTime}ms/${offTime}ms)`);
    }

    /**
     * Print complete receipt
     * Industry standard receipt format for 80mm thermal paper
     * @param {Object} receiptData - Receipt data object
     */
    async printReceipt(receiptData) {
        try {
            // Header
            await this.setAlignment('center');
            await this.setBold(true);
            await this.setTextSize(2, 2);
            await this.printLine(receiptData.businessName || 'HGM POS');

            await this.setTextSize(1, 1);
            await this.setBold(false);
            await this.printLine(receiptData.phone || '');
            await this.printLine(receiptData.email || '');
            await this.printLine(receiptData.address || '');
            await this.feed(1);
            await this.printLine('=', 48);
            await this.feed(1);

            // Transaction Info
            await this.setAlignment('left');
            await this.printLine(`Receipt #: ${receiptData.transactionId}`);
            await this.printLine(`Date: ${receiptData.date}`);
            await this.printLine(`Cashier: ${receiptData.cashier}`);
            await this.printLine(`Section: ${receiptData.section.toUpperCase()}`);
            await this.printLine(`Payment: ${receiptData.paymentMethod.toUpperCase()}`);
            await this.feed(1);
            await this.printLine('-', 48);
            await this.feed(1);

            // Items
            await this.printLine('ITEM              QTY  PRICE   TOTAL');
            await this.printLine('-', 48);

            for (const item of receiptData.items) {
                // Item name
                const name = item.name.substring(0, 18).padEnd(18);
                await this.printText(name);

                // Quantity, price, total (right-aligned)
                const qty = String(item.quantity).padStart(3);
                const price = String(Math.round(item.price)).padStart(6);
                const total = String(Math.round(item.total)).padStart(7);
                await this.printLine(`${qty} ${price} ${total}`);
            }

            await this.feed(1);
            await this.printLine('-', 48);

            // Total
            await this.setBold(true);
            await this.setTextSize(2, 2);
            const totalText = `TOTAL: UGX ${receiptData.total}`;
            await this.setAlignment('center');
            await this.printLine(totalText);
            await this.setTextSize(1, 1);
            await this.setBold(false);
            await this.feed(1);
            await this.printLine('=', 48);
            await this.feed(1);

            // QR Code (for receipt verification)
            await this.setAlignment('center');
            const qrData = `RECEIPT:${receiptData.transactionId}:${receiptData.total}`;
            await this.printQRCode(qrData, 6);
            await this.feed(1);

            // Footer
            await this.setAlignment('center');
            await this.printLine(receiptData.footerMessage || 'Thank you!');
            await this.feed(2);
            await this.printLine('Powered by HGM POS v2.0');
            await this.feed(3);

            // Cut paper
            await this.cut(true);

            console.log('✅ Receipt printed successfully');
            return { success: true, message: 'Receipt printed' };

        } catch (error) {
            console.error('❌ Failed to print receipt:', error);
            throw new Error(`Print failed: ${error.message}`);
        }
    }

    /**
     * Disconnect from printer
     */
    async disconnect() {
        if (this.device) {
            try {
                await this.device.close();
                this.connected = false;
                this.device = null;
                this.endpoint = null;
                console.log('✅ Printer disconnected');
            } catch (error) {
                console.error('❌ Error disconnecting:', error);
            }
        }
    }

    /**
     * Check printer status
     * ESC/POS: DLE EOT n (Request status)
     * @returns {Object} Status object
     */
    async getStatus() {
        // This requires bidirectional communication (IN endpoint)
        // Most implementations don't need this for basic printing
        return {
            connected: this.connected,
            device: this.device ? this.device.productName : null,
            manufacturer: this.device ? this.device.manufacturerName : null
        };
    }
}

// Export for use in application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = USBThermalPrinter;
}
