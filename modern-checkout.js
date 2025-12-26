/**
 * Modern Checkout Interface
 * Replaces old payment buttons with modern dropdown selector
 * Version 3.0 - WITH RECEIPT INTERCEPTION
 */

(function() {
    'use strict';

    console.log('🎨 Modern Checkout v3.0 Loading...');

    // Global variable to track transaction
    let capturedTransactionId = null;
    let isProcessingTransaction = false;

    // CRITICAL: Override window.open BEFORE React loads to prevent auto-print
    const originalWindowOpen = window.open;
    window.open = function(url, ...args) {
        // Intercept receipt window opens
        if (url && url.includes('print-preview.html')) {
            console.log('🚫 BLOCKED auto-receipt open:', url);

            // Check if we have transaction_id
            if (!url.includes('?id=') && !url.includes('&id=')) {
                console.log('⏳ Waiting for transaction_id before opening receipt...');

                // Wait for transaction_id to be captured
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    const transactionId = capturedTransactionId ||
                                        sessionStorage.getItem('last_transaction_id') ||
                                        localStorage.getItem('last_transaction_id');

                    if (transactionId) {
                        clearInterval(checkInterval);
                        const newUrl = `${url}?id=${transactionId}`;
                        console.log('✅ Opening receipt with transaction_id:', newUrl);
                        originalWindowOpen.call(window, newUrl, ...args);
                    } else if (attempts > 50) { // 5 seconds max wait
                        clearInterval(checkInterval);
                        console.error('❌ Timeout waiting for transaction_id');
                        alert('Error: Could not fetch receipt data. Transaction completed but receipt unavailable.');
                    }
                }, 100);

                // Don't open window yet
                return null;
            } else {
                console.log('✅ Receipt URL has transaction_id, allowing open');
            }
        }

        // Call original for all other windows
        return originalWindowOpen.call(window, url, ...args);
    };

    // Enhanced Fetch Override to capture transaction_id
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';

        return originalFetch.apply(this, args).then(async response => {
            // Check if this is a transaction creation
            if (url.includes('/api/transactions') || url.includes('api/transactions')) {
                const method = args[1]?.method || 'GET';

                if (method.toUpperCase() === 'POST') {
                    // Clone and read response
                    const clonedResponse = response.clone();

                    try {
                        const data = await clonedResponse.json();

                        if (data.success && data.transaction_id) {
                            capturedTransactionId = data.transaction_id;
                            sessionStorage.setItem('last_transaction_id', data.transaction_id);
                            localStorage.setItem('last_transaction_id', data.transaction_id);

                            console.log('💾 [FETCH] Transaction ID captured:', data.transaction_id);

                            // Dispatch event
                            window.dispatchEvent(new CustomEvent('transaction-created', {
                                detail: { transaction_id: data.transaction_id }
                            }));
                        }
                    } catch (error) {
                        console.warn('⚠️ Could not parse transaction response:', error);
                    }
                }
            }

            return response;
        });
    };

    // XHR Override as backup
    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(...args) {
        this.addEventListener('load', function() {
            const url = this._url || '';
            if (url.includes('/api/transactions') && this._method === 'POST') {
                try {
                    const data = JSON.parse(this.responseText);
                    if (data.success && data.transaction_id) {
                        capturedTransactionId = data.transaction_id;
                        sessionStorage.setItem('last_transaction_id', data.transaction_id);
                        localStorage.setItem('last_transaction_id', data.transaction_id);

                        console.log('💾 [XHR] Transaction ID captured:', data.transaction_id);
                    }
                } catch (error) {
                    // Ignore parse errors
                }
            }
        });
        return originalXHRSend.apply(this, args);
    };

    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._method = method;
        this._url = url;
        return originalXHROpen.call(this, method, url, ...args);
    };

    // Utility function to wait for element
    function waitForElement(selector, callback, maxWait = 10000) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                callback(element);
            } else if (Date.now() - startTime > maxWait) {
                clearInterval(interval);
            }
        }, 100);
    }

    // Wait for React app to load
    async function waitForApp() {
        return new Promise((resolve) => {
            const checkApp = setInterval(() => {
                const root = document.querySelector('#root');
                if (root && root.innerHTML.trim() !== '') {
                    clearInterval(checkApp);
                    setTimeout(resolve, 1000);
                }
            }, 100);
        });
    }

    // Inject custom styles
    function injectStyles() {
        if (document.getElementById('modern-checkout-styles')) return;

        const style = document.createElement('style');
        style.id = 'modern-checkout-styles';
        style.textContent = `
            #modern-payment-container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 25px;
                margin: 20px 0;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }

            #modern-payment-container h3 {
                color: white;
                margin: 0 0 20px 0;
                font-size: 20px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .modern-form-group {
                margin-bottom: 20px;
            }

            .modern-form-group label {
                display: block;
                color: rgba(255, 255, 255, 0.95);
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 14px;
            }

            .modern-select,
            .modern-input {
                width: 100%;
                padding: 14px 16px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.15);
                color: white;
                font-size: 15px;
                font-weight: 500;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .modern-select:focus,
            .modern-input:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.5);
                background: rgba(255, 255, 255, 0.25);
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
            }

            .modern-select option {
                background: #764ba2;
                color: white;
            }

            .modern-input::placeholder {
                color: rgba(255, 255, 255, 0.6);
            }

            #modern-complete-sale {
                width: 100%;
                padding: 16px;
                background: white;
                color: #764ba2;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }

            #modern-complete-sale:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                background: #f0f0f0;
            }

            #modern-complete-sale:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            #modern-complete-sale:active:not(:disabled) {
                transform: translateY(0);
            }

            /* Hide old payment buttons */
            button:has-text("Pay Cash"),
            button:has-text("Pay Card"),
            button:has-text("Mobile Money"),
            [class*="payment"] button {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Replace checkout interface
    function replaceCheckoutInterface() {
        // Find the section panel that contains "Restaurant" or "Bar" or "Lodge"
        const panels = document.querySelectorAll('[class*="panel"], [class*="section"], div');
        let targetPanel = null;

        panels.forEach(panel => {
            const text = panel.textContent;
            if ((text.includes('Restaurant') || text.includes('Bar') || text.includes('Lodge')) &&
                (text.includes('Pay Cash') || text.includes('Total') || text.includes('UGX'))) {
                targetPanel = panel;
            }
        });

        if (!targetPanel) return;

        // Check if already replaced
        if (document.getElementById('modern-payment-container')) return;

        // Create modern payment container
        const modernContainer = document.createElement('div');
        modernContainer.id = 'modern-payment-container';
        modernContainer.innerHTML = `
            <h3>💳 Complete Sale</h3>

            <div class="modern-form-group">
                <label for="modern-payment-method">Payment Method *</label>
                <select id="modern-payment-method" class="modern-select" required>
                    <option value="">Select Payment Method</option>
                    <option value="cash">💵 Cash</option>
                    <option value="mobile_money">📱 Mobile Money</option>
                    <option value="card">💳 Card</option>
                </select>
            </div>

            <div class="modern-form-group">
                <label for="modern-customer-name">Customer Name (Optional)</label>
                <input
                    type="text"
                    id="modern-customer-name"
                    class="modern-input"
                    placeholder="Enter customer name"
                >
            </div>

            <button id="modern-complete-sale" disabled>
                Complete Sale
            </button>
        `;

        // Insert before old buttons
        const oldButtons = targetPanel.querySelectorAll('button');
        if (oldButtons.length > 0) {
            oldButtons[0].parentNode.insertBefore(modernContainer, oldButtons[0]);
        } else {
            targetPanel.appendChild(modernContainer);
        }

        // Add event listeners
        const paymentSelect = document.getElementById('modern-payment-method');
        const customerInput = document.getElementById('modern-customer-name');
        const completeSaleBtn = document.getElementById('modern-complete-sale');

        // Enable button when payment method is selected
        paymentSelect.addEventListener('change', function() {
            completeSaleBtn.disabled = !this.value;
        });

        // Handle Complete Sale click
        completeSaleBtn.addEventListener('click', async function() {
            const paymentMethod = paymentSelect.value;
            const customerName = customerInput.value;

            if (!paymentMethod) {
                alert('Please select a payment method');
                return;
            }

            if (isProcessingTransaction) {
                console.log('⚠️ Transaction already in progress');
                return;
            }

            // Clear old transaction ID
            capturedTransactionId = null;
            sessionStorage.removeItem('last_transaction_id');
            localStorage.removeItem('last_transaction_id');

            // Disable button during processing
            completeSaleBtn.disabled = true;
            completeSaleBtn.textContent = 'Processing...';
            isProcessingTransaction = true;

            try {
                // Store payment method for the API
                sessionStorage.setItem('selected_payment_method', paymentMethod);
                sessionStorage.setItem('customer_name', customerName);

                console.log('🛒 Starting transaction...');

                // Find and click the original React submit button
                const allButtons = document.querySelectorAll('button');
                let cashButton = null;

                allButtons.forEach(btn => {
                    if (btn.textContent.toLowerCase().includes('pay cash')) {
                        cashButton = btn;
                    }
                });

                if (cashButton) {
                    // Trigger the React button
                    console.log('✅ Triggering React payment button');
                    cashButton.click();

                    // Wait a moment for transaction to process
                    setTimeout(() => {
                        isProcessingTransaction = false;
                        paymentSelect.value = '';
                        customerInput.value = '';
                        completeSaleBtn.disabled = true;
                        completeSaleBtn.textContent = 'Complete Sale';
                    }, 2000);
                } else {
                    throw new Error('Payment system not ready. Please try again.');
                }

            } catch (error) {
                console.error('Checkout error:', error);
                alert('Error: ' + error.message);

                isProcessingTransaction = false;
                completeSaleBtn.disabled = false;
                completeSaleBtn.textContent = 'Complete Sale';
            }
        });
    }

    // Main initialization
    async function init() {
        console.log('🎨 Initializing Modern Checkout v3.0...');

        await waitForApp();

        // Inject styles
        injectStyles();

        // Apply checkout replacement
        function applyCheckout() {
            replaceCheckoutInterface();
        }

        // Initial application
        setTimeout(applyCheckout, 1000);

        // Re-apply when DOM changes (for React re-renders)
        const observer = new MutationObserver(() => {
            applyCheckout();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also re-apply periodically (backup)
        setInterval(applyCheckout, 2000);

        console.log('✅ Modern Checkout v3.0 Loaded!');
        console.log('🔒 Receipt auto-print blocked - waiting for transaction_id');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
