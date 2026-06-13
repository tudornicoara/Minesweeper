export type ThemeName = 'dark' | 'light';

export const THEME: { current: ThemeName } = { current: 'dark' };

export function initTheme(): void {
  const saved = localStorage.getItem('theme') as ThemeName | null;
  const preferred: ThemeName = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  THEME.current = saved ?? preferred;
  document.documentElement.setAttribute('data-theme', THEME.current);
}

export function stepField(id: string, delta: number): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return;
  const min = el.min !== '' ? parseInt(el.min, 10) : -Infinity;
  const max = el.max !== '' ? parseInt(el.max, 10) : Infinity;
  let value = (parseInt(el.value, 10) || 0) + delta;
  value = Math.max(min, Math.min(max, value));
  el.value = String(value);
}

export function toggleTheme(): void {
  THEME.current = THEME.current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', THEME.current);
  localStorage.setItem('theme', THEME.current);
}

export function openSheet(): void {
  document.body.classList.add('sheet-open');
}

export function closeSheet(): void {
  document.body.classList.remove('sheet-open');
}
