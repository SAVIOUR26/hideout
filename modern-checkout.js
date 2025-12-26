/**
 * Modern Checkout Interface
 * Replaces payment buttons with dropdown selector + Complete Sale button
 */

(function() {
    'use strict';

    // Wait for React app to load
    function waitForApp() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const root = document.getElementById('root');
                if (root && root.innerHTML.trim() !== '') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    // Inject modern checkout styles
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Hide original payment buttons */
            button:has-text("Pay Cash"),
            button:has-text("Pay Card"),
            button:has-text("Mobile Money"),
            button:has-text("Open Cash Drawer") {
                display: none !important;
            }

            /* Modern Checkout Styles */
            .modern-checkout-container {
                padding: 15px;
                margin-top: 15px;
            }

            .modern-form-group {
                margin-bottom: 15px;
            }

            .modern-form-group label {
                display: block;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 8px;
                font-size: 14px;
            }

            /* Payment dropdown */
            .modern-payment-select {
                width: 100%;
                padding: 14px 16px;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                background: white;
                color: #2c3e50;
                cursor: pointer;
                transition: all 0.3s;
            }

            .modern-payment-select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .modern-payment-select:hover {
                border-color: #667eea;
            }

            /* Complete Sale Button */
            .modern-complete-sale-btn {
                width: 100%;
                padding: 18px;
                border: none;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .modern-complete-sale-btn:hover:not(:disabled) {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                transform: translateY(-2px);
            }

            .modern-complete-sale-btn:disabled {
                background: #95a5a6;
                cursor: not-allowed;
                box-shadow: none;
                transform: none;
                opacity: 0.6;
            }

            .modern-complete-sale-btn:active:not(:disabled) {
                transform: translateY(0);
            }

            /* Customer name input */
            .modern-customer-input {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                transition: all 0.3s;
            }

            .modern-customer-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            /* Hide old buttons */
            .hidden-old-button {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Replace payment buttons with modern checkout
    function replaceCheckoutInterface() {
        // Find all buttons that contain payment-related text
        const buttons = document.querySelectorAll('button');
        let paymentButtonsContainer = null;

        buttons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes('pay cash') ||
                text.includes('pay card') ||
                text.includes('mobile money') ||
                text.includes('pesapal')) {

                // Hide the button
                btn.classList.add('hidden-old-button');

                // Find the parent container
                if (!paymentButtonsContainer) {
                    paymentButtonsContainer = btn.parentElement;
                }
            }

            // Hide "Open Cash Drawer" button
            if (text.includes('open cash drawer')) {
                btn.classList.add('hidden-old-button');
            }
        });

        // If we found payment buttons, inject our modern checkout
        if (paymentButtonsContainer && !document.querySelector('.modern-checkout-container')) {

            // Check if already added
            const existing = paymentButtonsContainer.querySelector('.modern-checkout-container');
            if (existing) return;

            // Create modern checkout form
            const modernCheckout = document.createElement('div');
            modernCheckout.className = 'modern-checkout-container';
            modernCheckout.innerHTML = `
                <div class="modern-form-group">
                    <label for="modern-payment-method">Payment Method</label>
                    <select id="modern-payment-method" class="modern-payment-select" required>
                        <option value="">Select Payment Method</option>
                        <option value="cash">💵 Cash</option>
                        <option value="mobile_money">📱 Merchant (Mobile Money)</option>
                        <option value="card">💳 Card (Terminal)</option>
                    </select>
                </div>

                <div class="modern-form-group">
                    <label for="modern-customer-name">Customer Name (Optional)</label>
                    <input
                        type="text"
                        id="modern-customer-name"
                        class="modern-customer-input"
                        placeholder="Enter customer name"
                    />
                </div>

                <button
                    type="button"
                    id="modern-complete-sale"
                    class="modern-complete-sale-btn"
                    disabled
                >
                    Complete Sale
                </button>
            `;

            // Insert the modern checkout
            paymentButtonsContainer.appendChild(modernCheckout);

            // Add event listeners
            setupEventListeners();
        }
    }

    // Setup event listeners for the modern checkout
    function setupEventListeners() {
        const paymentSelect = document.getElementById('modern-payment-method');
        const customerInput = document.getElementById('modern-customer-name');
        const completeSaleBtn = document.getElementById('modern-complete-sale');

        if (!paymentSelect || !completeSaleBtn) return;

        // Enable/disable Complete Sale button based on payment selection
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

            // Find and trigger the original payment button click
            // This ensures we use the React app's existing checkout logic
            const buttons = document.querySelectorAll('button');
            let targetButton = null;

            buttons.forEach(btn => {
                const text = btn.textContent.toLowerCase();
                if (paymentMethod === 'cash' && text.includes('pay cash')) {
                    targetButton = btn;
                } else if (paymentMethod === 'card' && text.includes('pay card')) {
                    targetButton = btn;
                } else if (paymentMethod === 'mobile_money' && text.includes('mobile money')) {
                    targetButton = btn;
                }
            });

            if (targetButton) {
                // Store customer name in sessionStorage for receipt
                if (customerName) {
                    sessionStorage.setItem('customer_name', customerName);
                }

                // Trigger the original button
                targetButton.click();

                // Reset form
                setTimeout(() => {
                    paymentSelect.value = '';
                    customerInput.value = '';
                    completeSaleBtn.disabled = true;
                }, 500);
            } else {
                alert('Payment method not available. Please try again.');
            }
        });
    }

    // Main initialization
    async function init() {
        console.log('🎨 Initializing Modern Checkout Interface...');

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

        console.log('✅ Modern Checkout Interface Loaded!');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
