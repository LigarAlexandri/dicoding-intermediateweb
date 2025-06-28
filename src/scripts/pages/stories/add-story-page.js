// src/scripts/pages/stories/add-story-page.js
import { addNewStory, addNewStoryGuest } from '../../data/api';
import L from 'leaflet';

class AddStoryPage {
  #map = null;
  #marker = null;

  async render() {
    return `
      <section class="container">
        <h1>Add New Story</h1>
        <form id="add-story-form">
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" name="description" required></textarea>
          </div>
          <div class="form-group">
            <label for="photo">Photo:</label>
            <input type="file" id="photo" name="photo" accept="image/*" required>
          </div>
          <div class="form-group">
            <label for="lat">Latitude (click on map to select or drag marker):</label>
            <input type="number" step="any" id="lat" name="lat" readonly>
          </div>
          <div class="form-group">
            <label for="lon">Longitude (click on map to select or drag marker):</label>
            <input type="number" step="any" id="lon" name="lon" readonly>
          </div>
          <div id="map-add-story" class="map-container"></div>
          <button type="submit" id="add-story-button">Add Story</button>
          <button type="button" id="add-story-guest-button">Add as Guest</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const addStoryForm = document.querySelector('#add-story-form');
    const addStoryGuestButton = document.querySelector('#add-story-guest-button');
    const latInput = document.querySelector('#lat');
    const lonInput = document.querySelector('#lon');

    this.#initializeMap(latInput, lonInput);

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

  async #handleAddStory(asGuest) {
    const description = document.querySelector('#description').value;
    const photo = document.querySelector('#photo').files[0];
    const lat = document.querySelector('#lat').value ? parseFloat(document.querySelector('#lat').value) : undefined;
    const lon = document.querySelector('#lon').value ? parseFloat(document.querySelector('#lon').value) : undefined;

    if (!description || !photo) {
      alert('Please fill in description and upload a photo.');
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
      window.location.hash = '#/';
    } catch (error) {
      alert(`Failed to add story: ${error.message}`);
    }
  }
}

export default AddStoryPage;