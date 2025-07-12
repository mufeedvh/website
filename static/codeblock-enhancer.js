/**
 * Code Block Enhancer
 * Adds copy functionality, line numbers, and language labels to code blocks
 * 
 * Features:
 * - Copy button with clipboard functionality
 * - Optional line numbers
 * - Language labels
 * - Success feedback on copy
 * - Responsive design
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all code blocks on the page
    enhanceCodeBlocks();
});

/**
 * Main function to enhance all code blocks on the page
 */
function enhanceCodeBlocks() {
    // Select all pre elements that contain code blocks
    const codeBlocks = document.querySelectorAll('pre[data-lang]');
    
    codeBlocks.forEach((pre, index) => {
        // Create a wrapper div for the code block
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        // Insert wrapper before the pre element and move pre inside it
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        
        // Get the language from data-lang attribute
        const language = pre.getAttribute('data-lang') || 'text';
        
        // Create header with language label and copy button
        const header = createCodeBlockHeader(language, pre, index);
        wrapper.insertBefore(header, pre);
        
        // Add line numbers if the code block has more than 5 lines
        const codeElement = pre.querySelector('code');
        if (codeElement) {
            const lines = codeElement.textContent.split('\n');
            if (lines.length > 5) {
                addLineNumbers(pre, codeElement);
            }
        }
    });
}

/**
 * Creates the header for a code block with language label and copy button
 * @param {string} language - The programming language
 * @param {HTMLElement} pre - The pre element containing the code
 * @param {number} index - The index of the code block
 * @returns {HTMLElement} The header element
 */
function createCodeBlockHeader(language, pre, index) {
    const header = document.createElement('div');
    header.className = 'code-block-header';
    
    // Create language label
    const langLabel = document.createElement('span');
    langLabel.className = 'code-language';
    langLabel.textContent = getLanguageLabel(language);
    
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-button';
    copyButton.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');
    copyButton.setAttribute('data-code-block', index);
    
    // Add click event to copy button
    copyButton.addEventListener('click', function() {
        copyCodeToClipboard(pre, copyButton);
    });
    
    header.appendChild(langLabel);
    header.appendChild(copyButton);
    
    return header;
}

/**
 * Copies code content to clipboard
 * @param {HTMLElement} pre - The pre element containing the code
 * @param {HTMLElement} button - The copy button element
 */
async function copyCodeToClipboard(pre, button) {
    const codeElement = pre.querySelector('code');
    if (!codeElement) return;
    
    // Get the raw text content without line numbers
    const codeText = codeElement.textContent;
    
    try {
        // Use modern clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(codeText);
        } else {
            // Fallback for older browsers or non-secure contexts
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
        
        // Show success feedback
        showCopyFeedback(button, true);
    } catch (err) {
        console.error('Failed to copy code:', err);
        showCopyFeedback(button, false);
    }
}

/**
 * Shows visual feedback after copy attempt
 * @param {HTMLElement} button - The copy button element
 * @param {boolean} success - Whether the copy was successful
 */
function showCopyFeedback(button, success) {
    const originalHTML = button.innerHTML;
    
    if (success) {
        button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        button.classList.add('copy-success');
    } else {
        button.innerHTML = '<i class="fa-solid fa-times"></i> Failed';
        button.classList.add('copy-error');
    }
    
    // Reset button after 2 seconds
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('copy-success', 'copy-error');
    }, 2000);
}

/**
 * Adds line numbers to a code block
 * @param {HTMLElement} pre - The pre element
 * @param {HTMLElement} codeElement - The code element
 */
function addLineNumbers(pre, codeElement) {
    const lines = codeElement.textContent.split('\n');
    
    // Create line numbers container
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'code-line-numbers';
    lineNumbers.setAttribute('aria-hidden', 'true');
    
    // Generate line numbers
    for (let i = 1; i <= lines.length; i++) {
        const lineNumber = document.createElement('div');
        lineNumber.textContent = i;
        lineNumbers.appendChild(lineNumber);
    }
    
    // Add line numbers to the pre element
    pre.classList.add('with-line-numbers');
    pre.insertBefore(lineNumbers, codeElement);
}

/**
 * Gets a human-readable label for a programming language
 * @param {string} lang - The language identifier
 * @returns {string} The language label
 */
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