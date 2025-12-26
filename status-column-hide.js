/**
 * Status Column Hide Script
 * Hides the status column from Item Management interface
 * Since React UI is compiled, we use DOM manipulation
 */

(function() {
    'use strict';

    console.log('🎨 Status Column Hide Script Loading...');

    // Function to hide status column in tables
    function hideStatusColumn() {
        let hiddenCount = 0;

        // Find all tables on the page
        const tables = document.querySelectorAll('table');

        tables.forEach(table => {
            // Get all header cells
            const headers = table.querySelectorAll('thead th, thead td');
            let statusColumnIndex = -1;

            // Find the status column index
            headers.forEach((header, index) => {
                const text = header.textContent.trim().toLowerCase();
                if (text === 'status' || text === 'state' || text === 'active') {
                    statusColumnIndex = index;

                    // Hide the header
                    if (header.style.display !== 'none') {
                        header.style.display = 'none';
                        hiddenCount++;
                    }
                }
            });

            // If we found a status column, hide all cells in that column
            if (statusColumnIndex !== -1) {
                // Hide all body cells in that column
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td, th');
                    if (cells[statusColumnIndex]) {
                        if (cells[statusColumnIndex].style.display !== 'none') {
                            cells[statusColumnIndex].style.display = 'none';
                            hiddenCount++;
                        }
                    }
                });
            }
        });

        // Also hide any standalone "Status" labels or divs
        const allElements = document.querySelectorAll('label, div, span, th, td');
        allElements.forEach(el => {
            const text = el.textContent.trim();

            // Check for exact "Status" label (case insensitive)
            if (text.toLowerCase() === 'status' && !el.closest('select, option')) {
                // Check if this is a standalone label or header
                const parent = el.parentElement;

                // Hide if it's a form label or table header
                if (el.tagName === 'LABEL' || el.tagName === 'TH' ||
                    (el.tagName === 'DIV' && el.className.includes('label'))) {

                    if (el.style.display !== 'none') {
                        el.style.display = 'none';
                        hiddenCount++;
                    }
                }
            }

            // Hide status badge/chip elements (often showing "Active" or "Inactive")
            if ((text.toLowerCase() === 'active' || text.toLowerCase() === 'inactive') &&
                (el.className.includes('badge') ||
                 el.className.includes('chip') ||
                 el.className.includes('tag') ||
                 el.className.includes('status'))) {

                if (el.style.display !== 'none') {
                    el.style.display = 'none';
                    hiddenCount++;
                }
            }
        });

        if (hiddenCount > 0) {
            console.log(`✅ Hid ${hiddenCount} status-related elements`);
        }
    }

    // Function to hide status form fields in add/edit modals
    function hideStatusFormFields() {
        // Find all form groups, form fields, or form rows
        const formGroups = document.querySelectorAll(
            '.form-group, .form-field, .form-row, .input-group, [class*="field"], [class*="input"]'
        );

        formGroups.forEach(group => {
            // Check if this group contains a "status" label or input
            const labels = group.querySelectorAll('label');
            const inputs = group.querySelectorAll('input, select, textarea');

            let hasStatusLabel = false;

            labels.forEach(label => {
                if (label.textContent.trim().toLowerCase() === 'status') {
                    hasStatusLabel = true;
                }
            });

            inputs.forEach(input => {
                if (input.name && input.name.toLowerCase() === 'status') {
                    hasStatusLabel = true;
                }
                if (input.id && input.id.toLowerCase().includes('status')) {
                    hasStatusLabel = true;
                }
            });

            // Hide the entire form group if it's for status
            if (hasStatusLabel) {
                if (group.style.display !== 'none') {
                    group.style.display = 'none';
                    console.log('🚫 Hid status form field');
                }
            }
        });
    }

    // Main function to apply all hiding
    function applyStatusHiding() {
        hideStatusColumn();
        hideStatusFormFields();
    }

    // Initialize
    function init() {
        console.log('✅ Status Column Hide Script Loaded!');

        // Initial application
        setTimeout(applyStatusHiding, 500);
        setTimeout(applyStatusHiding, 1500);
        setTimeout(applyStatusHiding, 3000);

        // Monitor for DOM changes (React re-renders)
        const observer = new MutationObserver(() => {
            applyStatusHiding();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also apply periodically as backup
        setInterval(applyStatusHiding, 3000);

        console.log('👀 Monitoring for status columns to hide...');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
