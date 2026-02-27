+++
title = "The Rabbit Hole"
description = "Curiosity killed the cat, but satisfaction brought it back."

[extra]
no_header = true
drop_cap = true
+++

<audio id="rabbithole-audio" src="/assets/sounds/curious-alice.mp3" autoplay loop></audio>
<button id="rabbithole-mute" class="rabbithole-mute-btn" aria-label="Mute audio" title="Mute audio">
    <svg id="mute-icon-on" class="mute-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
    <svg id="mute-icon-off" class="mute-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
</button>

<div class="center-content" style="margin-bottom: var(--space-12);">
<h1 style="font-family: var(--font-fancy); font-size: 5rem; margin-bottom: 0;">🐇</h1>
<p style="font-family: var(--font-display); text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-secondary);">Down the Rabbit Hole</p>
</div>

<div class="drop-cap">
<p>You've found a way into the subterranean passages of this digital garden. This is a space for things that don't quite fit elsewhere—unfinished thoughts, digital ephemera, and direct lines of communication that bypass the usual protocols of the surface web.</p>
</div>

<blockquote>
"But I don't want to go among mad people," Alice remarked. "Oh, you can't help that," said the Cat: "we're all mad here. I'm mad. You're mad."
<cite>Lewis Carroll, Alice in Wonderland</cite>
</blockquote>

<div class="cta-row">
{{ button(text="Leave an Anonymous Message", icon="fa-regular fa-message", href="/message") }}
</div>

<div class="directory-section" style="margin-top: var(--space-12);">
<h2>Other Paths</h2>
<ul class="directory-list">
<li><a href="/about">Who is behind this?</a></li>
<li><a href="/posts">Read the formal logs</a></li>
<li><a href="/">Return to the entrance</a></li>
</ul>
</div>

<script>
(function() {
    var audio = document.getElementById('rabbithole-audio');
    var btn = document.getElementById('rabbithole-mute');
    var iconOn = document.getElementById('mute-icon-on');
    var iconOff = document.getElementById('mute-icon-off');
    var muted = false;

    function syncUI() {
        iconOn.style.display = muted ? 'none' : 'block';
        iconOff.style.display = muted ? 'block' : 'none';
        btn.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
        btn.setAttribute('title', muted ? 'Unmute audio' : 'Mute audio');
    }

    audio.volume = 0.4;

    var playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(function() {
            function resumeAudio() {
                audio.play();
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
            }
            document.addEventListener('click', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
        });
    }

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        muted = !muted;
        audio.muted = muted;
        syncUI();
    });
})();
</script>