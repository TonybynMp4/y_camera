let cameraLoop = false;
let count = 0;
let intervalId = null;

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener("message", function (event) {
        if (event.data.message == 'camera') {
            cameraOverlay(event.data.toggle);
        } else if (event.data.message == 'photo') {
            togglePhoto(event.data);
        } else if (event.data.message == 'updateZoom') {
            updateZoom(event.data.zoom);
        }
    });
});

function updateZoom(zoom) {
    const zoomElement = document.getElementById('zoom');
    zoomElement.textContent = `${zoom}X ZOOM`;
}

function closePhoto(_) {
    if (cameraLoop) return;
    fetch(`https://${GetParentResourceName()}/closePhoto`, {
        method: 'POST'
    });
    resetPhoto();
}

function togglePhoto(data) {
    if (data.toggle) {
        setPhoto(data);
        document.onclick = closePhoto;
        document.onkeydown = closePhoto;
        return;
    }
    resetPhoto();
}

function resetPhoto() {
    const image = document.getElementById('image');
    const title = document.getElementById('title');
    const subText = document.getElementById('subText');

    image.src = null;
    title.textContent = null;
    subText.textContent = null;

    const photo = document.getElementById('photo-container');
    photo.style.display = 'none';
}

function setPhoto(data) {
    const image = document.getElementById('image');
    const title = document.getElementById('title');
    const subText = document.getElementById('subText');

    image.src = data.source;
    title.textContent = data.title || '';
    subText.textContent = data.subText || '';

    const photo = document.getElementById('photo-container');
    photo.style.display = 'flex';
}

function updateTime() {
    const timeDisplay = document.getElementById('time');
    count++;

    const hours = Math.floor(count / 3600);
    const minutes = Math.floor((count % 3600) / 60);
    const seconds = count % 60;

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timeDisplay.textContent = formattedTime;
}

function cameraOverlay(toggle) {
    const cameraOverlay = document.getElementById('camera-overlay');
    if (toggle) {
        count = 0;
        cameraOverlay.style.display = 'block';
        intervalId = setInterval(updateTime, 1000); // Update time every second
        cameraLoop = true;
        return;
    }
    cameraOverlay.style.display = 'none';
    cameraLoop = false;
    clearInterval(intervalId);
}