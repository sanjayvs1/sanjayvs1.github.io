/* Apply the saved or system theme before styles paint. No dependencies. */
(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const key = 'sanjay-theme';
  let preference = null;
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch (_) { /* Private or restricted storage: the control still works. */ }

  function apply(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    const chrome = document.querySelector('meta[name="theme-color"]');
    if (chrome) chrome.content = dark ? '#1c201f' : '#f8f9f5';
  }

  apply(preference || (system.matches ? 'dark' : 'light'));
  system.addEventListener('change', (event) => {
    if (!preference) apply(event.matches ? 'dark' : 'light');
  });
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    button.hidden = false;
    apply(root.dataset.theme);
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem(key, preference); } catch (_) {}
      apply(preference);
    });
  });
})();
