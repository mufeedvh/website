
(function() {
    function init() {
        const codeBlocks = document.querySelectorAll('pre');
        if (codeBlocks.length === 0) return;

        codeBlocks.forEach((pre, index) => {
            if (pre.parentElement.classList.contains('code-block-wrapper')) return;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
            
            const codeElement = pre.querySelector('code');
            let language = pre.getAttribute('data-lang');
            if (!language && codeElement && codeElement.className) {
                const match = codeElement.className.match(/language-(\w+)/);
                if (match) language = match[1];
            }
            language = language || 'text';
            
            const header = document.createElement('div');
            header.className = 'code-block-header';
            header.innerHTML = `<span class="code-language">${language.toUpperCase()}</span><button class="code-copy-button">COPY</button>`;
            wrapper.insertBefore(header, pre);
            
            header.querySelector('.code-copy-button').onclick = function() {
                const text = codeElement ? codeElement.textContent : pre.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    this.textContent = 'COPIED!';
                    setTimeout(() => this.textContent = 'COPY', 2000);
                });
            };
            
            const text = (codeElement ? codeElement.textContent : pre.textContent).trim();
            const lines = text.split('\n');
            
            if (lines.length > 5 && codeElement) {
                const lineNumbers = document.createElement('div');
                lineNumbers.className = 'code-line-numbers';
                lineNumbers.setAttribute('aria-hidden', 'true');
                for (let i = 1; i <= lines.length; i++) {
                    const div = document.createElement('div');
                    div.textContent = i;
                    lineNumbers.appendChild(div);
                }
                pre.classList.add('with-line-numbers');
                pre.insertBefore(lineNumbers, codeElement);
            }

            if (lines.length > 20) {
                pre.classList.add('code-preview-mode');
                pre.setAttribute('data-collapsed', 'true');
                const overlay = document.createElement('div');
                overlay.className = 'code-blur-overlay';
                const btn = document.createElement('button');
                btn.className = 'code-expand-button';
                btn.textContent = 'SHOW MORE';
                btn.onclick = () => {
                    const isCollapsed = pre.getAttribute('data-collapsed') === 'true';
                    pre.setAttribute('data-collapsed', !isCollapsed);
                    pre.classList.toggle('code-preview-mode');
                    overlay.classList.toggle('expanded');
                    btn.textContent = isCollapsed ? 'SHOW LESS' : 'SHOW MORE';
                };
                overlay.appendChild(btn);
                wrapper.appendChild(overlay);
            }
        });

        // Dynamic load highlight.js
        if (!window.hljs) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
            script.onload = () => {
                document.querySelectorAll('pre code').forEach(el => window.hljs.highlightElement(el));
            };
            document.head.appendChild(script);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
