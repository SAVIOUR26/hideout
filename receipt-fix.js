/**
 * Receipt Fix - Ensures transaction_id is properly passed to receipt window
 * Fixes "Failed to fetch receipt data" error
 * Version 2.0 - Enhanced with better capture mechanisms
 */

(function() {
    'use strict';

    console.log('🔧 Receipt Fix Script v2.0 Loading...');

    let lastTransactionId = null;

    // Store the original window.open and fetch
    const originalWindowOpen = window.open;
    const originalFetch = window.fetch;

    // Method 1: Intercept XMLHttpRequest (in case React uses XHR instead of fetch)
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._url = url;
        this._method = method;
        return originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(...args) {
        this.addEventListener('load', function() {
            if (this._url && this._url.includes('/api/transactions') && this._method === 'POST') {
                try {
                    const response = JSON.parse(this.responseText);
                    if (response.success && response.transaction_id) {
                        lastTransactionId = response.transaction_id;
                        sessionStorage.setItem('last_transaction_id', response.transaction_id);
                        localStorage.setItem('last_transaction_id', response.transaction_id);
                        console.log('💾 [XHR] Captured transaction ID:', response.transaction_id);
                    }
                } catch (e) {
                    console.warn('⚠️ Could not parse XHR response:', e);
                }
            }
        });
        return originalXHRSend.apply(this, args);
    };

    // Method 2: Enhanced Fetch Override with better error handling
    window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;

        return originalFetch.apply(this, args).then(response => {
            // Only process transaction creation requests
            if (url && (url.includes('/api/transactions') || url.includes('api/transactions'))) {
                const method = args[1]?.method || 'GET';

                if (method.toUpperCase() === 'POST') {
                    // Clone the response before reading it
                    const clonedResponse = response.clone();

                    // Read and parse the response
                    clonedResponse.text().then(text => {
                        try {
                            const data = JSON.parse(text);

                            if (data.success && data.transaction_id) {
                                lastTransactionId = data.transaction_id;
                                sessionStorage.setItem('last_transaction_id', data.transaction_id);
                                localStorage.setItem('last_transaction_id', data.transaction_id);
                                window.lastTransactionResponse = data;

                                console.log('💾 [Fetch] Captured transaction ID:', data.transaction_id);

                                // Dispatch custom event
                                window.dispatchEvent(new CustomEvent('transaction-created', {
                                    detail: { transaction_id: data.transaction_id }
                                }));
                            }
                        } catch (error) {
                            console.warn('⚠️ Could not parse fetch response:', error);
                        }
                    }).catch(err => {
                        console.warn('⚠️ Error reading response text:', err);
                    });
                }
            }

            return response;
        });
    };

    // Method 3: Override window.open to inject transaction_id
    window.open = function(...args) {
        const url = args[0];

        // Check if this is a print-preview window
        if (url && url.includes('print-preview.html')) {
            console.log('🎯 Intercepted print-preview window open:', url);

            // Get transaction ID from multiple sources
            let transactionId = lastTransactionId ||
                               sessionStorage.getItem('last_transaction_id') ||
                               localStorage.getItem('last_transaction_id');

            // Check if URL already has transaction ID
            if (!url.includes('?id=') && !url.includes('&id=')) {
                if (transactionId) {
                    // Add transaction ID to URL
                    const separator = url.includes('?') ? '&' : '?';
                    const newUrl = `${url}${separator}id=${transactionId}`;
                    console.log('✅ Fixed URL with transaction ID:', newUrl);
                    args[0] = newUrl;
                } else {
                    console.error('❌ NO TRANSACTION ID AVAILABLE!');
                    console.log('Checking all sources:');
                    console.log('  - lastTransactionId:', lastTransactionId);
                    console.log('  - sessionStorage:', sessionStorage.getItem('last_transaction_id'));
                    console.log('  - localStorage:', localStorage.getItem('last_transaction_id'));
                    console.log('  - window.lastTransactionResponse:', window.lastTransactionResponse);
                }
            } else {
                console.log('✅ URL already has transaction ID');
            }
        }

        // Call original window.open with potentially modified args
        return originalWindowOpen.apply(this, args);
    };

    // Method 4: Monitor DOM for React state changes
    function monitorReactState() {
        // Try to access React's internal state (this is a hack but might work)
        const rootElement = document.getElementById('root');

        if (rootElement && rootElement._reactRootContainer) {
            console.log('📦 Found React root container');
        }
    }

    // Method 5: Listen for complete sale button clicks
    function interceptCompleteSale() {
        const completeSaleBtn = document.getElementById('modern-complete-sale');

        if (completeSaleBtn && !completeSaleBtn.dataset.receiptFixV2Applied) {
            completeSaleBtn.dataset.receiptFixV2Applied = 'true';

            completeSaleBtn.addEventListener('click', async function() {
                console.log('🛒 Complete Sale clicked - waiting for transaction...');

                // Clear old transaction ID to ensure we get a fresh one
                lastTransactionId = null;

                // Wait and check if transaction was captured
                setTimeout(() => {
                    const transactionId = lastTransactionId ||
                                        sessionStorage.getItem('last_transaction_id');

                    if (transactionId) {
                        console.log('✅ Transaction ID available:', transactionId);
                    } else {
                        console.warn('⚠️ No transaction ID found after sale completion');
                        console.log('Check if API call was successful');
                    }
                }, 3000);
            }, true);
        }
    }

    // Method 6: Listen for custom events
    window.addEventListener('transaction-created', (event) => {
        if (event.detail && event.detail.transaction_id) {
            console.log('📢 Transaction created event received:', event.detail.transaction_id);
            lastTransactionId = event.detail.transaction_id;
            sessionStorage.setItem('last_transaction_id', event.detail.transaction_id);
        }
    });

    // Initialize
    function init() {
        console.log('✅ Receipt Fix Script v2.0 Loaded!');
        console.log('📋 Active capture methods:');
        console.log('  1. XMLHttpRequest override');
        console.log('  2. Fetch API override');
        console.log('  3. Window.open override');
        console.log('  4. React state monitoring');
        console.log('  5. Complete sale button interception');
        console.log('  6. Custom event listener');

        // Initial checks
        monitorReactState();
        interceptCompleteSale();

        // Monitor for DOM changes
        const observer = new MutationObserver(() => {
            interceptCompleteSale();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Periodic check
        setInterval(interceptCompleteSale, 2000);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
