import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { UserService } from './services/user.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { Theme } from './theme';
import { TimespanPipe } from './pipes/timespan.pipe';

async function initializeApp() {
  const userService = inject(UserService);
  await userService.loadUserFromStorage();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideAppInitializer(initializeApp),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Theme,
      },
    }),
    TimespanPipe,
  ],
};
