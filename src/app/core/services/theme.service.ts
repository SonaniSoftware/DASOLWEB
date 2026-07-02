import { Injectable, signal } from '@angular/core';

export interface AppTheme {
  /** Stable id, persisted to localStorage and set as `data-theme`. */
  id: string;
  /** Label shown in the theme picker. */
  name: string;
  /** Color mode — drives Bootstrap's `data-bs-theme` and our dark overrides. */
  mode: 'light' | 'dark';
  /**
   * Bootswatch theme folder under `/bootswatch/<folder>/bootstrap.min.css`.
   * Omitted for the built-in "Default" theme (uses the bundled Bootstrap).
   */
  bootswatch?: string;
  /** Approximate accent color — only used for the swatch dot in the picker. */
  swatch: string;
}

const STORAGE_KEY = 'dasol.theme';
const LINK_ID = 'bootswatch-theme';

/**
 * App-wide theme selection, powered by Bootswatch (25 themes) + a Default.
 *
 * Switching a theme:
 *  - swaps the `<link id="bootswatch-theme">` in <head> to the chosen
 *    Bootswatch CSS (or removes it for Default),
 *  - sets `data-bs-theme` (light/dark) + `data-theme` (id) on <html>,
 *  - mirrors the loaded theme's `--bs-primary` into `--app-primary` so the
 *    custom shell (sidebar, tabs, buttons) picks up the theme accent.
 *
 * The choice is persisted and restored on startup (see AppComponent).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** The selectable theme list shown in the navbar picker. */
  readonly themes: AppTheme[] = [
    { id: 'default',   name: 'Default',   mode: 'light', swatch: '#0e7490' },
    { id: 'cerulean',  name: 'Cerulean',  mode: 'light', bootswatch: 'cerulean',  swatch: '#2fa4e7' },
    { id: 'cosmo',     name: 'Cosmo',     mode: 'light', bootswatch: 'cosmo',     swatch: '#2780e3' },
    { id: 'cyborg',    name: 'Cyborg',    mode: 'dark',  bootswatch: 'cyborg',    swatch: '#2a9fd6' },
    { id: 'darkly',    name: 'Darkly',    mode: 'dark',  bootswatch: 'darkly',    swatch: '#375a7f' },
    { id: 'flatly',    name: 'Flatly',    mode: 'light', bootswatch: 'flatly',    swatch: '#2c3e50' },
    { id: 'journal',   name: 'Journal',   mode: 'light', bootswatch: 'journal',   swatch: '#eb6864' },
    { id: 'litera',    name: 'Litera',    mode: 'light', bootswatch: 'litera',    swatch: '#4582ec' },
    { id: 'lumen',     name: 'Lumen',     mode: 'light', bootswatch: 'lumen',     swatch: '#158cba' },
    { id: 'lux',       name: 'Lux',       mode: 'light', bootswatch: 'lux',       swatch: '#1a1a1a' },
    { id: 'materia',   name: 'Materia',   mode: 'light', bootswatch: 'materia',   swatch: '#2196f3' },
    { id: 'minty',     name: 'Minty',     mode: 'light', bootswatch: 'minty',     swatch: '#78c2ad' },
    { id: 'morph',     name: 'Morph',     mode: 'light', bootswatch: 'morph',     swatch: '#378dfc' },
    { id: 'pulse',     name: 'Pulse',     mode: 'light', bootswatch: 'pulse',     swatch: '#593196' },
    { id: 'quartz',    name: 'Quartz',    mode: 'dark',  bootswatch: 'quartz',    swatch: '#e83283' },
    { id: 'sandstone', name: 'Sandstone', mode: 'light', bootswatch: 'sandstone', swatch: '#325d88' },
    { id: 'simplex',   name: 'Simplex',   mode: 'light', bootswatch: 'simplex',   swatch: '#d9230f' },
    { id: 'sketchy',   name: 'Sketchy',   mode: 'light', bootswatch: 'sketchy',   swatch: '#333333' },
    { id: 'slate',     name: 'Slate',     mode: 'dark',  bootswatch: 'slate',     swatch: '#7a8288' },
    { id: 'solar',     name: 'Solar',     mode: 'dark',  bootswatch: 'solar',     swatch: '#b58900' },
    { id: 'spacelab',  name: 'Spacelab',  mode: 'light', bootswatch: 'spacelab',  swatch: '#446e9b' },
    { id: 'superhero', name: 'Superhero', mode: 'dark',  bootswatch: 'superhero', swatch: '#df691a' },
    { id: 'united',    name: 'United',    mode: 'light', bootswatch: 'united',    swatch: '#e95420' },
    { id: 'vapor',     name: 'Vapor',     mode: 'dark',  bootswatch: 'vapor',     swatch: '#6f42c1' },
    { id: 'yeti',      name: 'Yeti',      mode: 'light', bootswatch: 'yeti',      swatch: '#008cba' },
    { id: 'zephyr',    name: 'Zephyr',    mode: 'light', bootswatch: 'zephyr',    swatch: '#3459e6' },
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

    this.setBootswatchLink(theme);

    // Seed the accent from the swatch immediately (avoids a flash before the
    // stylesheet loads); the real --bs-primary is synced in syncAccent().
    this.setAccent(theme.swatch);

    localStorage.setItem(STORAGE_KEY, theme.id);
    this.current.set(theme);
  }

  /** Add/replace/remove the Bootswatch stylesheet link. */
  private setBootswatchLink(theme: AppTheme): void {
    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;

    if (!theme.bootswatch) {
      // Default theme → drop the Bootswatch stylesheet entirely.
      link?.remove();
      return;
    }

    if (!link) {
      link = document.createElement('link');
      link.id = LINK_ID;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    link.onload = () => this.syncAccent();
    link.href = `bootswatch/${theme.bootswatch}/bootstrap.min.css`;
  }

  /** Mirror the loaded theme's --bs-primary into --app-primary for the shell. */
  private syncAccent(): void {
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--bs-primary')
      .trim();
    if (primary) this.setAccent(primary);
  }

  private setAccent(color: string): void {
    const root = document.documentElement;
    root.style.setProperty('--app-primary', color);
    const rgb = this.hexToRgb(color);
    if (rgb) root.style.setProperty('--app-primary-rgb', rgb);
  }

  /** "#1677ff" → "22, 119, 255" (returns null for non-hex colors). */
  private hexToRgb(hex: string): string | null {
    if (!hex.startsWith('#')) return null;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6) return null;
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return null;
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
}
