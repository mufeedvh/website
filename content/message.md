+++
title = "message"
description = "anonymously write or draw me a message."

[extra]
no_header = true
+++

anonymously write or draw me a message.

<style>
    textarea {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        width: 90%;
        padding: 5px;
        font-size: 20px;
        border-radius: 10px;
        border-width: 0px;
    }

    button {
        width: 90%;
        font-weight: bold;
        transition: all 0.2s;
        -moz-transition: all 0.2s;
        -webkit-transition: all 0.2s;
    }

    button:hover {
        cursor: pointer;
        color: white;
        background-color: #171717;
    }

    .paint-canvas {
        background: white;
        border-width: 0px;
        border-radius: 10px;
        display: block;
    }
  
    .color-picker {
        margin: 1rem 1rem 0 1rem;
    }    
</style>
<div>
    <div align="center">
        <p style="font-size: 20px;"><strong>✍️ send a message</strong></p>
        <br>    
        <textarea id="message" rows="10" style="margin-top: 5px;"></textarea>
        <br>
        <button id="msg-button" onclick="send_message();">Send Message</button>
    </div>
    <div align="center">
        <br><hr><br>
    </div>
    <div align="center">    
        <p style="font-size: 20px;"><strong>🖌️ send a drawing</strong></p>
        <br>
        <input type="color" class="js-color-picker color-picker">
        <input type="range" class="js-line-range" min="1" max="72" value="1">
        <label class="js-range-value">1</label> px
        <canvas class="js-paint paint-canvas" width="690" height="400" style="margin-top: 10px;"></canvas>
        <button id="draw-button" onclick="send_drawing();" style="margin-top: 10px;">Send Drawing</button>
    </div>
</div>

<script>
    const paintCanvas = document.querySelector( '.js-paint' );
    const context = paintCanvas.getContext( '2d' );
    context.lineCap = 'round';

    const colorPicker = document.querySelector( '.js-color-picker' );

    function detectMob() {
        console.log(window.innerWidth);
        console.log(window.innerHeight);
        return window.innerWidth <= 800;
    }

    if (detectMob()) {
        console.log('phone');
        paintCanvas.setAttribute('width', '320');
        paintCanvas.setAttribute('height', '320');
    }

    colorPicker.addEventListener( 'change', event => {
        context.strokeStyle = event.target.value; 
    } );

    const lineWidthRange = document.querySelector( '.js-line-range' );
    const lineWidthLabel = document.querySelector( '.js-range-value' );

    lineWidthRange.addEventListener( 'input', event => {
        const width = event.target.value;
        lineWidthLabel.innerHTML = width;
        context.lineWidth = width;
    } );

    let x = 0, y = 0;
    let isMouseDown = false;

    const stopDrawing = () => { isMouseDown = false; }
    const startDrawing = event => {
        isMouseDown = true;   
    [x, y] = [event.offsetX, event.offsetY];  
    }

    const drawLine = event => {
        if ( isMouseDown ) {
            const newX = event.offsetX;
            const newY = event.offsetY;
            context.beginPath();
            context.moveTo( x, y );
            context.lineTo( newX, newY );
            context.stroke();
            
            x = newX;
            y = newY;
        }
    }

    paintCanvas.addEventListener( 'mousedown', startDrawing );
    paintCanvas.addEventListener( 'mousemove', drawLine );
    paintCanvas.addEventListener( 'mouseup', stopDrawing );
    paintCanvas.addEventListener( 'mouseout', stopDrawing );

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
                    } else if (this.readyState == 4 && !this.status != 200) {
                        let button = document.getElementById('msg-button');
                        button.style.color = 'white';
                        button.style.backgroundColor = 'red';
                        button.innerHTML = "Failed to sent message";
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
                    } else if (this.readyState == 4 && !this.status != 200) {
                        let button = document.getElementById('draw-button');
                        button.style.color = 'white';
                        button.style.backgroundColor = 'red';
                        button.innerHTML = "Failed to sent message";
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