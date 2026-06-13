const THEME = { current: 'dark' };

function initTheme() {
    const saved = localStorage.getItem('theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    THEME.current = saved ?? preferred;
    document.documentElement.setAttribute('data-theme', THEME.current);
}

function stepField(id, delta) {
    const el = document.getElementById(id);
    if (!el) return;
    const min = el.min !== '' ? parseInt(el.min, 10) : -Infinity;
    const max = el.max !== '' ? parseInt(el.max, 10) : Infinity;
    let value = (parseInt(el.value, 10) || 0) + delta;
    value = Math.max(min, Math.min(max, value));
    el.value = value;
}

function toggleTheme() {
    THEME.current = THEME.current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', THEME.current);
    localStorage.setItem('theme', THEME.current);
}
