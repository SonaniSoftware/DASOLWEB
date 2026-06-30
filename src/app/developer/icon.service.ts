import { Injectable } from '@angular/core';
import { MATERIAL_ICON_NAMES } from './material-icons';

// All "Material Icons" (classic, the font loaded in index.html) names.
const CODEPOINTS_URL =
  'https://cdn.jsdelivr.net/gh/google/material-design-icons@master/font/MaterialIcons-Regular.codepoints';

@Injectable({ providedIn: 'root' })
export class IconService {
  private cache?: Promise<string[]>;

  /** Full icon-name list (fetched once, cached). Falls back to the curated set. */
  getIcons(): Promise<string[]> {
    if (!this.cache) {
      // Native fetch (not HttpClient) so the auth interceptor doesn't attach the token to a CDN.
      this.cache = fetch(CODEPOINTS_URL)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error('codepoints fetch failed'))))
        .then((text) => {
          const names = text
            .split('\n')
            .map((line) => line.trim().split(/\s+/)[0])
            .filter(Boolean);
          return names.length ? names : MATERIAL_ICON_NAMES;
        })
        .catch(() => MATERIAL_ICON_NAMES);
    }
    return this.cache;
  }
}
