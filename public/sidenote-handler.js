/**
 * Sidenote Handler
 * Manages interactive sidenotes for blog posts
 */

(function() {
    'use strict';

    function toggleSidenote(id) {
        const sidenote = document.getElementById(id);
        if (sidenote) {
            sidenote.classList.toggle('active');
        }
    }

    // Make toggleSidenote globally accessible
    window.toggleSidenote = toggleSidenote;

    if (!window.sidenotesInitialized) {
        window.sidenotesInitialized = true;
        
        function initializeSidenotes() {
            const markers = document.querySelectorAll('.sidenote-marker');
            markers.forEach(marker => {
                const sidenoteId = marker.getAttribute('data-sidenote');
                const sidenote = document.getElementById(sidenoteId);
                if (sidenote) {
                    // Reset any inline styles that might interfere
                    sidenote.style.top = '';
                    sidenote.style.position = '';
                    
                    // Add click handler for desktop hover behavior
                    if (window.innerWidth >= 1200) {
                        marker.addEventListener('click', function(e) {
                            e.preventDefault();
                            // Close all other sidenotes
                            document.querySelectorAll('.sidenote').forEach(note => {
                                if (note.id !== sidenoteId) {
                                    note.classList.remove('active');
                                }
                            });
                            // Toggle current sidenote
                            sidenote.classList.toggle('active');
                        });
                    }
                }
            });
        }

        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                initializeSidenotes();
            }, 100);
        });
        
        // Initialize sidenotes with robust ready check
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeSidenotes);
        } else {
            // DOM already loaded - use setTimeout to ensure all elements are parsed
            setTimeout(initializeSidenotes, 0);
        }
    }
})();

