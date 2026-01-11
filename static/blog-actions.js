
function share_button() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('share-button');
        if (btn) {
            const original = btn.textContent;
            btn.textContent = 'LINK COPIED!';
            setTimeout(() => btn.textContent = original, 2000);
        }
    });
}

function twitter_follow() {
    window.open('https://x.com/mufeedvh', '_blank');
}

/* Rabbit Hole Discovery Logic */
document.addEventListener('DOMContentLoaded', () => {
    const rabbitLink = document.querySelector('.rabbit-hole-link');
    const logoMonogram = document.querySelector('.logo-monogram');
    
    if (rabbitLink && logoMonogram) {
        const revealRabbit = () => {
            if (!rabbitLink.classList.contains('visible')) {
                // Wait for the "MUFEED VH" text animation to complete (~1s)
                // Total duration = max delay (0.45s) + transition duration (0.5s) + buffer
                setTimeout(() => {
                    rabbitLink.classList.add('visible', 'falling');
                }, 1000);
            }
        };

        logoMonogram.addEventListener('mouseenter', revealRabbit, { once: true });
        logoMonogram.addEventListener('click', revealRabbit, { once: true });
        // For mobile touch
        logoMonogram.addEventListener('touchstart', revealRabbit, { once: true, passive: true });
    }
});
