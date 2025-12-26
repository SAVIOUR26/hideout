/**
 * Modern Checkout Interface
 * Replaces the old payment/checkout UI with modern interface from pos.html
 * Injected into the React app after it loads
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
            /* Modern Checkout Interface Styles */

            /* Modern payment method selector */
            .modern-payment-selector {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
                margin: 15px 0;
            }

            .payment-option {
                padding: 20px 15px;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                text-align: center;
                transition: all 0.3s;
                font-size: 14px;
                font-weight: 600;
                color: #2c3e50;
            }

            .payment-option:hover {
                border-color: #3498db;
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
                transform: translateY(-2px);
            }

            .payment-option.selected {
                border-color: #3498db;
                background: #e3f2fd;
                color: #1976d2;
            }

            .payment-option .icon {
                font-size: 32px;
                margin-bottom: 8px;
                display: block;
            }

            .payment-option .label {
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
            }

            /* Modern cart styling */
            .modern-cart-total {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 25px;
                border-radius: 12px;
                margin: 20px 0;
                color: white;
                box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
            }

            .modern-cart-total .label {
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .modern-cart-total .amount {
                font-size: 36px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            /* Modern form inputs */
            .modern-form-group {
                margin: 15px 0;
            }

            .modern-form-group label {
                display: block;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .modern-form-group input,
            .modern-form-group select {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                transition: all 0.3s;
            }

            .modern-form-group input:focus,
            .modern-form-group select:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }

            /* Modern checkout button */
            .modern-checkout-btn {
                width: 100%;
                padding: 18px;
                border: none;
                background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
                color: white;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .modern-checkout-btn:hover {
                background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
                box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
                transform: translateY(-2px);
            }

            .modern-checkout-btn:disabled {
                background: #95a5a6;
                cursor: not-allowed;
                box-shadow: none;
                transform: none;
            }

            .modern-checkout-btn:active:not(:disabled) {
                transform: translateY(0);
            }

            /* Hide old payment select if we're using modern selector */
            select[name="payment_method"].hidden-for-modern {
                display: none;
            }

            /* Product grid improvements */
            .products-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 15px;
            }

            .product-card {
                transition: all 0.2s;
                cursor: pointer;
            }

            .product-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            }

            /* Cart item styling */
            .cart-item {
                padding: 15px;
                border-bottom: 1px solid #ecf0f1;
                transition: background 0.2s;
            }

            .cart-item:hover {
                background: #f8f9fa;
            }

            /* Quantity controls */
            .qty-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .qty-btn {
                width: 32px;
                height: 32px;
                border: none;
                background: #3498db;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                transition: all 0.2s;
            }

            .qty-btn:hover {
                background: #2980b9;
                transform: scale(1.1);
            }

            .qty-btn:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }

    // Modernize payment method selector
    function modernizePaymentMethod() {
        // Find all payment method selects
        const selects = document.querySelectorAll('select[name="payment_method"], #payment-method, select');

        selects.forEach(select => {
            // Check if this is likely a payment method selector
            const options = Array.from(select.options);
            const hasPaymentOptions = options.some(opt =>
                opt.value.includes('cash') ||
                opt.value.includes('mobile') ||
                opt.value.includes('card') ||
                opt.text.toLowerCase().includes('cash') ||
                opt.text.toLowerCase().includes('mobile') ||
                opt.text.toLowerCase().includes('card')
            );

            if (!hasPaymentOptions) return;

            // Don't modernize if already done
            if (select.classList.contains('modernized')) return;

            select.classList.add('modernized', 'hidden-for-modern');

            // Create modern selector
            const modernSelector = document.createElement('div');
            modernSelector.className = 'modern-payment-selector';
            modernSelector.innerHTML = `
                <div class="payment-option" data-value="cash">
                    <span class="icon">💵</span>
                    <span class="label">Cash</span>
                </div>
                <div class="payment-option" data-value="mobile_money">
                    <span class="icon">📱</span>
                    <span class="label">Mobile Money</span>
                </div>
                <div class="payment-option" data-value="card">
                    <span class="icon">💳</span>
                    <span class="label">Card</span>
                </div>
            `;

            // Insert after the select (or its label)
            const label = select.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.after(modernSelector);
            } else {
                select.after(modernSelector);
            }

            // Add click handlers
            modernSelector.querySelectorAll('.payment-option').forEach(option => {
                option.addEventListener('click', function() {
                    // Remove selected from all
                    modernSelector.querySelectorAll('.payment-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });

                    // Add selected to this one
                    this.classList.add('selected');

                    // Update the hidden select
                    select.value = this.dataset.value;

                    // Trigger change event
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    select.dispatchEvent(new Event('input', { bubbles: true }));
                });
            });

            // Sync select changes back to modern selector
            select.addEventListener('change', function() {
                modernSelector.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.toggle('selected', opt.dataset.value === select.value);
                });
            });
        });
    }

    // Modernize cart total display
    function modernizeCartTotal() {
        // Find elements that look like cart totals
        const possibleTotals = document.querySelectorAll('[class*="total"], [class*="Total"]');

        possibleTotals.forEach(el => {
            const text = el.textContent;

            // Check if it contains currency amount
            if (text.includes('UGX') || text.includes('Total')) {
                // Don't modernize if already done
                if (el.classList.contains('modern-cart-total')) return;

                // Check if this is a total amount display (not just a label)
                const amount = text.match(/UGX\s*([\d,]+)/);
                if (amount) {
                    el.classList.add('modern-cart-total');

                    // Restructure content
                    el.innerHTML = `
                        <div class="label">Total Amount</div>
                        <div class="amount">UGX ${amount[1]}</div>
                    `;
                }
            }
        });
    }

    // Modernize buttons
    function modernizeButtons() {
        // Find checkout/submit buttons
        const buttons = document.querySelectorAll('button[type="submit"], button');

        buttons.forEach(btn => {
            const text = btn.textContent.toLowerCase();

            if (text.includes('checkout') || text.includes('complete') || text.includes('pay') || text.includes('submit')) {
                if (!btn.classList.contains('modern-checkout-btn')) {
                    btn.classList.add('modern-checkout-btn');
                }
            }
        });
    }

    // Main initialization
    async function init() {
        console.log('🎨 Initializing Modern Checkout Interface...');

        await waitForApp();

        // Inject styles
        injectStyles();

        // Apply modernizations
        function applyModernizations() {
            modernizePaymentMethod();
            modernizeCartTotal();
            modernizeButtons();
        }

        // Initial application
        setTimeout(applyModernizations, 1000);

        // Re-apply when DOM changes (for React re-renders)
        const observer = new MutationObserver(() => {
            applyModernizations();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also re-apply periodically (backup)
        setInterval(applyModernizations, 3000);

        console.log('✅ Modern Checkout Interface Loaded!');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
