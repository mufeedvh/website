/**
 * Blog Post Action Handlers
 * Handles share button and social media follow actions
 */

function share_button() {
    const url = window.location.href;
    const title = document.title;
    
    // Try native Web Share API first (mobile)
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch((error) => {
            // User cancelled, fallback to copy
            copyUrlToClipboard(url);
        });
    } else {
        // Desktop - copy to clipboard
        copyUrlToClipboard(url);
    }
}

function twitter_follow() {
    window.open('https://x.com/mufeedvh', '_blank', 'noopener,noreferrer');
}

function copyUrlToClipboard(url) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => {
            showShareFeedback(true);
        }).catch(() => {
            showShareFeedback(false);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showShareFeedback(true);
        } catch (err) {
            showShareFeedback(false);
        }
        textArea.remove();
    }
}

function showShareFeedback(success) {
    const button = document.getElementById('share-button');
    if (!button) return;
    
    const originalHTML = button.innerHTML;
    
    if (success) {
        button.innerHTML = button.innerHTML.replace('Link to this article', 'Link copied!');
        button.style.backgroundColor = '#1a472a';
        button.style.borderColor = '#2d7a4d';
        button.style.color = '#7ee3a8';
    } else {
        button.innerHTML = button.innerHTML.replace('Link to this article', 'Failed to copy');
        button.style.backgroundColor = '#5c1a1a';
        button.style.borderColor = '#8c2e2e';
        button.style.color = '#ff9999';
    }
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.backgroundColor = '';
        button.style.borderColor = '';
        button.style.color = '';
    }, 2000);
}

