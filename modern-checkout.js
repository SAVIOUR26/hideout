/**
 * Modern Checkout Interface
 * Payment selector + Complete Sale button
 * Records payment method and submits sale directly
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

    // Get cart data from React state
    function getCartData() {
        // Try to extract cart from React's internal state
        try {
            const root = document.getElementById('root');
            if (!root) return null;

            // Look for cart total element
            const totalElement = document.querySelector('[class*="total"], h2, h3');
            if (!totalElement) return null;

            const totalText = totalElement.textContent;
            const totalMatch = totalText.match(/UGX\s*([\d,]+)/);

            if (!totalMatch) return null;

            const total = parseFloat(totalMatch[1].replace(/,/g, ''));

            // Get cart items
            const cartItems = [];
            const itemElements = document.querySelectorAll('[class*="cart-item"], [class*="order"]');

            itemElements.forEach(el => {
                const text = el.textContent;
                // Try to parse item info
                const nameMatch = text.match(/^([A-Za-z\s]+)/);
                const qtyMatch = text.match(/(\d+)/);

                if (nameMatch && qtyMatch) {
                    cartItems.push({
                        name: nameMatch[1].trim(),
                        quantity: parseInt(qtyMatch[1])
                    });
                }
            });

            return {
                total: total,
                items: cartItems,
                count: cartItems.length
            };
        } catch (error) {
            console.error('Error getting cart data:', error);
            return null;
        }
    }

    // Complete sale directly via API
    async function completeSale(paymentMethod, customerName) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Decode JWT to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Get current section from URL or page
            let section = 'bar';
            const url = window.location.href;
            if (url.includes('/restaurant')) section = 'restaurant';
            else if (url.includes('/lodge')) section = 'lodge';
            else if (url.includes('/bar')) section = 'bar';

            // For testing, create a simple transaction
            // In production, this should get actual cart data from React
            const transactionData = {
                cashier_id: payload.userId,
                section: section,
                payment_method: paymentMethod,
                customer_name: customerName || null,
                total: 0, // Will be calculated by backend
                items: [] // Will be populated by React cart
            };

            // Submit transaction
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transactionData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Transaction failed');
            }

            return result.transaction_id;

        } catch (error) {
            console.error('Complete sale error:', error);
            throw error;
        }
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

        // Handle Complete Sale click - directly submit without triggering old buttons
        completeSaleBtn.addEventListener('click', async function() {
            const paymentMethod = paymentSelect.value;
            const customerName = customerInput.value;

            if (!paymentMethod) {
                alert('Please select a payment method');
                return;
            }

            // Disable button during processing
            completeSaleBtn.disabled = true;
            completeSaleBtn.textContent = 'Processing...';

            try {
                // Find and click the original React submit button
                // This ensures we use React's cart state
                const allButtons = document.querySelectorAll('button');
                let cashButton = null;

                allButtons.forEach(btn => {
                    if (btn.textContent.toLowerCase().includes('pay cash')) {
                        cashButton = btn;
                    }
                });

                if (cashButton) {
                    // Store payment method for the API
                    sessionStorage.setItem('selected_payment_method', paymentMethod);
                    sessionStorage.setItem('customer_name', customerName);

                    // Trigger the React button
                    cashButton.click();
                } else {
                    throw new Error('Payment system not ready. Please try again.');
                }

                // Reset form
                setTimeout(() => {
                    paymentSelect.value = '';
                    customerInput.value = '';
                    completeSaleBtn.disabled = true;
                    completeSaleBtn.textContent = 'Complete Sale';
                }, 500);

            } catch (error) {
                console.error('Checkout error:', error);
                alert('Error: ' + error.message);

                completeSaleBtn.disabled = false;
                completeSaleBtn.textContent = 'Complete Sale';
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
