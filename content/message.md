+++
title = "message"
description = "anonymously write or draw me a message."

[extra]
no_header = true
noindex = true
exclude_from_sitemap = true
+++

write or draw me a message **anonymously**.


<div class="message-container">
<div class="message-section">
<span class="section-title">Write</span>
<textarea id="message" rows="8" placeholder="Type your anonymous message here..."></textarea>
{{ button(text="Send Message", id="msg-button", onclick="send_message();", align="center") }}
</div>
<div class="message-section">
<span class="section-title">Draw</span>
<div class="drawing-controls">
<input type="color" class="js-color-picker color-picker" value="#000000">
<input type="range" class="js-line-range line-range" min="1" max="50" value="2">
<span><span class="js-range-value">2</span>px</span>
</div>
<canvas class="js-paint paint-canvas"></canvas>
{{ button(text="Send Drawing", id="draw-button", onclick="send_drawing();", align="center") }}
</div>
</div>

<script>
    (function initializeDrawingModule() {
        const paintCanvas = document.querySelector('.js-paint');

        if (!paintCanvas) {
            console.error('[paint-canvas] Canvas element not found; drawing has been disabled.');
            return;
        }

        const context = paintCanvas.getContext('2d');
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        const colorPicker = document.querySelector('.js-color-picker');
        const lineWidthRange = document.querySelector('.js-line-range');
        const lineWidthLabel = document.querySelector('.js-range-value');

        /**
         * Drawing module orchestrates a temporary off-screen canvas and the main canvas to create smooth
         * strokes, while ensuring the rendering space matches the device pixel ratio.
         *
         * Security considerations: logs emit only sizing metadata and configuration changes, never PII.
         */
        if (!context || !tempContext) {
            console.error('[paint-canvas] Failed to obtain a 2D rendering context; drawing has been disabled.');
            return;
        }

        let currentStrokeStyle = colorPicker ? colorPicker.value : '#000000';
        let currentLineWidth = lineWidthRange ? parseInt(lineWidthRange.value, 10) || 1 : 1;

        const logPaintEvent = (message, data = {}) => {
            console.info('[paint-canvas]', message, data);
        };

        const applyStrokeSettings = () => {
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.lineWidth = currentLineWidth;
            context.strokeStyle = currentStrokeStyle;

            tempContext.lineCap = 'round';
            tempContext.lineJoin = 'round';
            tempContext.lineWidth = currentLineWidth;
            tempContext.strokeStyle = currentStrokeStyle;
        };

        const detectMob = () => window.innerWidth <= 800;

        /**
         * Resize both canvases to follow layout changes and honour the device pixel ratio. Resetting the
         * transform on each call prevents cumulative scaling that previously displaced strokes below the
         * user's cursor.
         */
        const resizeCanvas = () => {
            const rect = paintCanvas.getBoundingClientRect();

            if (!rect.width || !rect.height) {
                console.warn('[paint-canvas] Skipping resize due to zero-sized bounding rectangle.', {
                    width: rect.width,
                    height: rect.height
                });
                return;
            }

            const dpr = window.devicePixelRatio || 1;

            paintCanvas.width = rect.width * dpr;
            paintCanvas.height = rect.height * dpr;
            tempCanvas.width = rect.width * dpr;
            tempCanvas.height = rect.height * dpr;

            paintCanvas.style.width = `${rect.width}px`;
            paintCanvas.style.height = `${rect.height}px`;
            tempCanvas.style.width = `${rect.width}px`;
            tempCanvas.style.height = `${rect.height}px`;

            context.setTransform(1, 0, 0, 1, 0, 0);
            tempContext.setTransform(1, 0, 0, 1, 0, 0);

            context.scale(dpr, dpr);
            tempContext.scale(dpr, dpr);

            applyStrokeSettings();

            logPaintEvent('Canvas resized', {
                width: rect.width,
                height: rect.height,
                dpr
            });
        };

        if (detectMob()) {
            paintCanvas.style.height = '320px';
        }

        if (colorPicker) {
            colorPicker.addEventListener('change', event => {
                currentStrokeStyle = event.target.value;
                applyStrokeSettings();
                logPaintEvent('Stroke colour changed', { stroke: currentStrokeStyle });
            });
        }

        if (lineWidthRange && lineWidthLabel) {
            lineWidthLabel.innerHTML = currentLineWidth;
            lineWidthRange.addEventListener('input', event => {
                const width = parseInt(event.target.value, 10) || 1;
                currentLineWidth = width;
                lineWidthLabel.innerHTML = width;
                applyStrokeSettings();
                logPaintEvent('Line width changed', { width: currentLineWidth });
            });
        }

        applyStrokeSettings();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                resizeCanvas();
                setTimeout(resizeCanvas, 100);
            });
        } else {
            resizeCanvas();
            setTimeout(resizeCanvas, 100);
        }

        window.addEventListener('resize', resizeCanvas);

        let isDrawing = false;
        let points = [];
        let savedImageData = null;

        /**
         * Convert a pointer event into canvas-relative coordinates using CSS pixels so the drawing logic can
         * stay agnostic of the backing store resolution.
         */
        const getPointerPosition = (canvas, evt) => {
            const rect = canvas.getBoundingClientRect();
            if ('touches' in evt && evt.touches.length) {
                const touch = evt.touches[0];
                return {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                };
            }

            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        };

        /**
         * Render a smoothed stroke following the historical pointer trail, using quadratic curves for a
         * natural brush appearance.
         */
        const drawSmoothLine = (inputPoints, ctx) => {
            if (inputPoints.length === 0) {
                return;
            }

            ctx.beginPath();
            ctx.moveTo(inputPoints[0].x, inputPoints[0].y);

            for (let i = 1; i < inputPoints.length - 2; i++) {
                const xc = (inputPoints[i].x + inputPoints[i + 1].x) / 2;
                const yc = (inputPoints[i].y + inputPoints[i + 1].y) / 2;
                ctx.quadraticCurveTo(inputPoints[i].x, inputPoints[i].y, xc, yc);
            }

            if (inputPoints.length > 2) {
                const last = inputPoints.length - 1;
                ctx.quadraticCurveTo(inputPoints[last - 1].x, inputPoints[last - 1].y, inputPoints[last].x, inputPoints[last].y);
            }

            ctx.stroke();
        };

        const startDrawing = event => {
            isDrawing = true;
            points = [];
            points.push(getPointerPosition(paintCanvas, event));
            savedImageData = context.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
        };

        const draw = event => {
            if (!isDrawing) {
                return;
            }

            event.preventDefault();
            points.push(getPointerPosition(paintCanvas, event));

            if (savedImageData) {
                context.putImageData(savedImageData, 0, 0);
            }

            drawSmoothLine(points, context);
        };

        const stopDrawing = () => {
            if (!isDrawing) {
                return;
            }

            isDrawing = false;

            if (savedImageData) {
                context.putImageData(savedImageData, 0, 0);
            }

            drawSmoothLine(points, context);
            points = [];
            savedImageData = null;
        };

        paintCanvas.addEventListener('mousedown', startDrawing);
        paintCanvas.addEventListener('mousemove', draw);
        paintCanvas.addEventListener('mouseup', stopDrawing);
        paintCanvas.addEventListener('mouseout', stopDrawing);

        paintCanvas.addEventListener('touchstart', startDrawing);
        paintCanvas.addEventListener('touchmove', draw);
        paintCanvas.addEventListener('touchend', stopDrawing);

        const API_URL = 'https://api.mufeedvh.com';
        const ENDPOINTS = { message: '/message', drawing: '/drawing' };
        const lastSent = { message: null, drawing: null };
        const inFlight = { message: false, drawing: false };

        /**
         * Button state is expressed through classes (styled in styles.css) rather
         * than inline colours, so the page keeps its palette in every state.
         */
        const setButtonState = (button, state, label) => {
            if (!button) return;
            button.classList.remove('is-sending', 'is-success', 'is-error', 'is-warn');
            if (state) button.classList.add(state);
            button.disabled = state === 'is-sending';
            const text = button.querySelector('.btn-text') || button;
            text.textContent = label;
        };

        /**
         * Fetch a one-time token, then post the payload. Failures are reported on
         * the button; nothing about the payload is logged.
         */
        const deliver = async (kind, payload, button) => {
            if (inFlight[kind]) return;

            if (kind === 'message' && !payload.trim()) {
                setButtonState(button, 'is-warn', 'Nothing to send');
                return;
            }

            if (lastSent[kind] !== null && lastSent[kind] === payload) {
                setButtonState(button, 'is-warn', kind === 'message' ? 'Message already sent' : 'Drawing already sent');
                return;
            }

            inFlight[kind] = true;
            setButtonState(button, 'is-sending', 'Sending');

            try {
                const tokenResponse = await fetch(API_URL + '/get_token');
                if (!tokenResponse.ok) throw new Error('token');
                const { token } = await tokenResponse.json();

                const response = await fetch(API_URL + ENDPOINTS[kind], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify({ token, message: payload })
                });
                if (!response.ok) throw new Error('send');

                const data = await response.json();
                lastSent[kind] = payload;
                setButtonState(button, 'is-success', data.message || 'Sent');
            } catch (error) {
                console.warn('[message] delivery failed', { kind, stage: error && error.message });
                setButtonState(button, 'is-error', error && error.message === 'token' ? 'Failed to get token' : 'Failed to send');
            } finally {
                inFlight[kind] = false;
            }
        };

        const send_message = () => deliver('message', document.getElementById('message').value, document.getElementById('msg-button'));
        const send_drawing = () => deliver('drawing', paintCanvas.toDataURL(), document.getElementById('draw-button'));

        window.send_message = send_message;
        window.send_drawing = send_drawing;
    })();
</script>
