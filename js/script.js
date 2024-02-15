const CANVAS_SIZE = 350;
const RADIUS = 150;
const INNER_RADIUS = RADIUS * 0.5;
const MATERIAL_ICON_URL = 'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2';

const lamp = document.getElementById('lamp');
const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let lampActivated = false;

function initialize() {
    drawOuterCircle();
    drawInnerCircle('black');
    lamp.appendChild(canvas);

    // Add event listeners for mouse events
    canvas.addEventListener('click', function (event) {
        handleMouseEvent(event, 'click');
    });
    canvas.addEventListener('mousemove', function (event) {
        handleMouseEvent(event, 'move');
    });
    // Add touchmove event listener to support mobile devices
    canvas.addEventListener('touchmove', function (event) {
        const touch = event.touches[0];
        handleTouchEvent(touch);
    }, { passive: true });
}

// Create a new canvas element with given width and height
function createCanvas(width, height) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    return newCanvas;
}

// Draw outer circle with gradient fill
function drawOuterCircle() {
    const gradient = ctx.createConicGradient(0, centerX, centerY);
    gradient.addColorStop(0, '#26ff00');
    gradient.addColorStop(0.333, 'blue');
    gradient.addColorStop(0.666, 'red');
    gradient.addColorStop(1, '#26ff00');

    ctx.beginPath();
    ctx.arc(centerX, centerY, RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

// Draw inner circle with given color
async function drawInnerCircle(color) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, INNER_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    await drawMaterialIcon();
}

// Draw material icon on the inner circle
async function drawMaterialIcon() {
    try {
        // Load material icon font
        const materialFont = new FontFace('material-icons', `url(${MATERIAL_ICON_URL})`);
        await materialFont.load();
        document.fonts.add(materialFont);

        ctx.fillStyle = lampActivated ? 'black' : 'white';
        ctx.font = '50px material-icons';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('power_settings_new', centerX, centerY);
    } catch (error) {
        console.error("Failed to load material font:", error);
    }
}

// Handle mouse events (click and mouse move)
function handleMouseEvent(event, type) {
    const x = event.offsetX;
    const y = event.offsetY;
    const isInsideOuter = isInsideCircle(x, y, RADIUS);
    const isInsideInner = isInsideCircle(x, y, INNER_RADIUS);
    // Check if mouse is inside outer circle and lamp is activated
    const isInsideOuterAndActivated = isInsideOuter && lampActivated;
    if (type === 'move') {
        // Only update cursor style if necessary
        canvas.style.cursor = isInsideOuterAndActivated ? 'pointer' : 'auto';

        if (isInsideOuterAndActivated && event.buttons === 1) {
            const clickedColor = getClickedColor(x, y);
            setLampColor(clickedColor);
            drawInnerCircle(clickedColor);
        }
    } else if (type === 'click') {
        if (isInsideOuterAndActivated && !isInsideInner) {
            const clickedColor = getClickedColor(x, y);
            setLampColor(clickedColor);
            drawInnerCircle(clickedColor);
        } else if (isInsideInner) {
            toggleLamp();
        }
    }
}

// Handle touch events to interact with the lamp on touch devices
function handleTouchEvent(touch) {
    const x = touch.clientX - canvas.getBoundingClientRect().left;
    const y = touch.clientY - canvas.getBoundingClientRect().top;
    const isInsideOuter = isInsideCircle(x, y, RADIUS);

    if (isInsideOuter && lampActivated) {
        const clickedColor = getClickedColor(x, y);
        setLampColor(clickedColor);
        drawInnerCircle(clickedColor);
    }
}

function setLampColor(color) {
    lamp.style.backgroundColor = color;
}

function toggleLamp() {
    lampActivated = !lampActivated;

    // Set default color based on lamp activation state and update lamp color and inner circle
    const defaultColor = lampActivated ? '#26ff00' : 'black';
    setLampColor(defaultColor);
    drawInnerCircle(defaultColor);
}

// Check if the given point (x, y) is inside the circle with the given radius
function isInsideCircle(x, y, radius) {
    const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    return distanceFromCenter <= radius;
}

// Get color of the pixel at the specified coordinates (x, y)
function getClickedColor(x, y) {
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
}

initialize();
