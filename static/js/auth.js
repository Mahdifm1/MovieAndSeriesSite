/**
 * Authentication helper functions
 */

/**
 * Validate login form
 * @param {HTMLFormElement} form - Login form element
 * @returns {boolean} - Whether form is valid
 */
function validateLoginForm(form) {
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const errorElement = form.querySelector('.error-message');
  
  if (!email) {
    errorElement.textContent = 'Please enter your email address.';
    return false;
  }
  
  if (!isValidEmail(email)) {
    errorElement.textContent = 'Please enter a valid email address.';
    return false;
  }
  
  if (!password) {
    errorElement.textContent = 'Please enter your password.';
    return false;
  }
  
  errorElement.textContent = '';
  return true;
}

/**
 * Validate registration form
 * @param {HTMLFormElement} form - Registration form element
 * @returns {boolean} - Whether form is valid
 */
function validateRegisterForm(form) {
  const username = form.querySelector('input[name="username"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const confirmPassword = form.querySelector('input[name="confirm_password"]').value;
  const errorElement = form.querySelector('.error-message');
  
  if (!username) {
    errorElement.textContent = 'Please enter a username.';
    return false;
  }
  
  if (username.length < 3) {
    errorElement.textContent = 'Username must be at least 3 characters long.';
    return false;
  }
  
  if (!email) {
    errorElement.textContent = 'Please enter your email address.';
    return false;
  }
  
  if (!isValidEmail(email)) {
    errorElement.textContent = 'Please enter a valid email address.';
    return false;
  }
  
  if (!password) {
    errorElement.textContent = 'Please enter a password.';
    return false;
  }
  
  if (password.length < 8) {
    errorElement.textContent = 'Password must be at least 8 characters long.';
    return false;
  }
  
  if (password !== confirmPassword) {
    errorElement.textContent = 'Passwords do not match.';
    return false;
  }
  
  errorElement.textContent = '';
  return true;
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Set up form validation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Login form validation
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      if (!validateLoginForm(loginForm)) {
        e.preventDefault();
      }
    });
  }
  
  // Registration form validation
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      if (!validateRegisterForm(registerForm)) {
        e.preventDefault();
      }
    });
  }
  
  // Password visibility toggle
  const passwordToggles = document.querySelectorAll('.password-toggle');
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      
      if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      } else {
        input.type = 'password';
        toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    });
  });
});
