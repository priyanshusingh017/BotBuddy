const toggleDarkMode = () => {
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  if (!button) return;

  const isDark = body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  button.textContent = isDark ? '☀️' : '🌙';
  button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
};

window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  const theme = localStorage.getItem('theme');
  const isDark = theme === 'dark';
  body.classList.toggle('dark-mode', isDark);
  if (button) {
    button.textContent = isDark ? '☀️' : '🌙';
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    button.disabled = false;
    button.addEventListener('click', toggleDarkMode);
  }

  // User menu logic
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

  // Logout logic
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'login.html?logout=1';
    });
  }
});