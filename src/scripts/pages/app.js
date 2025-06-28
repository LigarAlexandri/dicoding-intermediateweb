// src/scripts/pages/app.js
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { logout } from '../data/api';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #navList = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navList = navigationDrawer.querySelector('#nav-list');

    this._setupDrawer();
    this._updateNavigation();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  _updateNavigation() {
    const isLoggedIn = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    this.#navList.innerHTML = `
      <li><a href="#/">Beranda</a></li>
      <li><a href="#/about">About</a></li>
      ${isLoggedIn ? `
        <li><a href="#/add-story">Add Story</a></li>
        <li><a id="logout-link" href="#">Logout (${userName})</a></li>
      ` : `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
      `}
    `;

    if (isLoggedIn) {
      document.querySelector('#logout-link').addEventListener('click', (event) => {
        event.preventDefault();
        logout();
        alert('You have been logged out.');
        this._updateNavigation();
        window.location.hash = '#/';
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    const requiresAuth = ['/add-story'].includes(url) || url.startsWith('/stories/');
    const token = localStorage.getItem('token');

    if (requiresAuth && !token) {
      alert('You need to be logged in to access this page.');
      window.location.hash = '#/login';
      return;
    }

    this.#content.innerHTML = await page.render();
    await page.afterRender();
    this._updateNavigation();
  }
}

export default App;