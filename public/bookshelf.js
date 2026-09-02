/*
 * Bookshelf: each book turns toward the cursor.
 *
 * The pointer's position over a book's stage is normalised to [-1, 1] on
 * both axes. The side under the cursor swings toward the viewer (left
 * reveals the spine, right the page edges, top the head, bottom the tail),
 * the book lifts off its plank, and a light sheen and floor shadow follow.
 * Values are eased toward their targets in a requestAnimationFrame loop that
 * stops when everything settles, so idle books cost nothing.
 *
 * Only runs for fine pointers that can hover, and never when the visitor
 * prefers reduced motion; the CSS rest pose already shows the book's depth.
 */
(function () {
    'use strict';

    var MAX_TURN = 50;      /* degrees about the vertical axis */
    var MAX_LEAN = 20;      /* degrees about the horizontal axis */
    var LIFT = 38;          /* px toward the viewer while hovered */
    var EASE = 0.14;        /* per-frame interpolation factor */

    var REST = { rx: 0, ry: 26, lift: 0, sx: 0.3, sy: 0.2, sheen: 0.3, shx: 0, shs: 1, sho: 0.7 };
    var PRESENTED = { rx: -6, ry: 34, lift: LIFT, sx: 0.4, sy: 0.3, sheen: 0.5, shx: -6, shs: 1.16, sho: 1 };

    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduceMotion) return;

    function clamp(value) {
        return Math.min(1, Math.max(-1, value));
    }

    function animateBook(stage) {
        var book = stage.querySelector('.book-3d');
        if (!book) return;

        var current = Object.assign({}, REST);
        var target = Object.assign({}, REST);
        var frame = 0;

        function paint() {
            book.style.setProperty('--rx', current.rx.toFixed(2) + 'deg');
            book.style.setProperty('--ry', current.ry.toFixed(2) + 'deg');
            book.style.setProperty('--lift', current.lift.toFixed(2) + 'px');
            stage.style.setProperty('--mx', (current.sx * 100).toFixed(1) + '%');
            stage.style.setProperty('--my', (current.sy * 100).toFixed(1) + '%');
            stage.style.setProperty('--sheen', current.sheen.toFixed(3));
            stage.style.setProperty('--shx', current.shx.toFixed(2) + 'px');
            stage.style.setProperty('--shs', current.shs.toFixed(3));
            stage.style.setProperty('--sho', current.sho.toFixed(3));
        }

        function step() {
            var settled = true;
            for (var key in target) {
                var delta = target[key] - current[key];
                if (Math.abs(delta) < 0.005) {
                    current[key] = target[key];
                } else {
                    current[key] += delta * EASE;
                    settled = false;
                }
            }
            paint();
            frame = settled ? 0 : window.requestAnimationFrame(step);
            if (settled) book.classList.remove('is-live');
        }

        function nudge() {
            book.classList.add('is-live');
            if (!frame) frame = window.requestAnimationFrame(step);
        }

        function aimAt(clientX, clientY) {
            var rect = stage.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            var px = clamp(((clientX - rect.left) / rect.width) * 2 - 1);
            var py = clamp(((clientY - rect.top) / rect.height) * 2 - 1);
            target.ry = -px * MAX_TURN;
            target.rx = py * MAX_LEAN;
            target.lift = LIFT;
            target.sx = (px + 1) / 2;
            target.sy = (py + 1) / 2;
            target.sheen = 0.55;
            target.shx = -px * 12;
            target.shs = 1.18;
            target.sho = 1;
            nudge();
        }

        function rest() {
            Object.assign(target, REST);
            nudge();
        }

        stage.addEventListener('pointermove', function (event) {
            aimAt(event.clientX, event.clientY);
        });
        stage.addEventListener('pointerleave', rest);
        stage.addEventListener('focus', function () {
            Object.assign(target, PRESENTED);
            nudge();
        });
        stage.addEventListener('blur', rest);

        paint();
    }

    function init() {
        document.querySelectorAll('.book-stage').forEach(animateBook);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
