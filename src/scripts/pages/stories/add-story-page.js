// src/scripts/pages/stories/add-story-page.js
import { addNewStory, addNewStoryGuest } from '../../data/api';
import L from 'leaflet';

class AddStoryPage {
  #map = null;
  #marker = null;
  #video = null; // Added for camera stream
  #stream = null; // Added for camera stream

  async render() {
    return `
      <section class="container">
        <h1>Add New Story</h1>
        <form id="add-story-form">
          <div class="form-group">
            <label for="description"><i class="fa-solid fa-comment-dots fa-fw"></i> Description:</label>
            <textarea id="description" name="description" required aria-label="Story description"></textarea>
          </div>
          <div class="form-group">
            <label for="photo"><i class="fa-solid fa-image fa-fw"></i> Photo:</label>
            <input type="file" id="photo" name="photo" accept="image/*" required aria-label="Upload photo from device">
            <button type="button" id="open-camera-button" aria-label="Take photo with camera"><i class="fa-solid fa-camera"></i> Take Photo</button>
            <video id="camera-feed" autoplay style="display: none; width: 100%; max-width: 400px; margin-top: 10px;" aria-label="Camera feed"></video>
            <button type="button" id="capture-photo-button" style="display: none; margin-top: 10px;" aria-label="Capture photo from camera"><i class="fa-solid fa-circle-dot"></i> Capture Photo</button>
            <canvas id="camera-canvas" style="display: none;"></canvas>
          </div>
          <div class="form-group">
            <label for="lat"><i class="fa-solid fa-map-pin fa-fw"></i> Latitude:</label>
            <input type="number" step="any" id="lat" name="lat" readonly aria-label="Latitude coordinate">
          </div>
          <div class="form-group">
            <label for="lon"><i class="fa-solid fa-map-pin fa-fw"></i> Longitude:</label>
            <input type="number" step="any" id="lon" name="lon" readonly aria-label="Longitude coordinate">
          </div>
          <div id="map-add-story" class="map-container" role="img" aria-label="Map for selecting location"></div>
          <button type="submit" id="add-story-button"><i class="fa-solid fa-paper-plane"></i> Add Story</button>
          <button type="button" id="add-story-guest-button"><i class="fa-solid fa-user-secret"></i> Add as Guest</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const addStoryForm = document.querySelector('#add-story-form');
    const addStoryGuestButton = document.querySelector('#add-story-guest-button');
    const latInput = document.querySelector('#lat');
    const lonInput = document.querySelector('#lon');
    const openCameraButton = document.querySelector('#open-camera-button');
    const capturePhotoButton = document.querySelector('#capture-photo-button');
    this.#video = document.querySelector('#camera-feed');

    this.#initializeMap(latInput, lonInput);

    openCameraButton.addEventListener('click', async () => {
      await this.#openCamera();
    });

    capturePhotoButton.addEventListener('click', () => {
      this.#capturePhoto();
    });

    addStoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await this.#handleAddStory(false);
    });

    addStoryGuestButton.addEventListener('click', async () => {
      await this.#handleAddStory(true);
    });
  }

  #initializeMap(latInput, lonInput) {
    const defaultLat = -6.2088; // Example: Jakarta latitude
    const defaultLon = 106.8456; // Example: Jakarta longitude

    this.#map = L.map('map-add-story').setView([defaultLat, defaultLon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    this.#map.invalidateSize();

    this.#marker = L.marker([defaultLat, defaultLon], {
      draggable: true,
      alt: 'Location marker' // Added alt text for marker
    }).addTo(this.#map);

    latInput.value = defaultLat.toFixed(6);
    lonInput.value = defaultLon.toFixed(6);
    this.#marker.bindPopup(`Lat: ${defaultLat.toFixed(6)}, Lon: ${defaultLon.toFixed(6)}`).openPopup();

    this.#map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.#marker.setLatLng([lat, lng]);
      latInput.value = lat.toFixed(6);
      lonInput.value = lng.toFixed(6);
      this.#marker.bindPopup(`Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}`).openPopup();
    });

    this.#marker.on('move', (event) => {
      const position = event.target.getLatLng();
      latInput.value = position.lat.toFixed(6);
      lonInput.value = position.lng.toFixed(6);
      this.#marker.bindPopup(`Lat: ${position.lat.toFixed(6)}, Lon: ${position.lng.toFixed(6)}`).openPopup();
    });
  }

  async #openCamera() {
    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.#video.srcObject = this.#stream;
      this.#video.style.display = 'block';
      document.querySelector('#capture-photo-button').style.display = 'inline-block';
      document.querySelector('#photo').style.display = 'none'; // Hide file input when camera is open
      document.querySelector('#open-camera-button').style.display = 'none'; // Hide open camera button
    } catch (error) {
      alert('Could not access camera. Please ensure you have a camera and have granted permission.');
      console.error('Error accessing camera:', error);
    }
  }

  #capturePhoto() {
    const canvas = document.querySelector('#camera-canvas');
    canvas.width = this.#video.videoWidth;
    canvas.height = this.#video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(this.#video, 0, 0, canvas.width, canvas.height);

    // Convert canvas content to a Blob and then to a File
    canvas.toBlob((blob) => {
      const photoFile = new File([blob], `captured-photo-${Date.now()}.png`, { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(photoFile);
      document.querySelector('#photo').files = dataTransfer.files;

      this.#stopCameraStream();
    }, 'image/png');
  }

  #stopCameraStream() {
    if (this.#stream) {
      this.#stream.getTracks().forEach(track => track.stop());
      this.#stream = null;
      this.#video.srcObject = null;
      this.#video.style.display = 'none';
      document.querySelector('#capture-photo-button').style.display = 'none';
      document.querySelector('#photo').style.display = 'block'; // Show file input again
      document.querySelector('#open-camera-button').style.display = 'inline-block'; // Show open camera button again
    }
  }

  async #handleAddStory(asGuest) {
    const description = document.querySelector('#description').value;
    const photoInput = document.querySelector('#photo');
    const photo = photoInput.files[0];
    const lat = document.querySelector('#lat').value ? parseFloat(document.querySelector('#lat').value) : undefined;
    const lon = document.querySelector('#lon').value ? parseFloat(document.querySelector('#lon').value) : undefined;

    if (!description || !photo) {
      alert('Please fill in description and upload or take a photo.');
      return;
    }

    try {
      if (asGuest) {
        await addNewStoryGuest({ description, photo, lat, lon });
        alert('Story added as guest successfully!');
      } else {
        await addNewStory({ description, photo, lat, lon });
        alert('Story added successfully!');
      }
      this.#stopCameraStream(); // Ensure camera stream is stopped after submission
      window.location.hash = '#/';
    } catch (error) {
      alert(`Failed to add story: ${error.message}`);
    }
  }
}

export default AddStoryPage;
