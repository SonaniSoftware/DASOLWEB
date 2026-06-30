import { Injectable, signal } from '@angular/core';

export interface AppTheme {
  /** Stable id, persisted to localStorage and set as `data-theme`. */
  id: string;
  /** Label shown in the theme picker. */
  name: string;
  /** Color mode — drives Bootstrap's `data-bs-theme` and our dark overrides. */
  mode: 'light' | 'dark';
  /** Accent / primary color (hex). */
  primary: string;
}

const STORAGE_KEY = 'dasol.theme';

/**
 * App-wide theme selection.
 *
 * Applies the chosen theme to <html> via:
 *  - `data-bs-theme`  → Bootstrap 5.3 light/dark color mode
 *  - `data-theme`     → our own per-theme hook
 *  - `--app-primary` / `--bs-primary` CSS vars → accent color
 *
 * The choice is persisted and restored on startup (see AppComponent).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** The selectable theme list shown in the navbar picker. */
  readonly themes: AppTheme[] = [
    { id: 'blue',     name: 'Default Blue', mode: 'light', primary: '#1677ff' },
    { id: 'indigo',   name: 'Indigo',       mode: 'light', primary: '#6610f2' },
    { id: 'violet',   name: 'Violet',       mode: 'light', primary: '#7c3aed' },
    { id: 'emerald',  name: 'Emerald',      mode: 'light', primary: '#16a34a' },
    { id: 'sunset',   name: 'Sunset',       mode: 'light', primary: '#f97316' },
    { id: 'rose',     name: 'Rose',         mode: 'light', primary: '#e11d48' },
    { id: 'dark',     name: 'Dark',         mode: 'dark',  primary: '#1677ff' },
    { id: 'midnight', name: 'Midnight',     mode: 'dark',  primary: '#8b5cf6' },
  ];

  /** Currently active theme (reactive). */
  readonly current = signal<AppTheme>(this.themes[0]);

  /** Restore the saved theme (or default). Call once at app startup. */
  init(): void {
    const savedId = localStorage.getItem(STORAGE_KEY);
    const theme = this.themes.find((t) => t.id === savedId) ?? this.themes[0];
    this.apply(theme);
  }

  /** Select a theme by id and apply + persist it. */
  select(id: string): void {
    const theme = this.themes.find((t) => t.id === id);
    if (theme) this.apply(theme);
  }

  private apply(theme: AppTheme): void {
    const root = document.documentElement;
    root.setAttribute('data-bs-theme', theme.mode);
    root.setAttribute('data-theme', theme.id);

    const rgb = this.hexToRgb(theme.primary);
    root.style.setProperty('--app-primary', theme.primary);
    root.style.setProperty('--app-primary-rgb', rgb);
    root.style.setProperty('--bs-primary', theme.primary);
    root.style.setProperty('--bs-primary-rgb', rgb);

    localStorage.setItem(STORAGE_KEY, theme.id);
    this.current.set(theme);
  }

  /** "#1677ff" → "22, 119, 255" */
  private hexToRgb(hex: string): string {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
}
