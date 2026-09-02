/*
 * Footer garden: an engraved botanical frieze that breathes.
 *
 * A vine is grown procedurally across the band and drawn as fine line-work
 * in the page's ink. Each page load picks a species (laurel, willow, ivy, or
 * fern) and a seed, then two layers of foliage are placed in a small 3D
 * scene: a back layer set deeper, dimmer, and softly out of focus, and a
 * front layer at the picture plane. Every point is pushed through a pinhole
 * camera, so leaves foreshorten as they turn, the band recedes slightly like
 * a ledge seen from above, and the layers drift against each other as the
 * cursor moves. Now and then a moth rests on the vine and slowly opens and
 * closes its wings.
 *
 * Motion is a slow travelling breeze: leaves sway about their stems and
 * flutter about their midribs, stems bob, and tendrils breathe. The loop only
 * runs while the band is on screen and draws a single still frame for
 * visitors who prefer reduced motion.
 *
 * Set `data-species="fern"` on the host element to pin a species, and
 * `data-moth="always"` or `"never"` to decide whether the moth visits.
 */
(function () {
    'use strict';

    var host = document.getElementById('pattern-border');
    if (!host) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var INK = '232, 227, 218';
    var GILT = '184, 159, 104';
    var TAU = Math.PI * 2;
    var FOCAL = 420;
    var TILT = 0.3;                 /* radians; the band leans away at the top */
    var BACK_DEPTH = 90;            /* px behind the picture plane */

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var backCanvas = document.createElement('canvas');
    var backCtx = backCanvas.getContext('2d');
    var g = ctx;                    /* the context currently being drawn to */
    host.appendChild(canvas);

    var seed = (Math.random() * 4294967296) >>> 0;

    /* mulberry32: a tiny seeded generator so a resize regrows the same garden */
    function makeRng(s) {
        return function () {
            s = (s + 0x6D2B79F5) | 0;
            var t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    var SPECIES = {
        laurel: { spacing: 18, pairs: true, angle: 0.95, spread: 0.3, len: [14, 19], width: 0.4, droop: 0.12, berries: 0.24, tendrils: 0.06, veins: 4, wave: 8, moth: 0.55 },
        willow: { spacing: 17, pairs: false, angle: 0.7, spread: 0.2, len: [22, 32], width: 0.17, droop: 0.9, berries: 0, tendrils: 0, veins: 0, bend: 0.16, wave: 6, moth: 0.3 },
        ivy: { spacing: 22, pairs: false, angle: 1.05, spread: 0.4, len: [17, 22], width: 0.5, lobed: true, droop: 0.2, berries: 0.08, tendrils: 0.34, veins: 5, wave: 9, moth: 0.55 },
        fern: { spacing: 27, pairs: false, angle: 0.8, spread: 0.3, len: [30, 42], width: 0.34, frond: true, droop: 0.45, berries: 0, tendrils: 0, veins: 0, wave: 7, moth: 0.4 }
    };
    var SPECIES_NAMES = Object.keys(SPECIES);

    /* ---------------------------------------------------------------- scene */

    var W = 0;
    var H = 0;
    var cx = 0;
    var cy = 0;
    var scene = null;
    var dpr = 1;

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function half(u) {
        return Math.pow(Math.sin(Math.PI * Math.pow(u, 0.88)), 0.8);
    }

    function lanceolate(len, hw, n, bend) {
        var pts = [];
        var b = bend || 0;
        var i;
        for (i = 0; i <= n; i++) {
            var u = i / n;
            pts.push([u * len, half(u) * hw + b * u * u * len]);
        }
        for (i = n - 1; i > 0; i--) {
            var v = i / n;
            pts.push([v * len, -half(v) * hw + b * v * v * len]);
        }
        return pts;
    }

    /* An ivy leaf: a pointed tip lobe, two lateral lobes, two small basal
       lobes, and a heart-shaped notch where the petiole meets the blade. */
    var IVY_LOBES = [[0, 0.62, 0.42], [0.95, 0.4, 0.4], [-0.95, 0.4, 0.4], [2.1, 0.2, 0.36], [-2.1, 0.2, 0.36]];

    function ivyRadius(a) {
        var r = 0.42;
        for (var i = 0; i < IVY_LOBES.length; i++) {
            var d = a - IVY_LOBES[i][0];
            r += IVY_LOBES[i][1] * Math.exp(-(d * d) / (2 * IVY_LOBES[i][2] * IVY_LOBES[i][2]));
        }
        var dn = Math.abs(Math.abs(a) - Math.PI);
        r -= 0.22 * Math.exp(-(dn * dn) / 0.18);
        return r;
    }

    function lobed(len, n) {
        var pts = [];
        var R = len * 0.5;
        var ox = len * 0.5;
        for (var i = 0; i < n; i++) {
            var a = (i / n) * TAU - Math.PI;
            var r = R * ivyRadius(a);
            pts.push([ox + Math.cos(a) * r, Math.sin(a) * r]);
        }
        return pts;
    }

    function makeLeaf(rng, sp, x, y, z, tangent, side, scale) {
        var len = lerp(sp.len[0], sp.len[1], rng()) * scale;
        var theta = lerp(tangent + side * (sp.angle + (rng() - 0.5) * 0.5), Math.PI / 2 + side * sp.spread, sp.droop);
        var leaf = {
            x: x, y: y, z: z,
            theta: theta,
            phi: (rng() - 0.5) * 1.2,
            phase: rng() * TAU,
            rate: 0.8 + rng() * 0.8,
            sway: 0.8 + rng() * 0.8,
            len: len,
            hw: len * sp.width,
            veins: sp.veins,
            bend: sp.bend ? sp.bend * (rng() < 0.5 ? 1 : -1) * (0.6 + rng() * 0.8) : 0,
            lobed: !!sp.lobed
        };
        leaf.outline = sp.lobed ? lobed(len, 40) : lanceolate(len, leaf.hw, 11, leaf.bend);
        return leaf;
    }

    function makeFrond(rng, sp, x, y, z, tangent, side, scale) {
        var len = lerp(sp.len[0], sp.len[1], rng()) * scale;
        var frond = {
            x: x, y: y, z: z,
            theta: lerp(tangent + side * (sp.angle + (rng() - 0.5) * 0.4), Math.PI / 2 + side * sp.spread, sp.droop * 0.5),
            droop: (0.25 + rng() * 0.3) * (side > 0 ? 1 : 0.6),
            phase: rng() * TAU,
            rate: 0.7 + rng() * 0.6,
            sway: 0.9 + rng() * 0.6,
            len: len,
            young: rng() < 0.22,
            leaflets: []
        };
        var count = Math.round(len / 3.1);
        for (var k = 2; k < count; k++) {
            var u = k / count;
            var size = len * 0.25 * Math.sin(Math.PI * (0.12 + 0.88 * u)) * (frond.young ? 1 - u * 0.6 : 1);
            frond.leaflets.push({
                u: u,
                side: k % 2 ? 1 : -1,
                len: size,
                hw: size * sp.width,
                phi: (rng() - 0.5) * 0.9,
                phase: rng() * TAU,
                outline: lanceolate(size, size * sp.width, 6)
            });
        }
        return frond;
    }

    function makeTendril(rng, x, y, z, tangent, side) {
        return {
            x: x, y: y, z: z,
            theta: tangent + side * (1.1 + rng() * 0.5),
            reach: 9 + rng() * 8,
            radius: 4 + rng() * 3.5,
            turns: 1.4 + rng() * 1.1,
            phase: rng() * TAU,
            dir: rng() < 0.5 ? 1 : -1
        };
    }

    function makeBerries(rng, x, y, z, tangent, side) {
        var cluster = { x: x, y: y, z: z, theta: tangent + side * 1.3, stalk: 5 + rng() * 3, items: [] };
        var n = 2 + Math.floor(rng() * 3);
        for (var i = 0; i < n; i++) {
            cluster.items.push({ dx: (rng() - 0.5) * 7, dy: (rng() - 0.5) * 6, r: 1.6 + rng() * 1.2, phase: rng() * TAU });
        }
        return cluster;
    }

    /* One wing, in wing-local units: u runs along the body, v outward. */
    var WING = [[0.08, 0.02], [0.42, 0.22], [0.62, 0.55], [0.6, 0.85], [0.42, 1], [0.12, 0.92], [-0.14, 0.72], [-0.3, 0.42], [-0.22, 0.14]];

    function makeMoth(rng, layer) {
        var x = W * (0.18 + rng() * 0.64);
        return {
            x: x,
            y: stemY(layer, x) - 2,
            z: layer.z - 6,
            heading: (rng() - 0.5) * 0.9,
            span: 18 + rng() * 6,
            phase: rng() * TAU,
            rate: 0.45 + rng() * 0.35
        };
    }

    function buildLayer(rng, sp, depth, alpha, scale, yShift) {
        var layer = {
            z: depth,
            alpha: alpha,
            scale: scale,
            a1: sp.wave * (0.6 + rng() * 0.5) * scale,
            k1: 0.009 + rng() * 0.006,
            p1: rng() * TAU,
            a2: sp.wave * 0.35 * scale,
            k2: 0.021 + rng() * 0.01,
            p2: rng() * TAU,
            az: 5 + rng() * 4,
            k3: 0.013 + rng() * 0.008,
            p3: rng() * TAU,
            base: cy + yShift,
            leaves: [],
            fronds: [],
            tendrils: [],
            berries: [],
            moth: null
        };

        var x = -sp.spacing * rng();
        var side = rng() < 0.5 ? 1 : -1;
        while (x < W + sp.spacing) {
            var y = stemY(layer, x);
            var z = stemZ(layer, x);
            var tangent = Math.atan2(stemY(layer, x + 2) - stemY(layer, x - 2), 4);
            var sides = sp.pairs ? [side, -side] : [side];
            for (var i = 0; i < sides.length; i++) {
                if (sp.frond) {
                    layer.fronds.push(makeFrond(rng, sp, x, y, z, tangent, sides[i], scale));
                } else {
                    layer.leaves.push(makeLeaf(rng, sp, x, y, z, tangent, sides[i], scale));
                }
            }
            var roll = rng();
            if (roll < sp.tendrils) {
                layer.tendrils.push(makeTendril(rng, x + 3, y, z, tangent, -side));
            } else if (roll < sp.tendrils + sp.berries) {
                layer.berries.push(makeBerries(rng, x + 2, y, z, tangent, -side));
            }
            side = -side;
            x += sp.spacing * (0.8 + rng() * 0.5);
        }
        return layer;
    }

    function stemY(layer, x) {
        return layer.base + Math.sin(x * layer.k1 + layer.p1) * layer.a1 + Math.sin(x * layer.k2 + layer.p2) * layer.a2;
    }

    function stemZ(layer, x) {
        return layer.z + Math.sin(x * layer.k3 + layer.p3) * layer.az;
    }

    function build() {
        var rng = makeRng(seed);
        var name = host.getAttribute('data-species');
        if (!SPECIES[name]) name = SPECIES_NAMES[Math.floor(rng() * SPECIES_NAMES.length)];
        var sp = SPECIES[name];
        var back = buildLayer(rng, sp, BACK_DEPTH, 0.5, 0.84, -H * 0.17);
        var front = buildLayer(rng, sp, 0, 1, 1, H * 0.05);
        var wantMoth = host.getAttribute('data-moth');
        if (wantMoth === 'always' || (wantMoth !== 'never' && rng() < sp.moth)) front.moth = makeMoth(rng, front);
        scene = { species: name, layers: [back, front] };
    }

    /* --------------------------------------------------------------- camera */

    var camX = 0;
    var camY = 0;
    var targetX = 0;
    var targetY = 0;
    var tiltSin = Math.sin(TILT);
    var tiltCos = Math.cos(TILT);
    var P = { x: 0, y: 0, s: 1 };

    function project(X, Y, Z) {
        var yr = Y - cy;
        var Zt = Z - yr * tiltSin;
        var Yt = cy + yr * tiltCos;
        var s = FOCAL / (FOCAL + Zt);
        P.x = cx + (X - cx - camX) * s + camX;
        P.y = cy + (Yt - cy - camY) * s + camY;
        P.s = s;
        return P;
    }

    /* ----------------------------------------------------------------- wind */

    function gust(t) {
        return Math.sin(t * 0.31) * 0.6 + Math.sin(t * 0.087 + 2) * 0.4;
    }

    function windAt(x, t) {
        return 0.05 * Math.sin(x * 0.018 - t * 0.9) + 0.03 * Math.sin(x * 0.041 + t * 0.6 + 1.3) + gust(t) * 0.045;
    }

    function bob(x, t) {
        return 1.3 * Math.sin(x * 0.02 - t * 0.9);
    }

    /* ---------------------------------------------------------------- brush */

    function ink(alpha) {
        return 'rgba(' + INK + ', ' + alpha.toFixed(3) + ')';
    }

    function traceLeaf(ox, oy, oz, theta, phi, outline) {
        var ax = Math.cos(theta);
        var ay = Math.sin(theta);
        var cp = Math.cos(phi);
        var nx = -ay * cp;
        var ny = ax * cp;
        var nz = Math.sin(phi);
        g.beginPath();
        for (var i = 0; i < outline.length; i++) {
            var u = outline[i][0];
            var v = outline[i][1];
            var p = project(ox + u * ax + v * nx, oy + u * ay + v * ny, oz + v * nz);
            if (i === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
        }
        g.closePath();
        return { ax: ax, ay: ay, nx: nx, ny: ny, nz: nz };
    }

    function traceLine(ox, oy, oz, f, u0, v0, u1, v1) {
        var a = project(ox + u0 * f.ax + v0 * f.nx, oy + u0 * f.ay + v0 * f.ny, oz + v0 * f.nz);
        var x0 = a.x, y0 = a.y;
        var b = project(ox + u1 * f.ax + v1 * f.nx, oy + u1 * f.ay + v1 * f.ny, oz + v1 * f.nz);
        g.moveTo(x0, y0);
        g.lineTo(b.x, b.y);
    }

    function drawLeaf(leaf, t, layer) {
        var sy = bob(leaf.x, t);
        var theta = leaf.theta + windAt(leaf.x, t) * leaf.sway;
        var phi = leaf.phi + 0.22 * Math.sin(t * 1.4 * leaf.rate + leaf.phase) * (0.6 + 0.4 * Math.abs(gust(t)));
        var f = traceLeaf(leaf.x, leaf.y + sy, leaf.z, theta, phi, leaf.outline);
        var depth = P.s;
        var a = layer.alpha * depth;
        var facing = 0.55 + 0.45 * Math.abs(Math.cos(phi));

        g.fillStyle = ink(0.07 * a * facing);
        g.fill();
        g.lineWidth = 0.8 * depth;
        g.strokeStyle = ink(0.3 * a);
        g.stroke();

        g.beginPath();
        if (leaf.lobed) {
            var R = leaf.len * 0.5;
            var ox = leaf.len * 0.5;
            var notch = ox - R * ivyRadius(Math.PI);
            traceLine(leaf.x, leaf.y + sy, leaf.z, f, 0, 0, notch, 0);
            for (var k = 0; k < IVY_LOBES.length; k++) {
                var ang = IVY_LOBES[k][0];
                var reachR = R * ivyRadius(ang) * 0.78;
                traceLine(leaf.x, leaf.y + sy, leaf.z, f, notch + 1, 0, ox + Math.cos(ang) * reachR, Math.sin(ang) * reachR);
            }
        } else if (leaf.bend) {
            for (var m = 0; m <= 6; m++) {
                var um = (m / 6) * 0.96;
                traceLine(leaf.x, leaf.y + sy, leaf.z, f, um * leaf.len, leaf.bend * um * um * leaf.len, (um + 0.16) * leaf.len, leaf.bend * (um + 0.16) * (um + 0.16) * leaf.len);
            }
        } else {
            traceLine(leaf.x, leaf.y + sy, leaf.z, f, 0, 0, leaf.len * 0.96, 0);
            for (var i = 1; i <= leaf.veins; i++) {
                var u = (i / (leaf.veins + 1)) * 0.78 + 0.08;
                var reach = leaf.hw * half(u + 0.12) * 0.85;
                traceLine(leaf.x, leaf.y + sy, leaf.z, f, u * leaf.len, 0, (u + 0.13) * leaf.len, reach);
                traceLine(leaf.x, leaf.y + sy, leaf.z, f, u * leaf.len, 0, (u + 0.13) * leaf.len, -reach);
            }
        }
        g.lineWidth = 0.55 * depth;
        g.strokeStyle = ink(0.16 * a);
        g.stroke();
    }

    function drawFrond(frond, t, layer) {
        var sy = bob(frond.x, t);
        var theta = frond.theta + windAt(frond.x, t) * frond.sway * 0.7;
        var ax = Math.cos(theta);
        var ay = Math.sin(theta);
        var wobble = 0.12 * Math.sin(t * frond.rate + frond.phase);
        var n = 12;
        var pts = [];
        var i;

        for (i = 0; i <= n; i++) {
            var u = i / n;
            var d = frond.droop * u * u * frond.len + wobble * u * 6;
            pts.push([frond.x + u * frond.len * ax, frond.y + sy + u * frond.len * ay + d, frond.z + Math.sin(u * 3 + frond.phase) * 3]);
        }

        g.beginPath();
        for (i = 0; i < pts.length; i++) {
            var p = project(pts[i][0], pts[i][1], pts[i][2]);
            if (i === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
        }
        if (frond.young) {
            var tip = pts[n];
            var prev = pts[n - 1];
            var ta = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
            var breathe = 1 + 0.08 * Math.sin(t * 0.7 + frond.phase);
            var rr = 5.5 * breathe;
            var ccx = tip[0] + Math.cos(ta) * 3 - Math.cos(ta - Math.PI / 2) * rr;
            var ccy = tip[1] + Math.sin(ta) * 3 - Math.sin(ta - Math.PI / 2) * rr;
            for (var q = 1; q <= 26; q++) {
                var a = (q / 26) * TAU * 1.5;
                var r = rr * Math.exp(-a * 0.32);
                var pp = project(ccx + Math.cos(ta - Math.PI / 2 + a) * r, ccy + Math.sin(ta - Math.PI / 2 + a) * r, tip[2]);
                g.lineTo(pp.x, pp.y);
            }
        }
        var depth = P.s;
        var a2 = layer.alpha * depth;
        g.lineWidth = 0.9 * depth;
        g.strokeStyle = ink(0.3 * a2);
        g.stroke();

        for (i = 0; i < frond.leaflets.length; i++) {
            var lf = frond.leaflets[i];
            var idx = lf.u * n;
            var lo = Math.floor(idx);
            var hi = Math.min(n, lo + 1);
            var fr = idx - lo;
            var bx = lerp(pts[lo][0], pts[hi][0], fr);
            var by = lerp(pts[lo][1], pts[hi][1], fr);
            var bz = lerp(pts[lo][2], pts[hi][2], fr);
            var tang = Math.atan2(pts[hi][1] - pts[lo][1], pts[hi][0] - pts[lo][0]);
            var lt = tang + lf.side * (1.05 + 0.08 * Math.sin(t * 1.3 + lf.phase));
            var lphi = lf.phi + 0.3 * Math.sin(t * 1.6 + lf.phase);
            traceLeaf(bx, by, bz, lt, lphi, lf.outline);
            g.fillStyle = ink(0.06 * a2);
            g.fill();
            g.lineWidth = 0.6 * depth;
            g.strokeStyle = ink(0.24 * a2);
            g.stroke();
        }
    }

    function drawTendril(tendril, t, layer) {
        var sy = bob(tendril.x, t);
        var theta = tendril.theta + windAt(tendril.x, t) * 0.8;
        var breathe = 1 + 0.07 * Math.sin(t * 0.55 + tendril.phase);
        var ax = Math.cos(theta);
        var ay = Math.sin(theta);
        var ex = tendril.x + ax * tendril.reach;
        var ey = tendril.y + sy + ay * tendril.reach;
        var rad = tendril.radius * breathe;
        var ccx = ex - ay * tendril.dir * rad;
        var ccy = ey + ax * tendril.dir * rad;
        var base = theta + (tendril.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
        g.beginPath();
        var p0 = project(tendril.x, tendril.y + sy, tendril.z);
        g.moveTo(p0.x, p0.y);
        var steps = 34;
        for (var i = 1; i <= steps; i++) {
            var u = i / steps;
            var a = u * TAU * tendril.turns;
            var r = rad * Math.exp(-a * 0.16);
            var p = project(ccx + Math.cos(base + Math.PI + tendril.dir * a) * r, ccy + Math.sin(base + Math.PI + tendril.dir * a) * r, tendril.z + Math.sin(a) * 2.5);
            g.lineTo(p.x, p.y);
        }
        g.lineWidth = 0.6 * P.s;
        g.strokeStyle = ink(0.24 * layer.alpha * P.s);
        g.stroke();
    }

    function drawBerries(cluster, t, layer) {
        var sy = bob(cluster.x, t);
        var theta = cluster.theta + windAt(cluster.x, t) * 0.9;
        var ax = Math.cos(theta);
        var ay = Math.sin(theta);
        var ex = cluster.x + ax * cluster.stalk;
        var ey = cluster.y + sy + ay * cluster.stalk;
        g.beginPath();
        var p0 = project(cluster.x, cluster.y + sy, cluster.z);
        g.moveTo(p0.x, p0.y);
        var p1 = project(ex, ey, cluster.z);
        g.lineTo(p1.x, p1.y);
        g.lineWidth = 0.6 * P.s;
        g.strokeStyle = ink(0.22 * layer.alpha * P.s);
        g.stroke();
        for (var i = 0; i < cluster.items.length; i++) {
            var b = cluster.items[i];
            var p = project(ex + b.dx, ey + b.dy + Math.sin(t * 1.1 + b.phase) * 0.4, cluster.z + Math.cos(b.phase) * 3);
            g.beginPath();
            g.arc(p.x, p.y, b.r * p.s, 0, TAU);
            g.fillStyle = 'rgba(' + GILT + ', ' + (0.34 * layer.alpha * p.s).toFixed(3) + ')';
            g.fill();
            g.lineWidth = 0.5 * p.s;
            g.strokeStyle = ink(0.2 * layer.alpha * p.s);
            g.stroke();
        }
    }

    function drawMoth(moth, t, layer) {
        var sy = bob(moth.x, t);
        var ang = -Math.PI / 2 + moth.heading + windAt(moth.x, t) * 0.5;
        var ax = Math.cos(ang);
        var ay = Math.sin(ang);
        var nx = -ay;
        var ny = ax;
        var open = 0.5 + 0.42 * Math.sin(t * moth.rate + moth.phase);
        var tilt = (1 - open) * 1.3;
        var ct = Math.cos(tilt);
        var st = Math.sin(tilt);
        var S = moth.span / 2;
        var ox = moth.x;
        var oy = moth.y + sy;
        var oz = moth.z;
        var side, i;

        for (side = -1; side <= 1; side += 2) {
            g.beginPath();
            for (i = 0; i < WING.length; i++) {
                var u = WING[i][0] * S;
                var v = WING[i][1] * S;
                var p = project(ox + u * ax + v * ct * nx * side, oy + u * ay + v * ct * ny * side, oz - v * st);
                if (i === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
            }
            g.closePath();
            g.fillStyle = ink(0.09 * layer.alpha);
            g.fill();
            g.lineWidth = 0.75 * P.s;
            g.strokeStyle = ink(0.4 * layer.alpha);
            g.stroke();

            g.beginPath();
            for (i = 1; i <= 3; i++) {
                var vv = (0.25 + i * 0.22) * S;
                var q0 = project(ox + 0.02 * S * ax, oy + 0.02 * S * ay, oz);
                var qx = q0.x, qy = q0.y;
                var q1 = project(ox + (0.5 - i * 0.12) * S * ax + vv * ct * nx * side, oy + (0.5 - i * 0.12) * S * ay + vv * ct * ny * side, oz - vv * st);
                g.moveTo(qx, qy);
                g.lineTo(q1.x, q1.y);
            }
            g.lineWidth = 0.5 * P.s;
            g.strokeStyle = ink(0.16 * layer.alpha);
            g.stroke();

            var e = project(ox + 0.3 * S * ax + 0.62 * S * ct * nx * side, oy + 0.3 * S * ay + 0.62 * S * ct * ny * side, oz - 0.62 * S * st);
            g.beginPath();
            g.arc(e.x, e.y, 1.1 * P.s, 0, TAU);
            g.strokeStyle = ink(0.28 * layer.alpha);
            g.stroke();
        }

        var head = project(ox + 0.42 * S * ax, oy + 0.42 * S * ay, oz);
        var hx = head.x, hy = head.y;
        var tail = project(ox - 0.32 * S * ax, oy - 0.32 * S * ay, oz);
        g.beginPath();
        g.moveTo(hx, hy);
        g.lineTo(tail.x, tail.y);
        g.lineWidth = 1.6 * P.s;
        g.strokeStyle = ink(0.3 * layer.alpha);
        g.stroke();

        g.beginPath();
        for (side = -1; side <= 1; side += 2) {
            var a1 = project(ox + 0.75 * S * ax + 0.3 * S * nx * side, oy + 0.75 * S * ay + 0.3 * S * ny * side, oz);
            var a1x = a1.x, a1y = a1.y;
            var c1 = project(ox + 0.62 * S * ax + 0.05 * S * nx * side, oy + 0.62 * S * ay + 0.05 * S * ny * side, oz);
            g.moveTo(hx, hy);
            g.quadraticCurveTo(c1.x, c1.y, a1x, a1y);
        }
        g.lineWidth = 0.5 * P.s;
        g.strokeStyle = ink(0.26 * layer.alpha);
        g.stroke();
    }

    function drawStem(layer, t) {
        var step = 6;
        var i;
        for (var pass = 0; pass < 2; pass++) {
            g.beginPath();
            for (i = -step; i <= W + step; i += step) {
                var p = project(i, stemY(layer, i) + bob(i, t) + pass * 1.4, stemZ(layer, i) + pass * 0.5);
                if (i === -step) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
            }
            g.lineWidth = (pass ? 0.5 : 1.05) * P.s;
            g.strokeStyle = ink((pass ? 0.1 : 0.3) * layer.alpha * P.s);
            g.stroke();
        }
    }

    function drawLayer(layer, t) {
        var i;
        drawStem(layer, t);
        for (i = 0; i < layer.tendrils.length; i++) drawTendril(layer.tendrils[i], t, layer);
        for (i = 0; i < layer.berries.length; i++) drawBerries(layer.berries[i], t, layer);
        for (i = 0; i < layer.fronds.length; i++) drawFrond(layer.fronds[i], t, layer);
        for (i = 0; i < layer.leaves.length; i++) drawLeaf(layer.leaves[i], t, layer);
        if (layer.moth) drawMoth(layer.moth, t, layer);
    }

    function drawLedge() {
        var p0 = project(0, H - 1, -8);
        var x0 = p0.x, y0 = p0.y;
        var p1 = project(W, H - 1, -8);
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(p1.x, p1.y);
        g.lineWidth = 1;
        g.strokeStyle = ink(0.12);
        g.stroke();
    }

    function fadeEnds(context) {
        var grad = context.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.09, 'rgba(0,0,0,1)');
        grad.addColorStop(0.91, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        context.globalCompositeOperation = 'destination-in';
        context.fillStyle = grad;
        context.fillRect(0, 0, W, H);
        context.globalCompositeOperation = 'source-over';
    }

    function prepare(context) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, W, H);
        context.lineJoin = 'round';
        context.lineCap = 'round';
    }

    function render(t) {
        /* Back layer on its own canvas, composited with a touch of blur:
           depth of field is the cheapest honest depth cue there is. */
        g = backCtx;
        prepare(backCtx);
        drawLayer(scene.layers[0], t);

        g = ctx;
        prepare(ctx);
        drawLedge();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.filter = 'blur(0.7px)';
        ctx.drawImage(backCanvas, 0, 0);
        ctx.filter = 'none';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawLayer(scene.layers[1], t);
        fadeEnds(ctx);
    }

    /* ----------------------------------------------------------------- loop */

    var running = false;
    var visible = false;
    var frame = 0;
    var start = performance.now();

    function tick(now) {
        frame = 0;
        var t = (now - start) / 1000;
        var drift = 6 * Math.sin(t * 0.17) + 3 * Math.sin(t * 0.05 + 1);
        camX += (targetX + drift - camX) * 0.04;
        camY += (targetY - camY) * 0.04;
        render(t);
        if (running && visible) frame = window.requestAnimationFrame(tick);
    }

    function play() {
        if (reduceMotion) {
            render(9.7);
            return;
        }
        running = true;
        if (!frame && visible) frame = window.requestAnimationFrame(tick);
    }

    function resize() {
        var width = host.clientWidth || window.innerWidth;
        if (!width) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = width;
        H = width < 480 ? 58 : 74;
        cx = W / 2;
        cy = H * 0.56;
        canvas.width = backCanvas.width = Math.round(W * dpr);
        canvas.height = backCanvas.height = Math.round(H * dpr);
        canvas.style.cssText = 'display:block;width:100%;height:' + H + 'px';
        build();
        render(reduceMotion ? 9.7 : (performance.now() - start) / 1000);
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible) {
                play();
            } else if (frame) {
                window.cancelAnimationFrame(frame);
                frame = 0;
            }
        }, { rootMargin: '80px' }).observe(host);
    } else {
        visible = true;
    }

    if (finePointer && !reduceMotion) {
        window.addEventListener('pointermove', function (event) {
            targetX = ((event.clientX / window.innerWidth) * 2 - 1) * 18;
            targetY = ((event.clientY / window.innerHeight) * 2 - 1) * 5;
        }, { passive: true });
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    resize();
    play();
})();
