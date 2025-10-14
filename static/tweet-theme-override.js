(function() {
    'use strict';

    function configureTweetEmbeds() {
        const tweets = document.querySelectorAll('blockquote.twitter-tweet');
        tweets.forEach(tweet => {
            tweet.setAttribute('data-theme', 'dark');
            tweet.setAttribute('data-dnt', 'true');
        });
    }

    function forceCompactStyle() {
        const containers = document.querySelectorAll('.twitter-tweet-rendered');
        containers.forEach(container => {
            const iframe = container.querySelector('iframe');
            if (!iframe) {
                return;
            }

            iframe.removeAttribute('width');

            let wrapper = container.querySelector('.tweet-embed-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'tweet-embed-wrapper';
                container.insertBefore(wrapper, container.firstChild);
            }

            if (!wrapper.contains(iframe)) {
                wrapper.appendChild(iframe);
            }

            if (!iframe.dataset.tweetCompactLoadBound) {
                iframe.dataset.tweetCompactLoadBound = 'true';
                iframe.addEventListener('load', () => {
                    requestAnimationFrame(forceCompactStyle);
                });
            }

            const availableWidth = container.clientWidth;
            const targetWidth = clampWidth(availableWidth);
            const nextScale = calculateScale(targetWidth);
            const previousScale = parseFloat(iframe.dataset.tweetAppliedScale) || 1;

            let baselineHeight = parseFloat(iframe.dataset.tweetBaselineHeight);
            if (!Number.isFinite(baselineHeight) || baselineHeight <= 0) {
                const measuredHeight = iframe.getBoundingClientRect().height || iframe.offsetHeight || getNumericStyle(iframe, 'height');
                if (measuredHeight > 0) {
                    baselineHeight = measuredHeight / previousScale;
                    iframe.dataset.tweetBaselineHeight = String(baselineHeight);
                }
            }

            iframe.dataset.tweetAppliedScale = String(nextScale);

            wrapper.style.setProperty('margin', '0 auto', 'important');
            wrapper.style.setProperty('width', `${targetWidth}px`, 'important');
            wrapper.style.setProperty('max-width', '100%', 'important');
            wrapper.style.setProperty('line-height', '0', 'important');

            iframe.style.setProperty('transform', `scale(${nextScale})`, 'important');
            iframe.style.setProperty('transform-origin', 'top center', 'important');
            iframe.style.setProperty('margin', '0', 'important');
            iframe.style.setProperty('display', 'block', 'important');

            if (baselineHeight > 0) {
                const scaledHeight = baselineHeight * nextScale;

                wrapper.style.setProperty('height', `${Math.ceil(scaledHeight)}px`, 'important');
                // Don't set fixed height or negative margin on container - let it flow naturally
                container.style.removeProperty('height');
                container.style.setProperty('margin-bottom', '1.5em', 'important');
                container.style.setProperty('padding-bottom', '0', 'important');
            } else {
                wrapper.style.removeProperty('height');
                container.style.removeProperty('height');
                container.style.setProperty('margin-bottom', '1.5em', 'important');
            }
        });

        function calculateScale(baseWidth) {
            if (!baseWidth || baseWidth <= 0) {
                return 0.7;
            }

            if (baseWidth >= 560) {
                return 0.7;
            }

            const minWidth = 320;
            const maxScale = 0.9;
            const minScale = 0.65;

            if (baseWidth <= minWidth) {
                return maxScale;
            }

            const ratio = (baseWidth - minWidth) / (560 - minWidth);
            return Math.max(minScale, Math.min(maxScale, maxScale - (maxScale - minScale) * ratio));
        }

        function clampWidth(width) {
            const min = 320;
            const max = 560;

            if (!width || width <= 0) {
                return max;
            }

            return Math.max(min, Math.min(width, max));
        }

        function getNumericStyle(el, prop) {
            const value = window.getComputedStyle(el).getPropertyValue(prop);
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
        }
    }

    configureTweetEmbeds();

    const observer = new MutationObserver((mutations) => {
        let needsUpdate = false;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.classList && node.classList.contains('twitter-tweet-rendered')) {
                        needsUpdate = true;
                    }
                    if (node.querySelector && node.querySelector('.twitter-tweet-rendered')) {
                        needsUpdate = true;
                    }
                }
            });
        });
        if (needsUpdate) {
            setTimeout(forceCompactStyle, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            configureTweetEmbeds();
            setTimeout(forceCompactStyle, 500);
            setTimeout(forceCompactStyle, 1000);
            setTimeout(forceCompactStyle, 2000);
            setTimeout(forceCompactStyle, 3000);
        });
    } else {
        setTimeout(forceCompactStyle, 500);
        setTimeout(forceCompactStyle, 1000);
        setTimeout(forceCompactStyle, 2000);
        setTimeout(forceCompactStyle, 3000);
    }

    window.addEventListener('load', () => {
        setTimeout(forceCompactStyle, 500);
        setTimeout(forceCompactStyle, 1500);
    });
    
    let resizeTimeoutId;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeoutId);
        resizeTimeoutId = setTimeout(forceCompactStyle, 180);
    });
})();
