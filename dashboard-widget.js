/**
 * Sales Dashboard Widget
 * Adds Today/Yesterday/Last Week sales stats to welcome section
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

    // Inject dashboard styles
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Sales Dashboard Widget */
            .sales-dashboard-widget {
                margin: 20px 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
            }

            .dashboard-title {
                color: white;
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .sales-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }

            .stat-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                transition: all 0.3s;
            }

            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
            }

            .stat-label {
                font-size: 13px;
                color: #7f8c8d;
                font-weight: 600;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .stat-value {
                font-size: 28px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 4px;
            }

            .stat-subtitle {
                font-size: 12px;
                color: #95a5a6;
                font-weight: 600;
            }

            .stat-icon {
                font-size: 32px;
                margin-bottom: 10px;
            }

            .loading-spinner {
                color: white;
                font-size: 14px;
                text-align: center;
                padding: 10px;
            }

            .error-message {
                color: #ffcccc;
                font-size: 14px;
                text-align: center;
                padding: 10px;
            }
        `;
        document.head.appendChild(style);
    }

    // Fetch dashboard data
    async function fetchDashboardData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            const response = await fetch('/api/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch dashboard data');

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Dashboard fetch error:', error);
            return null;
        }
    }

    // Format money
    function formatMoney(amount) {
        return 'UGX ' + Math.round(amount).toLocaleString();
    }

    // Create dashboard widget
    function createDashboardWidget(data) {
        const widget = document.createElement('div');
        widget.className = 'sales-dashboard-widget';
        widget.id = 'sales-dashboard-widget';

        widget.innerHTML = `
            <div class="dashboard-title">📊 Sales Overview</div>
            <div class="sales-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-label">Today's Sales</div>
                    <div class="stat-value">${formatMoney(data.today.total)}</div>
                    <div class="stat-subtitle">${data.today.transactions} transactions</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📆</div>
                    <div class="stat-label">Yesterday</div>
                    <div class="stat-value">${formatMoney(data.yesterday.total)}</div>
                    <div class="stat-subtitle">${data.yesterday.transactions} transactions</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-label">Last 7 Days</div>
                    <div class="stat-value">${formatMoney(data.last_week.total)}</div>
                    <div class="stat-subtitle">${data.last_week.transactions} transactions</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-label">This Month</div>
                    <div class="stat-value">${formatMoney(data.this_month.total)}</div>
                    <div class="stat-subtitle">${data.this_month.transactions} transactions</div>
                </div>
            </div>
        `;

        return widget;
    }

    // Insert dashboard widget
    async function insertDashboard() {
        // Don't insert if already exists
        if (document.getElementById('sales-dashboard-widget')) return;

        // Look for welcome/home section to insert dashboard
        // Try to find date/time display or welcome message
        const possibleContainers = [
            ...document.querySelectorAll('[class*="dashboard"]'),
            ...document.querySelectorAll('[class*="welcome"]'),
            ...document.querySelectorAll('[class*="home"]'),
            ...document.querySelectorAll('[class*="main"]')
        ];

        let targetContainer = null;

        // Find container with date/time or welcome text
        for (const container of possibleContainers) {
            const text = container.textContent.toLowerCase();
            if (text.includes('welcome') ||
                text.includes('dashboard') ||
                text.includes('admin panel') ||
                container.querySelector('h1, h2')) {
                targetContainer = container;
                break;
            }
        }

        // If not found, look for first main content area
        if (!targetContainer) {
            targetContainer = document.querySelector('main, .main-content, [role="main"]');
        }

        // If still not found, insert after header
        if (!targetContainer) {
            const header = document.querySelector('header, .header, nav');
            if (header && header.parentElement) {
                targetContainer = header.parentElement;
            }
        }

        if (!targetContainer) {
            console.log('Could not find suitable container for dashboard widget');
            return;
        }

        // Fetch dashboard data
        const data = await fetchDashboardData();

        if (!data || !data.success) {
            console.log('No dashboard data available');
            return;
        }

        // Create and insert widget
        const widget = createDashboardWidget(data);

        // Insert after first child or at beginning
        if (targetContainer.firstChild) {
            targetContainer.insertBefore(widget, targetContainer.firstChild.nextSibling);
        } else {
            targetContainer.appendChild(widget);
        }

        console.log('✅ Sales dashboard widget inserted');
    }

    // Refresh dashboard data
    async function refreshDashboard() {
        const widget = document.getElementById('sales-dashboard-widget');
        if (!widget) return;

        const data = await fetchDashboardData();
        if (!data || !data.success) return;

        // Update the widget content
        const newWidget = createDashboardWidget(data);
        widget.innerHTML = newWidget.innerHTML;
    }

    // Main initialization
    async function init() {
        console.log('📊 Initializing Sales Dashboard Widget...');

        await waitForApp();

        // Inject styles
        injectStyles();

        // Insert dashboard
        setTimeout(insertDashboard, 1500);

        // Refresh dashboard every 60 seconds
        setInterval(refreshDashboard, 60000);

        // Re-insert if page changes
        const observer = new MutationObserver(() => {
            if (!document.getElementById('sales-dashboard-widget')) {
                setTimeout(insertDashboard, 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ Sales Dashboard Widget Loaded!');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
