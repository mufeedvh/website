
/// Lazy-load highlight.js only if code blocks are present
function initWhenReady() {
    function init() {
        // Check if there are any code blocks on the page
        const codeBlocks = document.querySelectorAll('pre code');
        if (codeBlocks.length === 0) {
            // No code blocks, skip highlight.js loading
            return;
        }

        // Code blocks exist, load highlight.js dynamically
        loadHighlightJS().then(() => {
            initializeCodeBlocks();
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded
        setTimeout(init, 0);
    }
}
initWhenReady();

function loadHighlightJS() {
    return new Promise((resolve) => {
        // Check if already loaded
        if (window.hljs) {
            resolve();
            return;
        }

        // Load Fira Code font for code blocks
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        // Inline the minimal highlight.js CSS
        const style = document.createElement('style');
        style.textContent = `pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#c9d1d9;background:#0d1117}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#ff7b72}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#d2a8ff}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#79c0ff}.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#a5d6ff}.hljs-built_in,.hljs-symbol{color:#ffa657}.hljs-code,.hljs-comment,.hljs-formula{color:#8b949e}.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#7ee787}.hljs-subst{color:#c9d1d9}.hljs-section{color:#1f6feb;font-weight:700}.hljs-bullet{color:#f2cc60}.hljs-emphasis{color:#c9d1d9;font-style:italic}.hljs-strong{color:#c9d1d9;font-weight:700}.hljs-addition{color:#aff5b4;background-color:#033a16}.hljs-deletion{color:#ffdcd7;background-color:#67060c}`;
        document.head.appendChild(style);

        // Load highlight.js script
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => {
            console.warn('Failed to load highlight.js, code blocks will not be highlighted');
            resolve(); // Resolve anyway so enhanceCodeBlocks still runs
        };
        document.head.appendChild(script);
    });
}

function initializeCodeBlocks() {
    // First, apply syntax highlighting to all code blocks (if hljs loaded)
    if (window.hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
            if (!block.classList.contains('hljs')) {
                window.hljs.highlightElement(block);
            }
        });
    }
    
    // Then enhance them with our custom features
    enhanceCodeBlocks();
}

function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre[data-lang]');
    
    codeBlocks.forEach((pre, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        
        const language = pre.getAttribute('data-lang') || 'text';
        
        const header = createCodeBlockHeader(language, pre, index);
        wrapper.insertBefore(header, pre);
        
        const codeElement = pre.querySelector('code');
        if (codeElement) {
            const lines = codeElement.textContent.split('\n');
            if (lines.length > 5) {
                addLineNumbers(pre, codeElement);
            }

            if (lines.length > 15) {
                addCodePreview(pre, codeElement, wrapper, index);
            }
        }
    });
}

function createCodeBlockHeader(language, pre, index) {
    const header = document.createElement('div');
    header.className = 'code-block-header';
    
    const langLabel = document.createElement('span');
    langLabel.className = 'code-language';
    langLabel.textContent = getLanguageLabel(language);
    
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-button';
    copyButton.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');
    copyButton.setAttribute('data-code-block', index);
    
    copyButton.addEventListener('click', function() {
        copyCodeToClipboard(pre, copyButton);
    });
    
    header.appendChild(langLabel);
    header.appendChild(copyButton);
    
    return header;
}

async function copyCodeToClipboard(pre, button) {
    const codeElement = pre.querySelector('code');
    if (!codeElement) return;
    
    const codeText = codeElement.textContent;
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(codeText);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = codeText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        
        showCopyFeedback(button, true);
    } catch (err) {
        console.error('Failed to copy code:', err);
        showCopyFeedback(button, false);
    }
}

function showCopyFeedback(button, success) {
    const originalHTML = button.innerHTML;
    
    if (success) {
        button.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        button.classList.add('copy-success');
    } else {
        button.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Failed';
        button.classList.add('copy-error');
    }
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('copy-success', 'copy-error');
    }, 2000);
}

function addLineNumbers(pre, codeElement) {
    const lines = codeElement.textContent.split('\n');
    
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'code-line-numbers';
    lineNumbers.setAttribute('aria-hidden', 'true');
    
    for (let i = 1; i <= lines.length; i++) {
        const lineNumber = document.createElement('div');
        lineNumber.textContent = i;
        lineNumbers.appendChild(lineNumber);
    }
    
    pre.classList.add('with-line-numbers');
    pre.insertBefore(lineNumbers, codeElement);
}

function addCodePreview(pre, codeElement, wrapper, index) {
    const originalText = codeElement.textContent;
    const lines = originalText.split('\n');

    pre.setAttribute('data-original-text', originalText);
    pre.setAttribute('data-is-collapsed', 'true');

    pre.classList.add('code-preview-mode');

    const lineNumbers = pre.querySelector('.code-line-numbers');
    if (lineNumbers) {
        lineNumbers.innerHTML = '';
        for (let i = 1; i <= lines.length; i++) {
            const lineNumber = document.createElement('div');
            lineNumber.textContent = i;
            lineNumbers.appendChild(lineNumber);
        }
    }

    const blurOverlay = document.createElement('div');
    blurOverlay.className = 'code-blur-overlay';
    blurOverlay.setAttribute('data-code-block', index);

    const expandButton = document.createElement('button');
    expandButton.className = 'code-expand-button';
    expandButton.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px"><polyline points="6 9 12 15 18 9"></polyline></svg> Show more';
    expandButton.setAttribute('aria-label', 'Expand code block');
    expandButton.setAttribute('data-code-block', index);
    
    expandButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleCodeExpansion(pre, lineNumbers, blurOverlay, expandButton, lines, index);
    });
    
    blurOverlay.appendChild(expandButton);
    wrapper.appendChild(blurOverlay);

    document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target) && pre.getAttribute('data-is-collapsed') === 'false') {
            toggleCodeExpansion(pre, lineNumbers, blurOverlay, expandButton, lines, index);
        }
    });
}

function toggleCodeExpansion(pre, lineNumbers, blurOverlay, expandButton, lines, index) {
    const isCollapsed = pre.getAttribute('data-is-collapsed') === 'true';
    
    if (isCollapsed) {
        
        pre.classList.remove('code-preview-mode');

        if (lineNumbers) {
            lineNumbers.innerHTML = '';
            for (let i = 1; i <= lines.length; i++) {
                const lineNumber = document.createElement('div');
                lineNumber.textContent = i;
                lineNumbers.appendChild(lineNumber);
            }
        }

        expandButton.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px"><polyline points="18 15 12 9 6 15"></polyline></svg> Show less';
        blurOverlay.classList.add('expanded');
        pre.setAttribute('data-is-collapsed', 'false');
    } else {
        
        pre.classList.add('code-preview-mode');

        if (lineNumbers) {
            lineNumbers.innerHTML = '';
            for (let i = 1; i <= 15; i++) {
                const lineNumber = document.createElement('div');
                lineNumber.textContent = i;
                lineNumbers.appendChild(lineNumber);
            }
        }

        expandButton.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px"><polyline points="6 9 12 15 18 9"></polyline></svg> Show more';
        blurOverlay.classList.remove('expanded');
        pre.setAttribute('data-is-collapsed', 'true');
    }
}

function getLanguageLabel(lang) {
    const languageMap = {
        'javascript': 'JavaScript',
        'js': 'JavaScript',
        'typescript': 'TypeScript',
        'ts': 'TypeScript',
        'python': 'Python',
        'py': 'Python',
        'java': 'Java',
        'c': 'C',
        'cpp': 'C++',
        'csharp': 'C#',
        'cs': 'C#',
        'php': 'PHP',
        'ruby': 'Ruby',
        'rb': 'Ruby',
        'go': 'Go',
        'rust': 'Rust',
        'rs': 'Rust',
        'kotlin': 'Kotlin',
        'kt': 'Kotlin',
        'swift': 'Swift',
        'objective-c': 'Objective-C',
        'objc': 'Objective-C',
        'sql': 'SQL',
        'html': 'HTML',
        'xml': 'XML',
        'css': 'CSS',
        'scss': 'SCSS',
        'sass': 'Sass',
        'less': 'Less',
        'json': 'JSON',
        'yaml': 'YAML',
        'yml': 'YAML',
        'markdown': 'Markdown',
        'md': 'Markdown',
        'bash': 'Bash',
        'shell': 'Shell',
        'sh': 'Shell',
        'powershell': 'PowerShell',
        'ps1': 'PowerShell',
        'dockerfile': 'Dockerfile',
        'makefile': 'Makefile',
        'cmake': 'CMake',
        'nginx': 'Nginx',
        'apache': 'Apache',
        'vim': 'Vim',
        'lua': 'Lua',
        'perl': 'Perl',
        'r': 'R',
        'scala': 'Scala',
        'haskell': 'Haskell',
        'hs': 'Haskell',
        'elixir': 'Elixir',
        'ex': 'Elixir',
        'clojure': 'Clojure',
        'clj': 'Clojure',
        'dart': 'Dart',
        'julia': 'Julia',
        'jl': 'Julia',
        'toml': 'TOML',
        'ini': 'INI',
        'diff': 'Diff',
        'text': 'Plain Text',
        'plaintext': 'Plain Text'
    };
    
    return languageMap[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
}
