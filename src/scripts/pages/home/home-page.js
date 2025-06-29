// src/scripts/pages/home/home-page.js
import * as api from '../../data/api'; // Import all functions from api.js
import { showFormattedDate } from '../../utils';
import HomePresenter from './home-presenter';

class HomePage {
  #presenter;

  async render() {
    return `
      <section class="container">
        <h1>All Stories</h1>
        <div id="stories-list" class="stories-grid">
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: api, // Pass the entire api module as the model
    });
  }

  showStories(stories) {
    const storiesListElement = document.querySelector('#stories-list');
    
    if (stories.length === 0) {
      storiesListElement.innerHTML = '<p>No stories available.</p>';
      return;
    }

    storiesListElement.innerHTML = stories.map(story => `
      <article class="story-item">
        <img class="story-photo" src="${story.photoUrl}" alt="Photo by ${story.name}: ${story.description}">
        <div class="story-info">
          <h2 class="story-name">${story.name}</h2>
          <p class="story-meta">
            <i class="fa-solid fa-calendar-alt fa-fw"></i> ${showFormattedDate(story.createdAt)}
          </p>
          <p class="story-description">${story.description.substring(0, 150)}...</p>
          <a href="#/stories/${story.id}" class="story-detail-link">
            Read More <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `).join('');
  }

  showError(message) {
    const storiesListElement = document.querySelector('#stories-list');
    storiesListElement.innerHTML = `<p>Failed to load stories: ${message}. Please <a href="#/login">login</a>.</p>`;
  }
}

export default HomePage;