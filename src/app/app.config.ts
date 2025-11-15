import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CustomTranslateLoader } from './shared/services/custom-translate-loader';
import { apiResponseInterceptor } from './shared/interceptors/api-response.interceptor';
import { authTokenInterceptor } from './shared/interceptors/auth-token.interceptor';
import { tokenRefreshInterceptor } from './shared/interceptors/token-refresh.interceptor';

import { routes } from './app.routes';

// Factory function for CustomTranslateLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

// APP_INITIALIZER function to load translations before app starts
export function initializeApp(translateService: TranslateService): () => Promise<any> {
  return () => {
    // Get language from localStorage or default to browser language
    const storageKey = 'language';
    const savedLanguage = localStorage.getItem(storageKey);
    let lang = 'en';
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      lang = savedLanguage;
    } else {
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      lang = browserLang === 'fr' ? 'fr' : 'en';
    }
    
    // Set default language and load translations
    translateService.setDefaultLang('en');
    document.documentElement.setAttribute('lang', lang);
    
    // Return promise that resolves when translations are loaded
    return new Promise<void>((resolve) => {
      translateService.use(lang).subscribe({
        next: () => {
          resolve();
        },
        error: () => {
          // Even if loading fails, resolve to allow app to start
          resolve();
        }
      });
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authTokenInterceptor,      // 1. Add token to requests first
        tokenRefreshInterceptor,    // 2. Handle 401 and refresh token (must be before apiResponseInterceptor)
        apiResponseInterceptor,    // 3. Handle response format and errors last (runs first on error, so we skip 401)
      ])
    ),
    ...TranslateModule.forRoot({
      fallbackLang: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }).providers || [],
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [TranslateService],
      multi: true,
    },
  ],
};
