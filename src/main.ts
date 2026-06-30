import { platformBrowser } from '@angular/platform-browser';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AppModule } from './app/app.module';

// Register all AG Grid community features once for the whole app.
ModuleRegistry.registerModules([AllCommunityModule]);

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
