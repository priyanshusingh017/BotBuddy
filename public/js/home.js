const toggleDarkMode = () => {
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  if (!button) return;

  const isDark = body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  button.textContent = isDark ? '☀️' : '🌙';
  button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
};

const toggleMenuVisibility = (menu, avatar, show) => {
  if (menu && avatar) {
    menu.style.display = show ? 'block' : 'none';
    avatar.setAttribute('aria-expanded', show ? 'true' : 'false');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  const theme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const isDark = theme === 'dark';
  body.classList.toggle('dark-mode', isDark);

  if (button) {
    button.textContent = isDark ? '☀️' : '🌙';
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    button.disabled = false;
    button.addEventListener('click', toggleDarkMode);
  }

  const userAvatar = document.getElementById('user-avatar');
  const userMenu = document.getElementById('user-menu');
  const logoutBtn = document.getElementById('logout-btn');

  if (userAvatar && userMenu) {
    userAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenuVisibility(userMenu, userAvatar, userMenu.style.display === 'none' || userMenu.style.display === '');
    });

    userAvatar.addEventListener('keydown', (e) => {
      if (['Enter', ' '].includes(e.key)) {
        e.preventDefault();
        toggleMenuVisibility(userMenu, userAvatar, userMenu.style.display === 'none' || userMenu.style.display === '');
      }
      if (e.key === 'Escape') toggleMenuVisibility(userMenu, userAvatar, false);
    });

    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && e.target !== userAvatar) {
        toggleMenuVisibility(userMenu, userAvatar, false);
      }
    });

    userMenu.addEventListener('click', (e) => e.stopPropagation());
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'login.html?logout=1';
    });
  }
});
