document.addEventListener('DOMContentLoaded', () => {
    let cameraLoop = false;
    let count = 0;
    let intervalId = null;

    function toast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        document.getElementById('screen').appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function validationModal() {
        return new Promise((resolve) => {
            const modal = document.createElement('dialog');
            modal.id = 'validationModal';
            document.getElementById('screen').appendChild(modal);

            const modalContent = `
                <h3 style="text-align: center; margin-inline: 2rem;">
                    Are you sure you want to delete this photo?
                </h3>
                <div style="display: flex; justify-content: center; gap: 3rem; margin-top:2rem;">
                    <button class="button danger" id="confirm">Delete</button>
                    <button class="button" id="cancel">Cancel</button>
                </div>
          `;

            modal.innerHTML = modalContent;
            modal.showModal();

            document.getElementById('confirm').addEventListener('click', () => {
                modal.close();
                modal.remove();
                resolve(true);
            });

            document.getElementById('cancel').addEventListener('click', () => {
                modal.close();
                modal.remove();
                resolve(false);
            });
        });
    }

    const Photo = {
        Image: document.getElementById('image'),
        Title: document.getElementById('title'),
        SubText: document.getElementById('subText'),
        Container: document.getElementById('photo-container'),

        close: function (_) {
            if (cameraLoop) return;
            fetch(`https://${GetParentResourceName()}/closePhoto`, {
                method: 'POST'
            });
            Photo.reset();
        },
        toggle: function (data) {
            if (data.toggle) {
                Photo.set(data);
                document.onclick = Photo.close;
                document.onkeydown = Photo.close;
                return;
            }
            Photo.reset();
        },
        reset: function () {
            Photo.Image.src = null;
            Photo.Title.textContent = null;
            Photo.SubText.textContent = null;

            Photo.Container.style.visibility = 'hidden';
        },
        set: function (data) {
            Photo.Image.src = data.source;
            Photo.Title.textContent = data.title || '';
            Photo.SubText.textContent = data.subText || '';

            Photo.Container.style.visibility = 'visible';
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
                cameraOverlay.style.visibility = 'visible';
                intervalId = setInterval(this.updateTime, 1000); // Update time every second
                cameraLoop = true;
                return;
            }
            cameraOverlay.style.visibility = 'hidden';
            cameraLoop = false;
            clearInterval(intervalId);
        }
    }

    const Screen = {
        Container: document.getElementById('screen-container'),
        Image: document.getElementById('screen-image'),
        Counter: document.getElementById('counter'),
        CurrentImage: 0,
        Images: [],
        CameraSlot: null,

        setImage: function (url) {
            this.Image.src = url || './assets/placeholder.svg';
        },
        changePhoto: function (action, index) {
            if (this.Images.length === 0) {
                this.setImage(null);
                this.Counter.innerHTML = `0 / 0`;
                this.CurrentImage = 0;
                return;
            }

            if (this.Images.length === 1) {
                this.setImage(this.Images[0].url);
                this.Counter.innerHTML = `1 / 1`;
                this.CurrentImage = 0;
                return;
            }

            if (action === 'set') {
                if (index < 0 || index - 1 > this.Images.length) {
                    console.error('Index out of bounds', index);
                    index = 0;
                }

                this.CurrentImage = index;
                this.setImage(this.Images[index].url);
                this.Counter.innerHTML = `${this.CurrentImage + 1} / ${this.Images.length}`;
                return;
            }

            if (action === 'next') {
                this.CurrentImage++;

                if (this.CurrentImage >= this.Images.length) {
                    this.CurrentImage = 0;
                }

                this.setImage(this.Images[this.CurrentImage].url);
                this.Counter.innerHTML = `${this.CurrentImage + 1} / ${this.Images.length}`;

                return;
            }

            if (action === 'previous') {
                this.CurrentImage--;

                if (this.CurrentImage < 0) {
                    this.CurrentImage = this.Images.length - 1;
                }

                this.setImage(this.Images[this.CurrentImage].url);
                this.Counter.innerHTML = `${this.CurrentImage + 1} / ${this.Images.length}`;

                return;
            }

            console.error('Unknown action', action);
        },
        close: function () {
            fetch(`https://${GetParentResourceName()}/closeScreen`, {
                method: 'POST'
            });
            this.Container.style.visibility = 'hidden';
            this.reset();
        },
        reset: function () {
            this.Images = [];
            this.CurrentImage = 0;
            this.CameraSlot = null;
            this.Image.src = './assets/placeholder.svg';
        },
        toggle: function (toggle, photos, cameraSlot) {
            if (toggle) {
                this.Container.style.visibility = 'visible';
                this.Images = photos || [];
                this.CameraSlot = cameraSlot;
                this.changePhoto('set', 0);
                return;
            }
        }
    }

    Screen.Container.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            Screen.changePhoto('previous');
        }

        if (event.key === 'ArrowRight') {
            Screen.changePhoto('next');
        }

        if (event.key === 'Escape') {
            Screen.close();
        }
    });
    document.getElementById('close').addEventListener('click', () => Screen.close());
    document.getElementById('next').addEventListener('click', () => Screen.changePhoto('next'));
    document.getElementById('previous').addEventListener('click', () => Screen.changePhoto('previous'));
    document.getElementById('copyurl').addEventListener('click', () => {
        if (Screen.Images.length === 0 || !Screen.Images[Screen.CurrentImage]?.url) return;

        fetch(`https://${GetParentResourceName()}/copyUrl`, {
            method: 'POST',
            body: JSON.stringify(Screen.Images[Screen.CurrentImage]),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        toast('URL copied to clipboard');
    });
    document.getElementById('printPhoto').addEventListener('click', () => {
        if (Screen.Images.length === 0) return;
        if (Screen.Images[Screen.CurrentImage] === undefined) return;

        fetch(`https://${GetParentResourceName()}/printPhoto`, {
            method: 'POST',
            body: JSON.stringify(Screen.Images[Screen.CurrentImage]),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(({success}) => {
            if (!success) return;
            toast('A copy of the photo was printed!');
        }).catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
    document.getElementById('delete').addEventListener('click', async () => {
        if (Screen.Images.length === 0) return;
        if (!Screen.CameraSlot) return;
        const shouldDelete = await validationModal();
        if (!shouldDelete) return;

        fetch(`https://${GetParentResourceName()}/deletePhoto`, {
            method: 'POST',
            body: JSON.stringify({
                cameraSlot: Screen.CameraSlot,
                photoIndex: Screen.CurrentImage + 1,
                url: Screen.Images[Screen.CurrentImage].url
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(({success}) => {
            if (!success) return;

            Screen.Images = Screen.Images.filter((_, index) => index !== Screen.CurrentImage);
            toast('Photo deleted!');

            Screen.changePhoto('set', Math.max(0, Screen.CurrentImage - 1));
        }).catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });

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
                Screen.toggle(event.data.toggle, event.data.photos, event.data.cameraSlot);
                break;
            default:
                console.error('Unknown message received', event.data);
                break;
        }

    });
});