/**
 * Receipt Fix - Ensures transaction_id is properly passed to receipt window
 * Fixes "Failed to fetch receipt data" error
 */

(function() {
    'use strict';

    console.log('🔧 Receipt Fix Script Loading...');

    // Store the original window.open
    const originalWindowOpen = window.open;

    // Override window.open to intercept receipt window calls
    window.open = function(...args) {
        const url = args[0];

        // Check if this is a print-preview window
        if (url && url.includes('print-preview.html')) {
            console.log('🎯 Intercepted print-preview window open:', url);

            // Check if URL already has transaction ID
            if (!url.includes('?id=') && !url.includes('&id=')) {
                console.warn('⚠️ No transaction ID in URL, attempting to get from session/transaction');

                // Try to get transaction ID from various sources
                let transactionId = null;

                // 1. Check sessionStorage
                transactionId = sessionStorage.getItem('last_transaction_id');

                // 2. Check localStorage
                if (!transactionId) {
                    transactionId = localStorage.getItem('last_transaction_id');
                }

                // 3. Try to extract from any recent API response
                if (!transactionId && window.lastTransactionResponse) {
                    transactionId = window.lastTransactionResponse.transaction_id;
                }

                if (transactionId) {
                    // Add transaction ID to URL
                    const separator = url.includes('?') ? '&' : '?';
                    const newUrl = `${url}${separator}id=${transactionId}`;
                    console.log('✅ Fixed URL with transaction ID:', newUrl);
                    args[0] = newUrl;
                } else {
                    console.error('❌ Could not find transaction ID to add to URL');
                }
            } else {
                console.log('✅ URL already has transaction ID');
            }
        }

        // Call original window.open with potentially modified args
        return originalWindowOpen.apply(this, args);
    };

    // Intercept fetch to capture transaction responses
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];

        return originalFetch.apply(this, args).then(async response => {
            // Clone the response so we can read it without consuming it
            const clonedResponse = response.clone();

            // Check if this is a transaction creation request
            if (url && (url.includes('/api/transactions') || url.includes('api/transactions'))) {
                try {
                    const data = await clonedResponse.json();

                    if (data.success && data.transaction_id) {
                        console.log('💾 Captured transaction ID:', data.transaction_id);

                        // Store transaction ID in multiple places
                        sessionStorage.setItem('last_transaction_id', data.transaction_id);
                        localStorage.setItem('last_transaction_id', data.transaction_id);
                        window.lastTransactionResponse = data;

                        // Also dispatch an event for other scripts
                        window.dispatchEvent(new CustomEvent('transaction-created', {
                            detail: { transaction_id: data.transaction_id }
                        }));
                    }
                } catch (error) {
                    // Ignore JSON parse errors
                }
            }

            return response;
        });
    };

    // Listen for transaction created events from React
    window.addEventListener('transaction-created', (event) => {
        if (event.detail && event.detail.transaction_id) {
            console.log('📢 Transaction created event received:', event.detail.transaction_id);
            sessionStorage.setItem('last_transaction_id', event.detail.transaction_id);
        }
    });

    // Intercept modern checkout complete sale
    function interceptModernCheckout() {
        const completeSaleBtn = document.getElementById('modern-complete-sale');

        if (completeSaleBtn && !completeSaleBtn.dataset.receiptFixApplied) {
            completeSaleBtn.dataset.receiptFixApplied = 'true';

            // Store original click handler
            const originalHandler = completeSaleBtn.onclick;

            // Add our enhanced handler
            completeSaleBtn.addEventListener('click', async function(e) {
                console.log('🛒 Complete Sale clicked - monitoring for transaction ID...');

                // Wait a moment for the transaction to complete
                setTimeout(() => {
                    const transactionId = sessionStorage.getItem('last_transaction_id');
                    if (transactionId) {
                        console.log('✅ Transaction ID available for receipt:', transactionId);
                    } else {
                        console.warn('⚠️ No transaction ID found after sale completion');
                    }
                }, 2000);
            }, true); // Use capture phase to run before original
        }
    }

    // Monitor for modern checkout interface
    const checkoutObserver = new MutationObserver(() => {
        interceptModernCheckout();
    });

    // Start observing when DOM is ready
    function init() {
        console.log('✅ Receipt Fix Script Loaded!');

        // Initial check
        interceptModernCheckout();

        // Monitor for changes
        checkoutObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also check periodically
        setInterval(interceptModernCheckout, 2000);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
