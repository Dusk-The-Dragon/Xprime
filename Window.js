// Function to open a new popup window for X'
function openPopup(windowName,width,height) {
    // Open a new window with specified size and features
    let popupWindow = window.open("", windowName, "width="+width+",height="+height);

    // Add content to the new window (HTML, CSS, JS)
    popupWindow.document.write(`
        <html>
            <head>
                <title></title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        margin-top: 50px;
                    }
                    canvas {
                        border: 1px solid black;
                    }
                </style>
            </head>
            <body>
                <h1></h1>
                <canvas id="graphicsCanvas" width=`+ width + ` height=`+ height +`></canvas>
                <script>
                    // Simple drawing function for the popup
                    let canvas = document.getElementById('graphicsCanvas');
                    let ctx = canvas.getContext('2d');

                    // Drawing something for preview
                    ctx.fillRect(0,0,canvas.width,canvas.height)
                </script>
            </body>
        </html>
    `);
}
openPopup(`X'`,400,400)
