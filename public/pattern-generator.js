(function () {
    var el = document.getElementById('pattern-border');
    if (!el) return;

    var dpr = window.devicePixelRatio || 1;
    var cvs = document.createElement('canvas');
    var ctx = cvs.getContext('2d');
    el.appendChild(cvs);

    var H = 34;
    var chosen = Math.floor(Math.random() * 9);
    var S = {
        tw: 18 + Math.floor(Math.random() * 28),
        n: 4 + Math.floor(Math.random() * 5),
        f: 0.008 + Math.random() * 0.022,
        a: 0.28 + Math.random() * 0.14,
        r: 5 + Math.floor(Math.random() * 7),
    };

    function render() {
        var W = el.offsetWidth || window.innerWidth;
        cvs.width = W * dpr;
        cvs.height = H * dpr;
        cvs.style.cssText = 'display:block;width:100%;height:' + H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var fns = [guilloche, scallop, diamonds, ogee, chainCircles, crossDots, braid, zigzag, floralScroll];
        fns[chosen](W, H);
    }

    function rail(w, h) {
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0.5);
        ctx.lineTo(w, 0.5);
        ctx.moveTo(0, h - 0.5);
        ctx.lineTo(w, h - 0.5);
        ctx.stroke();
    }

    function dot(x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r === undefined ? 1.2 : r, 0, Math.PI * 2);
        ctx.fill();
    }

    function guilloche(w, h) {
        rail(w, h);
        var cy = h / 2;
        ctx.lineWidth = 0.5;
        for (var i = 0; i < S.n; i++) {
            var t = i / S.n;
            ctx.strokeStyle = 'rgba(80,80,80,' + (0.15 + 0.4 * t) + ')';
            ctx.beginPath();
            for (var x = 0; x <= w; x++) {
                var y = cy + Math.sin(x * S.f * (1 + i * 0.12) + t * Math.PI * 2) * (h / 2 - 3) * (0.4 + 0.6 * t);
                x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.stroke();
        }
    }

    function scallop(w, h) {
        rail(w, h);
        var cy = h / 2;
        var tw = S.tw;
        var r = Math.min(tw * 0.42, h / 2 - 2);
        var ir = r * 0.45;
        ctx.strokeStyle = '#3a3a3a';
        ctx.fillStyle = '#444';
        ctx.lineWidth = 0.8;
        for (var x = -tw; x < w + tw * 2; x += tw) {
            ctx.beginPath();
            ctx.arc(x, cy, r, Math.PI, 0);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + tw / 2, cy, r, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, cy, ir, Math.PI, 0);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + tw / 2, cy, ir, 0, Math.PI);
            ctx.stroke();
            dot(x, cy, 1.5);
        }
    }

    function diamonds(w, h) {
        rail(w, h);
        var cy = h / 2;
        var tw = S.tw;
        var dy = h * S.a;
        var dx = tw * 0.42;
        ctx.strokeStyle = '#383838';
        ctx.fillStyle = '#444';
        ctx.lineWidth = 0.8;
        for (var x = 0; x < w + tw; x += tw) {
            ctx.beginPath();
            ctx.moveTo(x, cy - dy);
            ctx.lineTo(x + dx, cy);
            ctx.lineTo(x, cy + dy);
            ctx.lineTo(x - dx, cy);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, cy - dy * 0.5);
            ctx.lineTo(x + dx * 0.5, cy);
            ctx.lineTo(x, cy + dy * 0.5);
            ctx.lineTo(x - dx * 0.5, cy);
            ctx.closePath();
            ctx.stroke();
            dot(x, cy, 1.8);
            dot(x, cy - dy, 1);
            dot(x, cy + dy, 1);
            ctx.beginPath();
            ctx.moveTo(x + dx, cy);
            ctx.lineTo(x + tw - dx, cy);
            ctx.stroke();
        }
    }

    function ogee(w, h) {
        rail(w, h);
        var cy = h / 2;
        var tw = S.tw;
        var a = h * S.a;
        ctx.strokeStyle = '#383838';
        ctx.fillStyle = '#444';
        ctx.lineWidth = 0.8;
        for (var x = -tw; x < w + tw * 2; x += tw) {
            for (var s = -1; s <= 1; s += 2) {
                for (var sc = 1; sc >= 0.35; sc -= 0.32) {
                    ctx.beginPath();
                    ctx.moveTo(x, cy);
                    ctx.bezierCurveTo(x + tw * 0.25, cy + s * a * sc, x + tw * 0.75, cy + s * a * sc, x + tw, cy);
                    ctx.stroke();
                }
            }
            dot(x, cy, 1.5);
        }
    }

    function chainCircles(w, h) {
        rail(w, h);
        var cy = h / 2;
        var r = Math.min(S.r, h / 2 - 2);
        var sp = r * 1.6;
        ctx.strokeStyle = '#393939';
        ctx.lineWidth = 0.7;
        for (var x = 0; x < w + sp; x += sp) {
            ctx.beginPath();
            ctx.arc(x, cy - r * 0.2, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + sp / 2, cy + r * 0.2, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, cy - r * 0.2, r * 0.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + sp / 2, cy + r * 0.2, r * 0.3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function crossDots(w, h) {
        rail(w, h);
        var cy = h / 2;
        var tw = S.tw;
        var s = Math.min(tw * 0.3, h * 0.35);
        ctx.strokeStyle = '#383838';
        ctx.fillStyle = '#444';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        for (var x = tw / 2; x < w + tw; x += tw) {
            ctx.beginPath();
            ctx.moveTo(x - s, cy - s);
            ctx.lineTo(x + s, cy + s);
            ctx.moveTo(x + s, cy - s);
            ctx.lineTo(x - s, cy + s);
            ctx.stroke();
            dot(x, cy, 2);
            dot(x - s, cy - s, 0.8);
            dot(x + s, cy - s, 0.8);
            dot(x - s, cy + s, 0.8);
            dot(x + s, cy + s, 0.8);
        }
    }

    function braid(w, h) {
        rail(w, h);
        var cy = h / 2;
        var tw = S.tw;
        var a = (h / 2 - 3) * 0.75;
        var ops = [0.5, 0.3, 0.55];
        ctx.lineWidth = 1.5;
        for (var i = 0; i < 3; i++) {
            ctx.strokeStyle = 'rgba(68,68,68,' + ops[i] + ')';
            ctx.beginPath();
            for (var x = 0; x <= w; x++) {
                var y = cy + Math.sin((x / tw) * Math.PI * 2 + (i * Math.PI * 2) / 3) * a;
                x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.stroke();
        }
    }

    function zigzag(w, h) {
        rail(w, h);
        var cy = h / 2;
        var tw = S.tw;
        var a = h * S.a;
        var halfTw = tw / 2;
        ctx.strokeStyle = '#383838';
        ctx.fillStyle = '#444';
        ctx.lineWidth = 0.8;
        for (var layer = 0; layer < 2; layer++) {
            var la = a * (layer === 0 ? 1 : 0.5);
            ctx.beginPath();
            for (var x = 0; x < w + tw; x += halfTw) {
                var peak = Math.floor(x / halfTw) % 2 === 0 ? -1 : 1;
                x === 0 ? ctx.moveTo(x, cy + peak * la) : ctx.lineTo(x, cy + peak * la);
            }
            ctx.stroke();
        }
        for (var x = 0; x < w + tw; x += halfTw) {
            var peak = Math.floor(x / halfTw) % 2 === 0 ? -1 : 1;
            dot(x, cy + peak * a, 1.2);
        }
    }

    function floralScroll(w, h) {
        rail(w, h);
        var cy = h / 2;
        var tw = Math.max(S.tw, 30);
        var a = (h / 2 - 4) * 0.8;
        ctx.strokeStyle = '#3a3a3a';
        ctx.fillStyle = '#444';
        ctx.lineWidth = 0.8;
        for (var x = -tw; x < w + tw * 2; x += tw) {
            ctx.beginPath();
            ctx.moveTo(x, cy);
            ctx.bezierCurveTo(x + tw * 0.2, cy - a, x + tw * 0.4, cy - a, x + tw * 0.5, cy);
            ctx.bezierCurveTo(x + tw * 0.6, cy + a, x + tw * 0.8, cy + a, x + tw, cy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, cy);
            ctx.bezierCurveTo(x + tw * 0.2, cy - a * 0.4, x + tw * 0.4, cy - a * 0.4, x + tw * 0.5, cy);
            ctx.bezierCurveTo(x + tw * 0.6, cy + a * 0.4, x + tw * 0.8, cy + a * 0.4, x + tw, cy);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + tw * 0.3, cy - a * 0.7, 3.5, 0, Math.PI * 2);
            ctx.stroke();
            dot(x + tw * 0.3, cy - a * 0.7, 1.5);
            ctx.beginPath();
            ctx.arc(x + tw * 0.7, cy + a * 0.7, 3.5, 0, Math.PI * 2);
            ctx.stroke();
            dot(x + tw * 0.7, cy + a * 0.7, 1.5);
            dot(x, cy, 1.2);
            dot(x + tw * 0.5, cy, 1.2);
        }
    }

    render();
    var t;
    window.addEventListener('resize', function () {
        clearTimeout(t);
        t = setTimeout(render, 200);
    });
})();
