/**
 * Frutiger Aero Theme Toggle
 *
 * Manages the theme switching between dark mode and frutiger aero theme
 * with sound effects and visual transitions.
 */

(function () {
    'use strict';

    /**
     * Play sound effect
     * @param {string} soundPath - Path to the sound file
     */
    function playSound(soundPath) {
        const audio = new Audio(soundPath);
        audio.volume = 0.3;
        audio.play().catch(err => {
            console.log('Audio playback failed:', err);
        });
    }

    /**
     * Adjust content height for theme
     * Disabled to prevent extra spacing in content cards
     */
    function adjustContentHeight() {
        const contentElement = document.querySelector('.content');
        if (!contentElement) return;

        // Clear any forced heights
        contentElement.style.minHeight = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
    }

    // Initialize theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (!themeToggle) return;

    // Check saved preference
    const frutigerAeroEnabled = localStorage.getItem('frutigerAeroEnabled') === 'true';

    if (frutigerAeroEnabled) {
        body.classList.add('frutiger-aero');
        themeToggle.innerHTML = '<svg class="svg-icon" aria-hidden="true"><use href="#icon-moon"/></svg>';
        themeToggle.setAttribute('title', 'Switch to Dark Theme');

        // Play startup sound on page load if this is the first page in the session
        if (!sessionStorage.getItem('vistaStartupPlayed')) {
            playSound('/assets/sounds/vista-startup.mp3');
            sessionStorage.setItem('vistaStartupPlayed', 'true');
        }
    } else {
        themeToggle.innerHTML = '<svg class="svg-icon" aria-hidden="true"><use href="#icon-sun"/></svg>';
        themeToggle.setAttribute('title', 'Switch to Frutiger Aero Theme');
    }

    themeToggle.addEventListener('click', function () {
        body.classList.toggle('frutiger-aero');

        if (body.classList.contains('frutiger-aero')) {
            localStorage.setItem('frutigerAeroEnabled', 'true');
            themeToggle.innerHTML = '<svg class="svg-icon" aria-hidden="true"><use href="#icon-moon"/></svg>';
            themeToggle.setAttribute('title', 'Switch to Dark Theme');

            playSound('/assets/sounds/vista-startup.mp3');
            sessionStorage.setItem('vistaStartupPlayed', 'true');
        } else {
            localStorage.setItem('frutigerAeroEnabled', 'false');
            themeToggle.innerHTML = '<svg class="svg-icon" aria-hidden="true"><use href="#icon-sun"/></svg>';
            themeToggle.setAttribute('title', 'Switch to Frutiger Aero Theme');

            playSound('/assets/sounds/vista-shutdown.mp3');
            sessionStorage.removeItem('vistaStartupPlayed');
        }

        setTimeout(adjustContentHeight, 10);
    });

    document.querySelectorAll('.vista-control').forEach(control => {
        control.addEventListener('click', function () {
            if (this.classList.contains('vista-close')) {
                body.classList.remove('frutiger-aero');
                localStorage.setItem('frutigerAeroEnabled', 'false');
                themeToggle.innerHTML = '<svg class="svg-icon" aria-hidden="true"><use href="#icon-sun"/></svg>';
                themeToggle.setAttribute('title', 'Switch to Frutiger Aero Theme');

                playSound('/assets/sounds/vista-shutdown.mp3');
                sessionStorage.removeItem('vistaStartupPlayed');

                setTimeout(adjustContentHeight, 10);
            }
        });
    });

    // Adjust height on page load and resize
    window.addEventListener('load', adjustContentHeight);
    window.addEventListener('resize', adjustContentHeight);

    // Initial adjustment
    adjustContentHeight();
})();
