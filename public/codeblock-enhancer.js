/*
 * Code blocks: language label, copy button, and a fold for long listings.
 * Syntax colours come from Zola's server-side highlighter (highlight_theme
 * = "css"); the only client-side colouring is the MNM Lang candy palette,
 * which no highlighter knows about.
 */
(function () {
    'use strict';

    var COLLAPSE_AFTER = 24;
    var MNM_CLASSES = { B: 'mnm-blue', G: 'mnm-green', R: 'mnm-red', Y: 'mnm-yellow', O: 'mnm-orange', N: 'mnm-brown' };

    function languageOf(pre, code) {
        var lang = pre.getAttribute('data-lang');
        if (!lang && code) {
            var match = code.className.match(/language-([\w+#-]+)/);
            if (match) lang = match[1];
        }
        if (lang === 'text' || lang === 'txt' || lang === 'plain') return '';
        return lang || '';
    }

    function makeCopyButton(source) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-copy';
        button.textContent = 'copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');

        function settle(text, done) {
            button.textContent = text;
            button.classList.toggle('is-done', done);
            setTimeout(function () {
                button.textContent = 'copy';
                button.classList.remove('is-done');
            }, 1600);
        }

        button.addEventListener('click', function () {
            if (!navigator.clipboard) return settle('unavailable', false);
            navigator.clipboard.writeText(source.textContent.replace(/\n$/, '')).then(
                function () { settle('copied', true); },
                function () { settle('failed', false); }
            );
        });
        return button;
    }

    function enhance(pre) {
        if (pre.closest('.mnm-widget') || pre.parentElement.classList.contains('code-block')) return;

        var code = pre.querySelector('code');
        var source = code || pre;

        var block = document.createElement('div');
        block.className = 'code-block';
        pre.parentNode.insertBefore(block, pre);
        block.appendChild(pre);

        var tools = document.createElement('div');
        tools.className = 'code-tools';
        var lang = languageOf(pre, code);
        if (lang) {
            var label = document.createElement('span');
            label.className = 'code-lang';
            label.textContent = lang;
            tools.appendChild(label);
        }
        tools.appendChild(makeCopyButton(source));
        block.appendChild(tools);

        var lines = source.textContent.replace(/\n$/, '').split('\n').length;
        if (lines > COLLAPSE_AFTER) {
            block.classList.add('is-collapsed');
            var expand = document.createElement('button');
            expand.type = 'button';
            expand.className = 'code-expand';
            var expandLabel = 'show all ' + lines + ' lines';
            expand.textContent = expandLabel;
            expand.addEventListener('click', function () {
                var collapsed = block.classList.toggle('is-collapsed');
                expand.textContent = collapsed ? expandLabel : 'collapse';
                if (collapsed) block.scrollIntoView({ block: 'nearest' });
            });
            block.appendChild(expand);
        }
    }

    function colourMnm(code) {
        if (code.classList.contains('mnm-highlighted')) return;
        var html = '';
        var text = code.textContent;
        for (var i = 0; i < text.length; i++) {
            var ch = text.charAt(i);
            var cls = MNM_CLASSES[ch];
            html += cls ? '<span class="' + cls + '">' + ch + '</span>' : ch === '<' ? '&lt;' : ch === '&' ? '&amp;' : ch;
        }
        code.innerHTML = html;
        code.classList.add('mnm-highlighted');
    }

    function init() {
        document.querySelectorAll('pre code.language-mnm, pre[data-lang="mnm"] > code').forEach(colourMnm);
        document.querySelectorAll('pre').forEach(enhance);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
