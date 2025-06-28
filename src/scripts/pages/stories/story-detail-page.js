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
        <img id="story-photo" src="" alt="Story Photo" style="max-width: 100%; height: auto; margin-top: 20px; border-radius: 8px;">
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

    document.querySelector('#story-title').textContent = this.#story.name;
    document.querySelector('#story-owner').innerHTML = `<i class="fa-solid fa-user fa-fw"></i> Posted by: <strong>${this.#story.name}</strong>`;
    document.querySelector('#story-date').innerHTML = `<i class="fa-solid fa-calendar-alt fa-fw"></i> On: ${showFormattedDate(this.#story.createdAt)}`;
    document.querySelector('#story-photo').src = this.#story.photoUrl;
    document.querySelector('#story-photo').alt = `Photo for story: ${this.#story.description}`;
    document.querySelector('#story-description').textContent = this.#story.description;

    if (this.#story.lat && this.#story.lon) {
      document.querySelector('#story-location').innerHTML = `<i class="fa-solid fa-map-marker-alt fa-fw"></i> Location: Lat ${this.#story.lat}, Lon ${this.#story.lon}`;
      document.querySelector('#map-story-detail').style.display = 'block';
    } else {
      document.querySelector('#story-location').innerHTML = `<i class="fa-solid fa-location-slash fa-fw"></i> Location: Not provided`;
      document.querySelector('#map-story-detail').style.display = 'none';
    }
  }

  #initializeMapForDetail() {
    if (!this.#story || !this.#story.lat || !this.#story.lon) {
      return;
    }

    const { lat, lon } = this.#story;
    const coordinates = L.latLng(lat, lon);

    // 1. Definisikan beberapa tile layer yang berbeda
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    const cartoDBDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    });

    // 2. Buat objek yang berisi base maps
    const baseMaps = {
        "Streets": openStreetMap,
        "Topographic": openTopoMap,
        "Dark Mode": cartoDBDark
    };

    // 3. Inisialisasi peta dengan layer default
    this.#map = L.map('map-story-detail', {
        layers: [openStreetMap] // Atur layer default di sini
    }).setView(coordinates, 13);

    // 4. Tambahkan layer control ke peta
    L.control.layers(baseMaps).addTo(this.#map);

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