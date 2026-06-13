const THEME = { current: 'dark' };

function initTheme() {
    const saved = localStorage.getItem('theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    THEME.current = saved ?? preferred;
    document.documentElement.setAttribute('data-theme', THEME.current);
}

function toggleTheme() {
    THEME.current = THEME.current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', THEME.current);
    localStorage.setItem('theme', THEME.current);
}
