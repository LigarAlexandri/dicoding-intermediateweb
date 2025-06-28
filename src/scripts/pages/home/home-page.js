// src/scripts/pages/home/home-page.js
import { getAllStories } from '../../data/api';
import { showFormattedDate } from '../../utils';

class HomePage {
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
    const storiesListElement = document.querySelector('#stories-list');
    try {
      const stories = await getAllStories({});
      
      if (stories.length === 0) {
        storiesListElement.innerHTML = '<p>No stories available.</p>';
        return;
      }

      storiesListElement.innerHTML = stories.map(story => `
        <article class="story-item">
          <!-- Ensure alt attribute is descriptive -->
          <img class="story-photo" src="${story.photoUrl}" alt="Photo by ${story.name}: ${story.description}">
          <div class="story-info">
            <h2 class="story-name">${story.name}</h2>
            <p class="story-date">${showFormattedDate(story.createdAt)}</p>
            <p class="story-description">${story.description.substring(0, 100)}...</p>
            <a href="#/stories/${story.id}" class="story-detail-link">Read More</a>
          </div>
        </article>
      `).join('');

    } catch (error) {
      storiesListElement.innerHTML = `<p>Failed to load stories: ${error.message}. Please <a href="#/login">login</a>.</p>`;
    }
  }
}

export default HomePage;
