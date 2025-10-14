+++
title = "message"
description = "anonymously write or draw me a message."

[extra]
no_header = true
+++

write or draw me a message **anonymously**.

<style>
    textarea {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        width: 100%;
        padding: 5px;
        font-size: 20px;
        border-radius: 10px;
        border-width: 0px;
    }

    .paint-canvas {
        width: 100%;
        height: 400px;
        background: white;
        border-width: 0px;
        border-radius: 10px;
        display: block;
        margin-top: 10px;
        touch-action: none;
    }
</style>
<div>
    <div class="center-content">
        <p style="font-size: 20px;"><strong>✍️ send a message</strong></p>
        <textarea id="message" rows="10"></textarea>
        {{ button(text="Send Message", id="msg-button", onclick="send_message();") }}
    </div>
    <hr>
    <div class="center-content">    
        <p style="font-size: 20px;"><strong>🖌️ send a drawing</strong></p>
        <input type="color" class="js-color-picker color-picker">
        <input type="range" class="js-line-range" min="1" max="72" value="1">
        &nbsp
        <label class="js-range-value">1</label> px
        <canvas class="js-paint paint-canvas"></canvas>
        {{ button(text="Send Drawing", id="draw-button", onclick="send_drawing();") }}
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
            document.addEventListener('DOMContentLoaded', resizeCanvas);
        } else {
            resizeCanvas();
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

        const send_message = () => {
            const xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    const token = JSON.parse(this.responseText).token;
                    console.log('acquired token: ' + token);

                    const message = document.getElementById('message').value;
                    const innerXhttp = new XMLHttpRequest();
                    const url = API_URL + '/message';

                    innerXhttp.onreadystatechange = function() {
                        if (this.readyState === 4 && this.status === 200) {
                            const button = document.getElementById('msg-button');
                            button.style.backgroundColor = 'lightgreen';
                            button.innerHTML = JSON.parse(innerXhttp.responseText).message;
                        } else if (this.readyState === 4 && this.status !== 200) {
                            const button = document.getElementById('msg-button');
                            button.style.color = 'white';
                            button.style.backgroundColor = 'red';
                            button.innerHTML = 'Failed to send message';
                        }
                    };

                    innerXhttp.open('POST', url);
                    innerXhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                    innerXhttp.send(JSON.stringify({
                        'token': token,
                        'message': message
                    }));
                }
            };

            xhttp.open('GET', API_URL + '/get_token', true);
            xhttp.send();
        };

        const send_drawing = () => {
            const xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    const token = JSON.parse(this.responseText).token;
                    console.log('acquired token: ' + token);

                    const innerXhttp = new XMLHttpRequest();
                    const url = API_URL + '/drawing';

                    innerXhttp.onreadystatechange = function() {
                        if (this.readyState === 4 && this.status === 200) {
                            const button = document.getElementById('draw-button');
                            button.style.backgroundColor = 'lightgreen';
                            button.innerHTML = JSON.parse(innerXhttp.responseText).message;
                        } else if (this.readyState === 4 && this.status !== 200) {
                            const button = document.getElementById('draw-button');
                            button.style.color = 'white';
                            button.style.backgroundColor = 'red';
                            button.innerHTML = 'Failed to send message';
                        }
                    };

                    innerXhttp.open('POST', url);
                    innerXhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                    innerXhttp.send(JSON.stringify({
                        'token': token,
                        'message': paintCanvas.toDataURL()
                    }));
                }
            };

            xhttp.open('GET', API_URL + '/get_token', true);
            xhttp.send();
        };

        window.send_message = send_message;
        window.send_drawing = send_drawing;
    })();
</script>