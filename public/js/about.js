const toggleDarkMode = () => {
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  body.classList.toggle('dark-mode');

  // Save preference
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

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.dark-mode-toggle');
  if (!button) return;

  // Set theme on load from localStorage
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    button.textContent = '☀️';
    button.title = 'Switch to light mode';
  } else {
    document.body.classList.remove('dark-mode');
    button.textContent = '🌙';
    button.title = 'Switch to dark mode';
  }

  // Toggle theme on click
  button.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    button.textContent = isDark ? '☀️' : '🌙';
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  });

  const userAvatar = document.getElementById('user-avatar');
  const userMenu = document.getElementById('user-menu');
  const logoutBtn = document.getElementById('logout-btn');

  // Improved: Keyboard accessibility and robust toggle
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

    // Hide menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && e.target !== userAvatar) {
        toggleMenu(false);
      }
    });

    // Prevent menu from closing when clicking inside
    userMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'login.html?logout=1';
    });
  }
});