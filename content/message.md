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
        background: white;
        border-width: 0px;
        border-radius: 10px;
        display: block;
        margin-top: 10px;
        touch-action: none;
    }
</style>
<div>
    <div align="center">
        <p style="font-size: 20px;"><strong>✍️ send a message</strong></p>
        <textarea id="message" rows="10"></textarea>
        <h4 class="post-button" id="msg-button" onclick="send_message();">Send Message</h4>
    </div>
    <hr>
    <div align="center">    
        <p style="font-size: 20px;"><strong>🖌️ send a drawing</strong></p>
        <input type="color" class="js-color-picker color-picker">
        <input type="range" class="js-line-range" min="1" max="72" value="1">
        &nbsp
        <label class="js-range-value">1</label> px
        <canvas class="js-paint paint-canvas"></canvas>
        <h4 class="post-button" id="draw-button" onclick="send_drawing();">Send Drawing</h4>
    </div>
</div>

<script>
    const paintCanvas = document.querySelector('.js-paint');
    const context = paintCanvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    tempContext.lineCap = 'round';
    tempContext.lineJoin = 'round';

    const colorPicker = document.querySelector('.js-color-picker');

    function detectMob() {
        return window.innerWidth <= 800;
    }

    function resizeCanvas() {
        const rect = paintCanvas.getBoundingClientRect();
        paintCanvas.width = rect.width;
        paintCanvas.height = rect.height;
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;
    }

    if (detectMob()) {
        paintCanvas.setAttribute('width', '320');
        paintCanvas.setAttribute('height', '320');
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    colorPicker.addEventListener('change', event => {
        context.strokeStyle = event.target.value;
        tempContext.strokeStyle = event.target.value;
    });

    const lineWidthRange = document.querySelector('.js-line-range');
    const lineWidthLabel = document.querySelector('.js-range-value');

    lineWidthRange.addEventListener('input', event => {
        const width = event.target.value;
        lineWidthLabel.innerHTML = width;
        context.lineWidth = width;
        tempContext.lineWidth = width;
    });

    let isDrawing = false;
    let lastPoint;
    let points = [];

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function getTouchPos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.touches[0].clientX - rect.left,
            y: evt.touches[0].clientY - rect.top
        };
    }

    function drawSmoothLine(points, ctx) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        if (points.length > 2) {
            const last = points.length - 1;
            ctx.quadraticCurveTo(points[last - 1].x, points[last - 1].y, points[last].x, points[last].y);
        }

        ctx.stroke();
    }

    function startDrawing(e) {
        isDrawing = true;
        points = [];
        const pos = e.type.startsWith('mouse') ? getMousePos(paintCanvas, e) : getTouchPos(paintCanvas, e);
        points.push(pos);
        lastPoint = pos;
    }

    function draw(e) {
        if (!isDrawing) return;

        e.preventDefault();
        const pos = e.type.startsWith('mouse') ? getMousePos(paintCanvas, e) : getTouchPos(paintCanvas, e);
        
        points.push(pos);
        
        // Clear the temporary canvas
        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the new stroke on the temporary canvas
        drawSmoothLine(points, tempContext);
        
        // Copy the temporary canvas to the main canvas
        context.drawImage(tempCanvas, 0, 0);
        
        lastPoint = pos;
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        
        // Draw the final stroke directly on the main canvas
        drawSmoothLine(points, context);
        
        points = [];
    }

    paintCanvas.addEventListener('mousedown', startDrawing);
    paintCanvas.addEventListener('mousemove', draw);
    paintCanvas.addEventListener('mouseup', stopDrawing);
    paintCanvas.addEventListener('mouseout', stopDrawing);

    paintCanvas.addEventListener('touchstart', startDrawing);
    paintCanvas.addEventListener('touchmove', draw);
    paintCanvas.addEventListener('touchend', stopDrawing);

    const API_URL = 'https://api.mufeedvh.com';

    function send_message() {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var token = JSON.parse(this.responseText).token;
                console.log("acquired token: " + token);

                var message = document.getElementById('message').value;
                var xhttp = new XMLHttpRequest();
                var url = API_URL + '/message';

                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        let button = document.getElementById('msg-button');
                        button.style.backgroundColor = 'lightgreen';
                        button.innerHTML = JSON.parse(xhttp.responseText).message;
                    } else if (this.readyState == 4 && this.status != 200) {
                        let button = document.getElementById('msg-button');
                        button.style.color = 'white';
                        button.style.backgroundColor = 'red';
                        button.innerHTML = "Failed to send message";
                    }
                };

                xhttp.open("POST", url);
                xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                xhttp.send(JSON.stringify({
                    "token": token,
                    "message": message
                }));
            }
        };

        xhttp.open("GET", API_URL + '/get_token', true);
        xhttp.send();
    }

    function send_drawing() {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var token = JSON.parse(this.responseText).token;
                console.log("acquired token: " + token);

                var message = document.getElementById('message').value;
                var xhttp = new XMLHttpRequest();
                var url = API_URL + '/drawing';

                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        let button = document.getElementById('draw-button');
                        button.style.backgroundColor = 'lightgreen';
                        button.innerHTML = JSON.parse(xhttp.responseText).message;
                    } else if (this.readyState == 4 && this.status != 200) {
                        let button = document.getElementById('draw-button');
                        button.style.color = 'white';
                        button.style.backgroundColor = 'red';
                        button.innerHTML = "Failed to send message";
                    }
                };

                xhttp.open("POST", url);
                xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                xhttp.send(JSON.stringify({
                    "token": token,
                    "message": paintCanvas.toDataURL()
                }));
            }
        };

        xhttp.open("GET", API_URL + '/get_token', true);
        xhttp.send();
    }    
</script>