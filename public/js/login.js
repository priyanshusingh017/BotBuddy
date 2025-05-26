// public/js/login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "chatbot-43b76.firebaseapp.com",
  projectId: "chatbot-43b76",
  storageBucket: "chatbot-43b76.appspot.com",
  messagingSenderId: "482784554176",
  appId: "1:482784554176:web:b2a5d7ed8f802bdfc7d125"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const signUpButton = document.getElementById('signUp');
  const signInButton = document.getElementById('signIn');
  const container = document.getElementById('container');
  const logoutMsg = document.getElementById('logout-message');

  if (signUpButton && container) {
    signUpButton.addEventListener('click', () => {
      container.classList.add('right-panel-active');
      if (logoutMsg) logoutMsg.style.display = 'none';
    });
  }
  if (signInButton && container) {
    signInButton.addEventListener('click', () => {
      container.classList.remove('right-panel-active');
    });
  }

  if (window.location.search.includes('logout=1') && logoutMsg) {
    logoutMsg.style.display = 'block';
    setTimeout(() => logoutMsg.style.display = 'none', 3500);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          window.location.href = 'home.html';
        })
        .catch(error => {
          showFormMessage(loginForm, 'Login failed: ' + error.message, true);
        });
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          showFormMessage(registerForm, 'Registration successful! Please sign in.', false);
          setTimeout(() => {
            container.classList.remove('right-panel-active');
          }, 1200);
        })
        .catch(error => {
          showFormMessage(registerForm, 'Registration failed: ' + error.message, true);
        });
    });
  }

  const googleProvider = new GoogleAuthProvider();
  document.querySelectorAll('.social[aria-label*="Google"]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      try {
        await signInWithPopup(auth, googleProvider);
        window.location.href = 'home.html';
      } catch (error) {
        const form = document.querySelector('.sign-in-container form') || document.querySelector('.sign-up-container form');
        if (form) {
          showFormMessage(form, 'Google login failed: ' + error.message, true);
        } else {
          alert('Google login failed: ' + error.message);
        }
      }
    });
  });

  function showFormMessage(form, message, isError) {
    let msg = form.querySelector('.form-message');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-message';
      msg.style.margin = '10px 0';
      msg.style.textAlign = 'center';
      msg.style.fontSize = '1rem';
      form.insertBefore(msg, form.firstChild.nextSibling);
    }
    msg.textContent = message;
    msg.style.color = isError ? '#e53935' : '#43e97b';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3500);
  }
});
