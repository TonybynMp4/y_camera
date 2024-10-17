let cameraLoop = false;
let count = 0;
let intervalId = null;

const Photo = {
    close: function (_) {
        if (cameraLoop) return;
        fetch(`https://${GetParentResourceName()}/closePhoto`, {
            method: 'POST'
        });
        this.reset();
    },
    toggle: function (data) {
        if (data.toggle) {
            this.set(data);
            document.onclick = closePhoto;
            document.onkeydown = closePhoto;
            return;
        }
        this.reset();
    },
    reset: function () {
        const image = document.getElementById('image');
        const title = document.getElementById('title');
        const subText = document.getElementById('subText');

        image.src = null;
        title.textContent = null;
        subText.textContent = null;

        const photo = document.getElementById('photo-container');
        photo.style.display = 'none';
    },
    set: function (data) {
        const image = document.getElementById('image');
        const title = document.getElementById('title');
        const subText = document.getElementById('subText');

        image.src = data.source;
        title.textContent = data.title || '';
        subText.textContent = data.subText || '';

        const photo = document.getElementById('photo-container');
        photo.style.display = 'flex';
    }
}

const Camera = {
    updateZoom: function (zoom) {
        const zoomElement = document.getElementById('zoom');
        zoomElement.textContent = `${zoom}X ZOOM`;
    },
    updateTime: function () {
        const timeDisplay = document.getElementById('time');
        count++;

        const hours = Math.floor(count / 3600);
        const minutes = Math.floor((count % 3600) / 60);
        const seconds = count % 60;

        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timeDisplay.textContent = formattedTime;
    },
    toggle: function (toggleScreen) {
        const cameraOverlay = document.getElementById('camera-overlay');
        if (toggleScreen) {
            count = 0;
            cameraOverlay.style.display = 'block';
            intervalId = setInterval(this.updateTime, 1000); // Update time every second
            cameraLoop = true;
            return;
        }
        cameraOverlay.style.display = 'none';
        cameraLoop = false;
        clearInterval(intervalId);
    }
}

const Screen = {
    // action: 'next' | 'previous'
    changePhoto: function (action) {
    },
    // toggle: boolean, photos: Array [{source: string}]
    toggle: function (toggle, photos) {

    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener("message", function (event) {
        switch (event.data.message) {
            case 'camera':
                Camera.toggle(event.data.toggle);
                break;
            case 'updateZoom':
                Camera.updateZoom(event.data.zoom);
                break;
            case 'photo':
                Photo.toggle(event.data);
                break;
            case 'toggleScreen':
                Screen.toggle(event.data.toggle, event.data.photos);
                break;
            case 'changePhoto':
                Screen.changePhoto(event.data.action);
                break;
            default:
                break;
        }

    });
});