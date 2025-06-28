// src/scripts/pages/stories/story-detail-page.js
import { getStoryDetail } from '../../data/api';
import { parseActivePathname } from '../../routes/url-parser';
import { showFormattedDate } from '../../utils';
import L from 'leaflet';

class StoryDetailPage {
  #story = null;
  #map = null;

  async render() {
    return `
      <section class="container">
        <h1 id="story-title"></h1>
        <p class="story-owner" id="story-owner"></p>
        <p class="story-date" id="story-date"></p>
        <img id="story-photo" src="" alt="Story Photo" style="max-width: 100%; height: auto; margin-top: 20px;">
        <p id="story-description" style="margin-top: 20px;"></p>
        <p id="story-location" style="margin-top: 10px; font-style: italic;"></p>
        <div id="map-story-detail" class="map-container" style="display: none;"></div>
      </section>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();

    if (!id) {
      this.#renderError('Story ID not found in URL.');
      return;
    }

    try {
      this.#story = await getStoryDetail(id);
      this.#renderStoryDetail();
      this.#initializeMapForDetail();
    } catch (error) {
      this.#renderError(`Failed to fetch story: ${error.message}`);
    }
  }

  #renderStoryDetail() {
    if (!this.#story) {
      this.#renderError('Story data not available.');
      return;
    }

    document.querySelector('#story-title').textContent = `Story by ${this.#story.name}`;
    document.querySelector('#story-owner').textContent = `Posted by: ${this.#story.name}`;
    document.querySelector('#story-date').textContent = `On: ${showFormattedDate(this.#story.createdAt)}`;
    document.querySelector('#story-photo').src = this.#story.photoUrl;
    document.querySelector('#story-description').textContent = this.#story.description;

    if (this.#story.lat && this.#story.lon) {
      document.querySelector('#story-location').textContent = `Location: Lat ${this.#story.lat}, Lon ${this.#story.lon}`;
      document.querySelector('#map-story-detail').style.display = 'block';
    } else {
      document.querySelector('#story-location').textContent = 'Location: Not provided';
      document.querySelector('#map-story-detail').style.display = 'none';
    }
  }

  #initializeMapForDetail() {
    if (!this.#story || !this.#story.lat || !this.#story.lon) {
      return;
    }

    const { lat, lon } = this.#story;
    const coordinates = L.latLng(lat, lon);

    this.#map = L.map('map-story-detail').setView(coordinates, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    const marker = L.marker(coordinates).addTo(this.#map);
    
    marker.bindPopup(`Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`).openPopup();

    this.#map.invalidateSize();
  }

  #renderError(message) {
    document.querySelector('#main-content').innerHTML = `
      <section class="container">
        <h2>Error Loading Story</h2>
        <p>${message}</p>
        <a href="#/">Go back to Home</a>
      </section>
    `;
  }
}

export default StoryDetailPage;