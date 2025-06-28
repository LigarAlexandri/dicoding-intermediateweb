import { register } from '../../data/api';

class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h1>Register Account</h1>
        <form id="register-form">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required aria-label="Your name">
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required aria-label="Your email address">
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required minlength="8" aria-label="Choose a password">
          </div>
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a href="#/login">Login here</a></p>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.querySelector('#register-form');
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        await register({ name, email, password });
        alert('Registration successful! Please login.');
        window.location.hash = '#/login';
      } catch (error) {
        alert(`Registration failed: ${error.message}`);
      }
    });
  }
}

export default RegisterPage;
