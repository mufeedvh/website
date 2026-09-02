/*
 * Small behaviours for posts: share/follow buttons, sidenote toggles on
 * narrow viewports, and the table of contents (built from the headings
 * inside `.prose`, with a light scroll spy).
 */
(function () {
    'use strict';

    /* ---- Share / follow (called from inline onclick in content) ---- */

    function flashLabel(button, text) {
        var label = button.querySelector('.btn-text') || button;
        if (!button.dataset.originalLabel) button.dataset.originalLabel = label.textContent;
        label.textContent = text;
        setTimeout(function () {
            label.textContent = button.dataset.originalLabel;
        }, 1800);
    }

    window.share_button = function () {
        var button = document.getElementById('share-button');
        var url = window.location.href;
        if (!navigator.clipboard) {
            if (button) flashLabel(button, 'Copy failed');
            return;
        }
        navigator.clipboard.writeText(url).then(
            function () { if (button) flashLabel(button, 'Link copied'); },
            function () { if (button) flashLabel(button, 'Copy failed'); }
        );
    };

    window.twitter_follow = function () {
        window.open('https://x.com/mufeedvh', '_blank', 'noopener');
    };

    /* ---- Sidenotes ---- */

    window.toggleSidenote = function (id) {
        var note = document.getElementById(id);
        if (note) note.classList.toggle('is-open');
    };

    document.addEventListener('click', function (event) {
        var marker = event.target.closest('.sidenote-marker');
        if (!marker) return;
        event.preventDefault();
        window.toggleSidenote(marker.dataset.sidenote);
    });

    /* ---- Table of contents ---- */

    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-');
    }

    function buildToc(toc) {
        var list = toc.querySelector('.toc-list');
        var prose = document.querySelector('.prose');
        if (!list || !prose) return;

        var min = parseInt(toc.dataset.min, 10) || 2;
        var max = parseInt(toc.dataset.max, 10) || 4;

        var headings = Array.prototype.filter.call(
            prose.querySelectorAll('h1, h2, h3, h4, h5, h6'),
            function (heading) {
                var level = parseInt(heading.tagName.charAt(1), 10);
                if (level < min || level > max) return false;
                if (heading.closest('.mnm-widget, .button-wrapper, .toc, .fold')) return false;
                return heading.textContent.trim().length > 0;
            }
        );

        if (headings.length === 0) {
            toc.hidden = true;
            return;
        }

        headings.forEach(function (heading, index) {
            if (!heading.id) {
                var id = slugify(heading.textContent) || 'section-' + index;
                var candidate = id;
                var n = 2;
                while (document.getElementById(candidate)) candidate = id + '-' + n++;
                heading.id = candidate;
            }
            heading.classList.add('toc-anchor');
        });

        var stack = [{ level: null, list: list }];
        var links = [];

        headings.forEach(function (heading) {
            var level = parseInt(heading.tagName.charAt(1), 10);
            while (stack.length > 1 && level < stack[stack.length - 1].level) stack.pop();
            var top = stack[stack.length - 1];

            if (top.level === null) {
                top.level = level;
            } else if (level > top.level) {
                var lastItem = top.list.lastElementChild;
                if (lastItem) {
                    var nested = document.createElement('ol');
                    lastItem.appendChild(nested);
                    stack.push({ level: level, list: nested });
                    top = stack[stack.length - 1];
                } else {
                    top.level = level;
                }
            }

            var item = document.createElement('li');
            var link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.textContent.trim();
            item.appendChild(link);
            top.list.appendChild(item);
            links.push({ link: link, heading: heading });
        });

        var ticking = false;
        function updateActive() {
            ticking = false;
            var threshold = window.scrollY + window.innerHeight * 0.25;
            var current = null;
            for (var i = links.length - 1; i >= 0; i--) {
                if (links[i].heading.offsetTop <= threshold) {
                    current = links[i];
                    break;
                }
            }
            links.forEach(function (entry) {
                entry.link.classList.toggle('is-active', entry === current);
            });
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateActive);
            }
        }, { passive: true });
        updateActive();
    }

    function init() {
        document.querySelectorAll('details.toc').forEach(buildToc);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
