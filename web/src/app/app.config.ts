import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { apiBaseInterceptor } from './core/interceptors/api-base.interceptor';

const WarmPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f9e8df',
      100: '#f5ddd0',
      200: '#e8b5a0',
      300: '#dda088',
      400: '#d17a5c',
      500: '#c45c3e',
      600: '#a84b32',
      700: '#8c3d28',
      800: '#702f1f',
      900: '#542316',
      950: '#3a180f',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiBaseInterceptor])),
    providePrimeNG({
      theme: {
        preset: WarmPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
