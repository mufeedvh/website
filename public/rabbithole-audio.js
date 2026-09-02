(function() {
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    var isRabbitHole = path.startsWith('/rabbithole') || path.startsWith('/message');

    if (!isRabbitHole) return;

    var audio = document.createElement('audio');
    audio.src = '/assets/sounds/curious-alice.mp3';
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'auto';

    var savedTime = parseFloat(sessionStorage.getItem('rh-time')) || 0;
    var savedMuted = sessionStorage.getItem('rh-muted') === '1';

    audio.muted = savedMuted;

    function tryPlay() {
        var p = audio.play();
        if (p !== undefined) {
            p.catch(function() {
                function resume() {
                    audio.play();
                    document.removeEventListener('click', resume);
                    document.removeEventListener('keydown', resume);
                }
                document.addEventListener('click', resume);
                document.addEventListener('keydown', resume);
            });
        }
    }

    audio.addEventListener('loadedmetadata', function() {
        if (savedTime > 0 && savedTime < audio.duration) {
            audio.currentTime = savedTime;
        }
        tryPlay();
    }, { once: true });

    var lastSave = 0;
    audio.addEventListener('timeupdate', function() {
        var now = Date.now();
        if (now - lastSave > 500) {
            sessionStorage.setItem('rh-time', audio.currentTime);
            lastSave = now;
        }
    });

    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('rh-time', audio.currentTime);
        sessionStorage.setItem('rh-muted', audio.muted ? '1' : '0');
    });

    var btn = document.createElement('button');
    btn.className = 'rabbithole-mute-btn';

    var svgOn = '<svg class="mute-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
        + '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>'
        + '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>'
        + '</svg>';

    var svgOff = '<svg class="mute-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
        + '<line x1="23" y1="9" x2="17" y2="15"/>'
        + '<line x1="17" y1="9" x2="23" y2="15"/>'
        + '</svg>';

    function syncUI() {
        btn.innerHTML = audio.muted ? svgOff : svgOn;
        btn.setAttribute('aria-label', audio.muted ? 'Unmute audio' : 'Mute audio');
        btn.setAttribute('title', audio.muted ? 'Unmute audio' : 'Mute audio');
    }

    syncUI();

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        audio.muted = !audio.muted;
        sessionStorage.setItem('rh-muted', audio.muted ? '1' : '0');
        syncUI();
        if (!audio.muted) tryPlay();
    });

    document.body.appendChild(btn);
})();
