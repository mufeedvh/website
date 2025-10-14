
/// Initialize with robust ready check
function initWhenReady() {
    function init() {
        // Wait for highlight.js to load
        if (window.hljs) {
            initializeCodeBlocks();
        } else {
            // If hljs hasn't loaded yet, wait for it
            const checkHljs = setInterval(function() {
                if (window.hljs) {
                    clearInterval(checkHljs);
                    initializeCodeBlocks();
                }
            }, 50);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded
        setTimeout(init, 0);
    }
}
initWhenReady();

function initializeCodeBlocks() {
    // First, apply syntax highlighting to all code blocks
    document.querySelectorAll('pre code').forEach((block) => {
        if (!block.classList.contains('hljs')) {
            window.hljs.highlightElement(block);
        }
    });
    
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
    copyButton.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
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
        button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        button.classList.add('copy-success');
    } else {
        button.innerHTML = '<i class="fa-solid fa-times"></i> Failed';
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
    expandButton.innerHTML = '<i class="fa-solid fa-chevron-down"></i> Show more';
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

        expandButton.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Show less';
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

        expandButton.innerHTML = '<i class="fa-solid fa-chevron-down"></i> Show more';
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