/**
 * Modern Checkout Interface
 * Simple dropdown for payment method with professional receipt printing
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

            /* Payment dropdown */
            select[name="payment_method"],
            #payment-method,
            select.payment-select {
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

            select[name="payment_method"]:focus,
            #payment-method:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            /* Complete Sale Button */
            button[type="submit"],
            .checkout-btn,
            .complete-sale-btn {
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

            button[type="submit"]:hover,
            .checkout-btn:hover,
            .complete-sale-btn:hover {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                transform: translateY(-2px);
            }

            button[type="submit"]:disabled,
            .checkout-btn:disabled,
            .complete-sale-btn:disabled {
                background: #95a5a6;
                cursor: not-allowed;
                box-shadow: none;
                transform: none;
            }

            button[type="submit"]:active:not(:disabled),
            .checkout-btn:active:not(:disabled),
            .complete-sale-btn:active:not(:disabled) {
                transform: translateY(0);
            }

            /* Form groups */
            .form-group,
            .modern-form-group {
                margin: 15px 0;
            }

            .form-group label,
            .modern-form-group label {
                display: block;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 8px;
                font-size: 14px;
            }

            /* Input fields */
            input[type="text"],
            input[type="number"],
            input.modern-input {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e1e8ed;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                transition: all 0.3s;
            }

            input[type="text"]:focus,
            input[type="number"]:focus,
            input.modern-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
        `;
        document.head.appendChild(style);
    }

    // Main initialization
    async function init() {
        console.log('🎨 Initializing Modern Checkout Interface...');

        await waitForApp();

        // Inject styles
        injectStyles();

        console.log('✅ Modern Checkout Interface Loaded!');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
