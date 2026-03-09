/**
 * Easter Egg: Konami Code activates Frutiger Aero theme
 * Sequence: ↑ ↑ ↓ ↓ ← → ← → B A
 */

(function () {
    'use strict';

    const KONAMI_CODE = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'KeyB',
        'KeyA',
    ];

    let inputSequence = [];
    let frutigerAeroEnabled = localStorage.getItem('frutigerAeroEnabled') === 'true';
    let frutigerAeroStylesheet = null;

    /**
     * Loads the Frutiger Aero stylesheet dynamically
     */
    function loadFrutigerAeroCSS() {
        if (frutigerAeroStylesheet) return;

        frutigerAeroStylesheet = document.createElement('link');
        frutigerAeroStylesheet.rel = 'stylesheet';
        frutigerAeroStylesheet.href = '/frutiger-aero.css';
        frutigerAeroStylesheet.id = 'frutiger-aero-stylesheet';
        document.head.appendChild(frutigerAeroStylesheet);
    }

    /**
     * Removes the Frutiger Aero stylesheet
     */
    function unloadFrutigerAeroCSS() {
        if (frutigerAeroStylesheet) {
            frutigerAeroStylesheet.remove();
            frutigerAeroStylesheet = null;
        }
    }

    /**
     * Plays the Vista startup or shutdown sound
     */
    function playVistaSound(type) {
        const soundPath = type === 'startup' ? '/assets/sounds/vista-startup.mp3' : '/assets/sounds/vista-shutdown.mp3';

        const audio = new Audio(soundPath);
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Audio autoplay blocked, silently fail
        });
    }

    /**
     * Shows a notification when theme is activated/deactivated
     */
    function showNotification(message) {
        // Remove existing notification if any
        const existing = document.querySelector('.easter-egg-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'easter-egg-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${frutigerAeroEnabled ? 'linear-gradient(to bottom, #e0f0ff 0%, #b8deff 100%)' : '#ffb800'};
            color: ${frutigerAeroEnabled ? '#0063B1' : '#080808'};
            padding: 12px 24px;
            font-family: 'Space Grotesk', system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
            border-radius: ${frutigerAeroEnabled ? '8px' : '0'};
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideUp 0.3s ease, fadeOut 0.3s ease 2s forwards;
        `;

        // Add animation styles
        if (!document.querySelector('#easter-egg-styles')) {
            const style = document.createElement('style');
            style.id = 'easter-egg-styles';
            style.textContent = `
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
    }

    /**
     * Activates the Frutiger Aero theme
     */
    function activateFrutigerAero() {
        frutigerAeroEnabled = true;
        localStorage.setItem('frutigerAeroEnabled', 'true');
        document.body.classList.add('frutiger-aero');
        loadFrutigerAeroCSS();
        playVistaSound('startup');
        showNotification('Frutiger Aero activated!');
    }

    /**
     * Deactivates the Frutiger Aero theme
     */
    function deactivateFrutigerAero() {
        frutigerAeroEnabled = false;
        localStorage.setItem('frutigerAeroEnabled', 'false');
        document.body.classList.remove('frutiger-aero');
        unloadFrutigerAeroCSS();
        playVistaSound('shutdown');
        showNotification('Back to default theme');
    }

    /**
     * Toggles the Frutiger Aero theme
     */
    function toggleFrutigerAero() {
        if (frutigerAeroEnabled) {
            deactivateFrutigerAero();
        } else {
            activateFrutigerAero();
        }
    }

    /**
     * Checks if the current input sequence matches the Konami code
     */
    function checkKonamiCode() {
        const sequenceString = inputSequence.join(',');
        const konamiString = KONAMI_CODE.join(',');

        if (sequenceString === konamiString) {
            toggleFrutigerAero();
            inputSequence = [];
            return true;
        }

        return false;
    }

    /**
     * Handles keydown events for Konami code detection
     */
    function handleKeyDown(event) {
        inputSequence.push(event.code);

        // Keep only the last N keys (where N is the length of the Konami code)
        if (inputSequence.length > KONAMI_CODE.length) {
            inputSequence.shift();
        }

        checkKonamiCode();
    }

    /**
     * Initialize on DOM ready
     */
    function init() {
        // Restore previous state if Frutiger Aero was enabled
        if (frutigerAeroEnabled) {
            document.body.classList.add('frutiger-aero');
            loadFrutigerAeroCSS();
        }

        // Listen for Konami code
        document.addEventListener('keydown', handleKeyDown);

        // Also add a secret console command
        window.activateVistaMode = function () {
            if (!frutigerAeroEnabled) {
                activateFrutigerAero();
                console.log('%c Vista mode activated! ', 'background: #0078D7; color: white; padding: 4px 8px;');
            } else {
                console.log(
                    '%c Vista mode is already active. Use deactivateVistaMode() to turn it off. ',
                    'color: #9a9a90;'
                );
            }
        };

        window.deactivateVistaMode = function () {
            if (frutigerAeroEnabled) {
                deactivateFrutigerAero();
                console.log('%c Vista mode deactivated ', 'background: #a78bfa; color: #080808; padding: 4px 8px;');
            } else {
                console.log('%c Vista mode is not active. ', 'color: #9a9a90;');
            }
        };
    }

    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
