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
    console.log('[APP_INITIALIZER] Starting translation initialization...');
    
    // Get language from localStorage or default to browser language
    const storageKey = 'language';
    const savedLanguage = localStorage.getItem(storageKey);
    let lang = 'en';
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      lang = savedLanguage;
      console.log('[APP_INITIALIZER] Using saved language from localStorage:', lang);
    } else {
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      lang = browserLang === 'fr' ? 'fr' : 'en';
      console.log('[APP_INITIALIZER] Using browser language:', browserLang, '->', lang);
    }
    
    // Set default language and load translations
    console.log('[APP_INITIALIZER] Setting default language to: en');
    translateService.setDefaultLang('en');
    console.log('[APP_INITIALIZER] Setting HTML lang attribute to:', lang);
    document.documentElement.setAttribute('lang', lang);
    
    // Check current state
    console.log('[APP_INITIALIZER] TranslateService currentLang before use():', translateService.currentLang);
    console.log('[APP_INITIALIZER] TranslateService langs:', translateService.getLangs());
    
    // Return promise that resolves when translations are loaded
    return new Promise<void>((resolve) => {
      console.log('[APP_INITIALIZER] Calling translateService.use(' + lang + ')...');
      const startTime = Date.now();
      
      translateService.use(lang).subscribe({
        next: (translations) => {
          const loadTime = Date.now() - startTime;
          console.log('[APP_INITIALIZER] ✅ Translations loaded successfully in', loadTime + 'ms');
          console.log('[APP_INITIALIZER] TranslateService currentLang after use():', translateService.currentLang);
          console.log('[APP_INITIALIZER] Translations object keys count:', translations ? Object.keys(translations).length : 0);
          console.log('[APP_INITIALIZER] Sample translation keys:', translations ? Object.keys(translations).slice(0, 5) : []);
          resolve();
        },
        error: (error) => {
          const loadTime = Date.now() - startTime;
          console.error('[APP_INITIALIZER] ❌ Error loading translations after', loadTime + 'ms:', error);
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
