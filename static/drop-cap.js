/**
 * Drop Cap Enhancement
 * 
 * Automatically creates beautiful SVG drop caps for the first letter of blog posts.
 * Inspired by Gwern's aesthetic with abstract art styling.
 * 
 * Features:
 * - Generates custom SVG for each letter
 * - Abstract geometric design with decorative elements
 * - Seamless text wrapping
 * - Responsive and accessible
 */

(function() {
    'use strict';

    /**
     * Generates an SVG drop cap with frutiger aero styling (glossy, bubble-like)
     * 
     * @param {string} letter - The letter to render
     * @returns {string} SVG markup
     */
    function generateFrutigerAeroDropCapSVG(letter) {
        const svgWidth = 80;
        const svgHeight = 80;
        
        const letterCode = letter.charCodeAt(0);
        
        // Frutiger aero colors: sky blues, whites, transparent elements
        const skyBlue = '#4da6ff';
        const lightBlue = '#99ccff';
        const white = '#ffffff';
        const softBlue = '#cce6ff';
        
        return `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 ${svgWidth} ${svgHeight}" 
                 class="drop-cap-svg"
                 preserveAspectRatio="xMidYMid slice"
                 role="img"
                 aria-label="Decorative drop cap: ${letter}">
                <defs>
                    <!-- Glossy gradient for glass effect -->
                    <linearGradient id="glass-grad-${letterCode}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${white};stop-opacity:0.9" />
                        <stop offset="50%" style="stop-color:${lightBlue};stop-opacity:0.6" />
                        <stop offset="100%" style="stop-color:${skyBlue};stop-opacity:0.8" />
                    </linearGradient>
                    
                    <!-- Shine overlay gradient -->
                    <linearGradient id="shine-${letterCode}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${white};stop-opacity:0.8" />
                        <stop offset="30%" style="stop-color:${white};stop-opacity:0.3" />
                        <stop offset="70%" style="stop-color:${white};stop-opacity:0" />
                        <stop offset="100%" style="stop-color:${white};stop-opacity:0.1" />
                    </linearGradient>
                    
                    <!-- Radial highlight for bubble effect -->
                    <radialGradient id="bubble-${letterCode}" cx="35%" cy="35%" r="60%">
                        <stop offset="0%" style="stop-color:${white};stop-opacity:0.9" />
                        <stop offset="40%" style="stop-color:${lightBlue};stop-opacity:0.5" />
                        <stop offset="100%" style="stop-color:${skyBlue};stop-opacity:0.7" />
                    </radialGradient>
                    
                    <!-- Shadow for depth -->
                    <filter id="shadow-${letterCode}">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                        <feOffset dx="0" dy="2" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <!-- Background bubble with glass effect -->
                <rect x="5" y="5" 
                      width="${svgWidth - 10}" 
                      height="${svgHeight - 10}" 
                      rx="8" 
                      fill="url(#bubble-${letterCode})" 
                      filter="url(#shadow-${letterCode})"
                      opacity="0.95"/>
                
                <!-- Top shine/gloss effect -->
                <ellipse cx="40" cy="25" 
                         rx="25" ry="15" 
                         fill="url(#shine-${letterCode})"/>
                
                <!-- Small highlight orb (top-left) -->
                <circle cx="25" cy="20" r="8" 
                        fill="${white}" 
                        opacity="0.6"/>
                
                <!-- Tiny sparkle -->
                <circle cx="60" cy="25" r="3" 
                        fill="${white}" 
                        opacity="0.8"/>
                
                <!-- Border with soft glow -->
                <rect x="5" y="5" 
                      width="${svgWidth - 10}" 
                      height="${svgHeight - 10}" 
                      rx="8" 
                      fill="none" 
                      stroke="${skyBlue}" 
                      stroke-width="1.5" 
                      opacity="0.6"/>
                
                <!-- Inner soft border -->
                <rect x="7" y="7" 
                      width="${svgWidth - 14}" 
                      height="${svgHeight - 14}" 
                      rx="6" 
                      fill="none" 
                      stroke="${white}" 
                      stroke-width="1" 
                      opacity="0.3"/>
                
                <!-- The letter itself with shadow -->
                <text x="50%" 
                      y="52%" 
                      font-family="TiemposHeadline-Regular, Georgia, serif" 
                      font-size="48" 
                      font-weight="normal"
                      fill="${skyBlue}" 
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      style="text-shadow: 0 1px 3px rgba(255,255,255,0.5), 0 2px 6px rgba(77,166,255,0.3);"
                      opacity="0.9">${letter}</text>
            </svg>
        `;
    }

    /**
     * Generates an SVG drop cap with abstract art styling
     * 
     * @param {string} letter - The letter to render
     * @returns {string} SVG markup
     */
    function generateDropCapSVG(letter) {
        const svgWidth = 80;
        const svgHeight = 80;
        
        // Generate abstract background patterns based on letter
        const letterCode = letter.charCodeAt(0);
        const seed = letterCode * 137.5; // Golden angle for aesthetics
        
        // Create geometric pattern elements
        const pattern1Rotate = (seed % 360);
        const pattern2Rotate = ((seed * 1.618) % 360); // Golden ratio
        const pattern3Rotate = ((seed * 2.414) % 360); // Silver ratio
        
        // Use site's purple/violet color palette
        const primaryColor = '#a855f7';    // Site's main purple (links)
        const secondaryColor = '#7c3aed';  // Darker purple
        const accentColor = '#c084fc';     // Lighter purple
        
        return `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 ${svgWidth} ${svgHeight}" 
                 class="drop-cap-svg"
                 preserveAspectRatio="xMidYMid slice"
                 role="img"
                 aria-label="Decorative drop cap: ${letter}">
                <defs>
                    <!-- Abstract gradient definitions -->
                    <linearGradient id="grad-${letterCode}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.3" />
                        <stop offset="50%" style="stop-color:${secondaryColor};stop-opacity:0.2" />
                        <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.25" />
                    </linearGradient>
                    
                    <!-- Radial gradient for depth -->
                    <radialGradient id="radial-${letterCode}" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.15" />
                        <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.05" />
                    </radialGradient>
                    
                    <!-- Pattern for texture -->
                    <pattern id="texture-${letterCode}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="${primaryColor}" opacity="0.1"/>
                        <circle cx="12" cy="12" r="1" fill="${secondaryColor}" opacity="0.1"/>
                    </pattern>
                </defs>
                
                <!-- Background container with border -->
                <rect x="2" y="2" 
                      width="${svgWidth - 4}" 
                      height="${svgHeight - 4}" 
                      fill="#0f0f0f" 
                      stroke="${primaryColor}" 
                      stroke-width="1.5" 
                      opacity="0.8"/>
                
                <!-- Abstract geometric background elements -->
                <g opacity="0.4">
                    <!-- Rotating geometric shapes for abstract art feel -->
                    <rect x="20" y="20" 
                          width="80" 
                          height="80" 
                          fill="url(#grad-${letterCode})" 
                          transform="rotate(${pattern1Rotate}, 60, 60)"/>
                    
                    <circle cx="60" cy="60" r="35" 
                            fill="url(#radial-${letterCode})" 
                            transform="rotate(${pattern2Rotate}, 60, 60)"/>
                    
                    <polygon points="60,25 85,75 35,75" 
                             fill="${accentColor}" 
                             opacity="0.15" 
                             transform="rotate(${pattern3Rotate}, 60, 60)"/>
                    
                    <!-- Fine texture overlay -->
                    <rect x="0" y="0" 
                          width="${svgWidth}" 
                          height="${svgHeight}" 
                          fill="url(#texture-${letterCode})"/>
                </g>
                
                <!-- Decorative corner elements -->
                <g stroke="${primaryColor}" stroke-width="1" fill="none" opacity="0.5">
                    <line x1="10" y1="10" x2="20" y2="10"/>
                    <line x1="10" y1="10" x2="10" y2="20"/>
                    
                    <line x1="${svgWidth - 10}" y1="10" x2="${svgWidth - 20}" y2="10"/>
                    <line x1="${svgWidth - 10}" y1="10" x2="${svgWidth - 10}" y2="20"/>
                    
                    <line x1="10" y1="${svgHeight - 10}" x2="20" y2="${svgHeight - 10}"/>
                    <line x1="10" y1="${svgHeight - 10}" x2="10" y2="${svgHeight - 20}"/>
                    
                    <line x1="${svgWidth - 10}" y1="${svgHeight - 10}" x2="${svgWidth - 20}" y2="${svgHeight - 10}"/>
                    <line x1="${svgWidth - 10}" y1="${svgHeight - 10}" x2="${svgWidth - 10}" y2="${svgHeight - 20}"/>
                </g>
                
                <!-- The letter itself -->
                <text x="50%" 
                      y="52%" 
                      font-family="TiemposHeadline-Regular, Georgia, serif" 
                      font-size="48" 
                      font-weight="normal"
                      fill="#e8e8e8" 
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      style="text-shadow: 0 2px 8px rgba(0,0,0,0.8);">${letter}</text>
                
                <!-- Subtle inner shadow effect -->
                <rect x="2" y="2" 
                      width="${svgWidth - 4}" 
                      height="${svgHeight - 4}" 
                      fill="none" 
                      stroke="rgba(0,0,0,0.4)" 
                      stroke-width="1"/>
            </svg>
        `;
    }

    /**
     * Calculates the computed line height of an element in pixels
     * @param {HTMLElement} element
     * @returns {number} Line height in pixels
     */
    function getLineHeight(element) {
        const computed = window.getComputedStyle(element);
        const fontSize = parseFloat(computed.fontSize) || 16;
        const lineHeightValue = computed.lineHeight;

        if (lineHeightValue === 'normal') {
            return fontSize * 1.4;
        }

        const numericValue = parseFloat(lineHeightValue);

        if (Number.isNaN(numericValue)) {
            return fontSize * 1.4;
        }

        if (lineHeightValue.endsWith('px')) {
            return numericValue;
        }

        // Unitless multiplier (e.g., 1.7)
        return fontSize * numericValue;
    }

    /**
     * Applies drop cap to the first paragraph of blog posts
     */
    function initializeDropCap() {
        // Only run on blog post pages
        const contentDiv = document.querySelector('.content');
        if (!contentDiv) return;
        
        // Check if this is a blog post (has date or is in posts directory)
        const isBlogPost = document.body.classList.contains('blog-post') || 
                          window.location.pathname.includes('/posts/');
        
        if (!isBlogPost) return;

        // Find the first paragraph that starts with actual text (not HTML/images)
        const paragraphs = contentDiv.querySelectorAll('p');
        let targetParagraph = null;
        
        for (const p of paragraphs) {
            const text = p.textContent.trim();
            // Skip empty paragraphs or those that start with special characters
            if (text.length > 0 && /^[A-Z]/.test(text)) {
                targetParagraph = p;
                break;
            }
        }
        
        if (!targetParagraph) return;
        
        // Extract the first letter
        // Find the first non-whitespace text node (handles formatted HTML with newlines/indentation)
        let textNode = null;
        for (const node of targetParagraph.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                textNode = node;
                break;
            }
        }
        
        if (!textNode) return;
        
        const fullText = textNode.textContent;
        const trimmedText = fullText.trimStart(); // Remove leading whitespace
        const leadingWhitespace = fullText.substring(0, fullText.length - trimmedText.length);
        const firstLetter = trimmedText.charAt(0);
        const remainingText = trimmedText.substring(1);
        
        if (!firstLetter || !/[A-Z]/.test(firstLetter)) return;

        // Calculate dynamic sizing based on paragraph line height
        const lineHeight = getLineHeight(targetParagraph);
        // Set height to just under 3 lines so it clears properly
        // Subtract a small amount to ensure the 4th line starts below
        const dropCapHeight = (lineHeight * 3) - (lineHeight * 0.05);
        const dropCapWidth = Math.round(dropCapHeight); // keep square aspect
        
        // Create drop cap container
        const dropCapContainer = document.createElement('span');
        dropCapContainer.className = 'drop-cap-container';
        dropCapContainer.setAttribute('data-letter', firstLetter);
        dropCapContainer.style.setProperty('--drop-cap-height', `${dropCapHeight}px`);
        dropCapContainer.style.setProperty('--drop-cap-width', `${dropCapWidth}px`);
        dropCapContainer.style.height = `${dropCapHeight}px`;
        dropCapContainer.style.width = `${dropCapWidth}px`;
        
        // Use frutiger aero design if that theme is active
        const isFrutigerAero = document.body.classList.contains('frutiger-aero');
        dropCapContainer.innerHTML = isFrutigerAero 
            ? generateFrutigerAeroDropCapSVG(firstLetter)
            : generateDropCapSVG(firstLetter);
        
        // Create a span for the remaining text
        const remainingTextSpan = document.createElement('span');
        remainingTextSpan.textContent = remainingText;
        
        // Replace the text node with our new structure
        // Preserve leading whitespace, then add drop cap and remaining text
        if (leadingWhitespace) {
            const whitespaceNode = document.createTextNode(leadingWhitespace);
            targetParagraph.insertBefore(whitespaceNode, textNode);
        }
        targetParagraph.insertBefore(dropCapContainer, textNode);
        targetParagraph.insertBefore(remainingTextSpan, textNode);
        targetParagraph.removeChild(textNode);
        
        // Mark paragraph as having a drop cap for styling
        targetParagraph.classList.add('has-drop-cap');
    }

    /**
     * Reinitialize drop cap (for theme changes)
     */
    function reinitializeDropCap() {
        // Remove existing drop cap if present
        const existingDropCap = document.querySelector('.drop-cap-container');
        const paragraph = document.querySelector('.has-drop-cap');
        
        if (existingDropCap && paragraph) {
            // Get the letter from data attribute
            const letter = existingDropCap.getAttribute('data-letter');
            const remainingTextSpan = existingDropCap.nextElementSibling;
            const remainingText = remainingTextSpan ? remainingTextSpan.textContent : '';
            
            // Remove existing elements
            existingDropCap.remove();
            if (remainingTextSpan) {
                remainingTextSpan.remove();
            }
            
            // Restore original text
            const textNode = document.createTextNode(letter + remainingText);
            paragraph.insertBefore(textNode, paragraph.firstChild);
            paragraph.classList.remove('has-drop-cap');
        }
        
        // Reinitialize
        initializeDropCap();
    }

    /**
     * Watch for theme changes
     */
    function watchForThemeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // Theme changed, regenerate drop cap
                    reinitializeDropCap();
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    /**
     * Initialize when DOM is ready
     * Uses robust ready check that works with deferred scripts
     */
    function initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initializeDropCap();
                watchForThemeChanges();
            });
        } else {
            // DOM already loaded (can happen with defer or cached pages)
            // Use setTimeout to ensure all elements are fully parsed
            setTimeout(() => {
                initializeDropCap();
                watchForThemeChanges();
            }, 0);
        }
    }
    initWhenReady();
})();

