import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDe18gD6SF4iZSgGmKxNZNdNBZhlkrTfUg",
  authDomain: "chatbot-43b76.firebaseapp.com",
  projectId: "chatbot-43b76",
  storageBucket: "chatbot-43b76.appspot.com",
  messagingSenderId: "482784554176",
  appId: "1:482784554176:web:b2a5d7ed8f802bdfc7d125"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const toggleDarkMode = () => {
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  body.classList.toggle('dark-mode');
  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    button.textContent = '☀️';
    button.title = 'Switch to light mode';
  } else {
    localStorage.setItem('theme', 'light');
    button.textContent = '🌙';
    button.title = 'Switch to dark mode';
  }
};

window.addEventListener('DOMContentLoaded', () => {
  // Theme setup
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    button.textContent = '☀️';
    button.title = 'Switch to light mode';
  } else {
    body.classList.remove('dark-mode');
    button.textContent = '🌙';
    button.title = 'Switch to dark mode';
  }
  button.addEventListener('click', toggleDarkMode);

  // User menu logic
  const userAvatar = document.getElementById('user-avatar');
  const userMenu = document.getElementById('user-menu');
  const logoutBtn = document.getElementById('logout-btn');

  if (userAvatar && userMenu) {
    function toggleMenu(show) {
      userMenu.style.display = show ? 'block' : 'none';
      userAvatar.setAttribute('aria-expanded', show ? 'true' : 'false');
    }

    userAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(userMenu.style.display === 'none' || userMenu.style.display === '');
    });

    userAvatar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu(userMenu.style.display === 'none' || userMenu.style.display === '');
      }
      if (e.key === 'Escape') {
        toggleMenu(false);
      }
    });

    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && e.target !== userAvatar) {
        toggleMenu(false);
      }
    });

    userMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'login.html?logout=1';
    });
  }

  // Contact form logic: Store data in Firestore
  const form = document.querySelector('.contact-form');
  const successMsg = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      // Basic validation
      if (!name || !email || !message) {
        if (successMsg) {
          successMsg.textContent = "Please fill in all fields.";
          successMsg.style.color = "#e53935";
          successMsg.style.display = 'block';
          setTimeout(() => {
            successMsg.style.display = 'none';
            successMsg.style.color = "#43e97b";
          }, 3000);
        }
        return;
      }

      try {
        await addDoc(collection(db, "contacts"), {
          name,
          email,
          message,
          timestamp: serverTimestamp()
        });
        form.reset();
        if (successMsg) {
          successMsg.textContent = "Your message has been successfully stored!";
          successMsg.style.color = "#43e97b";
          successMsg.style.display = 'block';
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 3500);
        }
      } catch (error) {
        if (successMsg) {
          successMsg.textContent = "Failed to store message: " + error.message;
          successMsg.style.color = "#e53935";
          successMsg.style.display = 'block';
          setTimeout(() => {
            successMsg.style.display = 'none';
            successMsg.style.color = "#43e97b";
          }, 4000);
        } else {
          alert('Failed to store message: ' + error.message);
        }
      }
    });
  }
});