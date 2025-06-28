import { login } from '../../data/api';

class LoginPage {
  async render() {
    return `
      <section class="container">
        <h1>Login to your Account</h1>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required aria-label="Email address">
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required aria-label="Password">
          </div>
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="#/register">Register here</a></p>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const loginResult = await login({ email, password });
        alert(`Welcome, ${loginResult.name}!`);
        window.location.hash = '#/';
      } catch (error) {
        alert(`Login failed: ${error.message}`);
      }
    });
  }
}

export default LoginPage;
