+++
title = "Vibe Report"
description = "a page for vibe report; art, interiors, and pics that i like straight from my gallery and twitter."

[extra]
no_header = true
noindex = true
+++

<div class="center-content" style="margin-bottom: var(--space-8);">
<h1 style="font-family: var(--font-fancy); font-size: 3.5rem; margin-bottom: 0;">Vibe Report</h1>
<p style="font-family: var(--font-display); text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-secondary); font-size: var(--text-xs);">art, interiors, and pics that i like. straight from my gallery and twitter.</p>
</div>

<div class="gallery" id="polaroid-gallery">
    {{ gallery() }}
</div>

<script>
(function() {
    var photos = document.querySelectorAll('#polaroid-gallery .polaroid');
    var totalDuration = 600;
    var perPhoto = 250;

    photos.forEach(function(p, i) {
        var rot = (Math.random() - 0.5) * 30;
        var tx = (Math.random() - 0.5) * 20;
        var ty = (Math.random() - 0.5) * 20;
        var scatter = 'rotate(' + rot + 'deg) translate(' + tx + 'px, ' + ty + 'px)';
        p.style.setProperty('--scatter', scatter);
        p.dataset.scatter = scatter;

        var delay = Math.random() * totalDuration;
        p.style.animation = 'polaroidDrop ' + perPhoto + 'ms ' + delay + 'ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';

        p.addEventListener('animationend', function() {
            p.style.animation = '';
            p.style.transform = scatter;
            p.classList.add('landed');
        });

        p.addEventListener('click', function(e) {
            e.preventDefault();
            openLightbox(i);
        });

        p.addEventListener('mouseenter', function() {
            if (p.classList.contains('landed')) {
                p.style.transform = 'rotate(0deg) scale(1.15) translateY(-8px)';
            }
        });

        p.addEventListener('mouseleave', function() {
            if (p.classList.contains('landed')) {
                p.style.transform = p.dataset.scatter;
            }
        });
    });

    var srcs = [];
    photos.forEach(function(p) { srcs.push(p.href); });
    var currentIndex = -1;
    var overlay = null;
    var lbImg = null;

    function openLightbox(index) {
        currentIndex = index;
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'lightbox-overlay';

            var btnPrev = document.createElement('button');
            btnPrev.className = 'lightbox-arrow lightbox-prev';
            btnPrev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 4l-8 8 8 8"/></svg>';
            btnPrev.addEventListener('click', function(e) { e.stopPropagation(); navigate(-1); });

            var btnNext = document.createElement('button');
            btnNext.className = 'lightbox-arrow lightbox-next';
            btnNext.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 4l8 8-8 8"/></svg>';
            btnNext.addEventListener('click', function(e) { e.stopPropagation(); navigate(1); });

            lbImg = document.createElement('img');
            overlay.appendChild(btnPrev);
            overlay.appendChild(lbImg);
            overlay.appendChild(btnNext);
            document.body.appendChild(overlay);

            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) closeLightbox();
            });
        } else {
            overlay.style.display = 'flex';
            overlay.style.opacity = '';
        }
        lbImg.src = srcs[currentIndex];
        lbImg.style.animation = 'none';
        void lbImg.offsetWidth;
        lbImg.style.animation = '';
    }

    function closeLightbox() {
        if (!overlay) return;
        overlay.style.opacity = '0';
        setTimeout(function() { overlay.style.display = 'none'; }, 150);
        currentIndex = -1;
    }

    function navigate(dir) {
        if (currentIndex < 0) return;
        currentIndex = (currentIndex + dir + srcs.length) % srcs.length;
        lbImg.style.animation = 'none';
        void lbImg.offsetWidth;
        lbImg.src = srcs[currentIndex];
        lbImg.style.animation = '';
    }

    document.addEventListener('keydown', function(e) {
        if (currentIndex < 0) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') navigate(-1);
        else if (e.key === 'ArrowRight') navigate(1);
    });
})();
</script>

credits: _these are sourced from twitter, pinterest, random google search, etc. i didn't keep any record._

some of my favourite twitter accounts sharing some good photographs/art:
- [@simonsarris](https://twitter.com/simonsarris)
- [@palmreport](https://twitter.com/palmreport)
- [@ennntropy](https://twitter.com/ennntropy)
- [@ruralindexing](https://twitter.com/ruralindexing)
- [@curzthetics](https://twitter.com/curzthetics)
- [@16pxl](https://twitter.com/16pxl)
- [@spaceliminalbot](https://twitter.com/SpaceLiminalBot)
- [@artindetails](https://twitter.com/artindetails)
