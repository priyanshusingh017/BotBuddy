document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  const userAvatar = document.getElementById('user-avatar');
  const userMenu = document.getElementById('user-menu');
  const logoutBtn = document.getElementById('logout-btn');

  if (!button) return;

  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    button.textContent = '☀️';
    button.title = 'Switch to light mode';
  } else {
    body.classList.remove('dark-mode');
    button.textContent = '🌙';
    button.title = 'Switch to dark mode';
  }

  // Dark mode toggle handler
  button.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    button.textContent = isDark ? '☀️' : '🌙';
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  });

  // User menu toggle function
  function toggleMenu(show) {
    if (!userMenu || !userAvatar) return;
    userMenu.style.display = show ? 'block' : 'none';
    userAvatar.setAttribute('aria-expanded', show ? 'true' : 'false');
  }

  if (userAvatar && userMenu) {
    // Initially hide menu
    toggleMenu(false);

    userAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = userMenu.style.display === 'none' || userMenu.style.display === '';
      toggleMenu(isHidden);
    });

    userAvatar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isHidden = userMenu.style.display === 'none' || userMenu.style.display === '';
        toggleMenu(isHidden);
      }
      if (e.key === 'Escape') {
        toggleMenu(false);
      }
    });

    // Clicking outside closes menu
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && e.target !== userAvatar) {
        toggleMenu(false);
      }
    });

    // Prevent clicks inside menu from closing it
    userMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Logout button handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'login.html?logout=1';
    });
  }
});
