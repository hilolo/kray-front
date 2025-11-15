import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'fr';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly storageKey = 'language';
  private readonly currentLanguage = signal<Language>(this.getInitialLanguage());
  private translateService: TranslateService | null = null;

  constructor() {
    // TranslateService will be injected after initialization
    // We'll set it up in AppComponent
  }

  setTranslateService(translateService: TranslateService): void {
    console.log('[LanguageService] setTranslateService() called');
    console.log('[LanguageService] TranslateService currentLang:', translateService.currentLang);
    this.translateService = translateService;
    // Initialize language after TranslateService is set
    this.initLanguage();
  }

  private initLanguage(): void {
    console.log('[LanguageService] initLanguage() called');
    const savedLanguage = localStorage.getItem(this.storageKey) as Language | null;
    console.log('[LanguageService] Saved language from localStorage:', savedLanguage);
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      console.log('[LanguageService] Using saved language:', savedLanguage);
      this.currentLanguage.set(savedLanguage);
      this.applyLanguage(savedLanguage);
    } else {
      // Default to browser language or 'en'
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      const lang: Language = browserLang === 'fr' ? 'fr' : 'en';
      console.log('[LanguageService] Using browser language:', browserLang, '->', lang);
      this.currentLanguage.set(lang);
      this.applyLanguage(lang);
    }
  }

  setLanguage(language: Language): void {
    console.log('[LanguageService] setLanguage() called with:', language);
    this.currentLanguage.set(language);
    this.applyLanguage(language);
    if (this.translateService) {
      // Ensure translations are loaded when changing language
      console.log('[LanguageService] Calling translateService.use(' + language + ')...');
      this.translateService.use(language).subscribe({
        next: () => {
          console.log('[LanguageService] ✅ Translations loaded successfully for:', language);
        },
        error: (err) => {
          console.error('[LanguageService] ❌ Error loading translations:', err);
        }
      });
    }
    localStorage.setItem(this.storageKey, language);
    console.log('[LanguageService] Language saved to localStorage');
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }

  getCurrentLanguageSignal() {
    return this.currentLanguage.asReadonly();
  }

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem(this.storageKey) as Language | null;
    if (saved && (saved === 'en' || saved === 'fr')) {
      return saved;
    }
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    return browserLang === 'fr' ? 'fr' : 'en';
  }

  private applyLanguage(language: Language): void {
    console.log('[LanguageService] applyLanguage() called with:', language);
    document.documentElement.setAttribute('lang', language);
    console.log('[LanguageService] HTML lang attribute set to:', language);
    
    // Set initial language for TranslateService if it's available
    // Use subscribe to ensure translations are loaded before continuing
    if (this.translateService) {
      console.log('[LanguageService] TranslateService is available');
      console.log('[LanguageService] Current TranslateService.currentLang:', this.translateService.currentLang);
      console.log('[LanguageService] Target language:', language);
      
      if (this.translateService.currentLang !== language) {
        console.log('[LanguageService] ⚠️ Language mismatch detected, calling translateService.use(' + language + ')...');
        this.translateService.use(language).subscribe({
          next: () => {
            console.log('[LanguageService] ✅ Translations loaded successfully in applyLanguage()');
            if (this.translateService) {
              console.log('[LanguageService] TranslateService.currentLang after use():', this.translateService.currentLang);
            }
          },
          error: (err) => {
            console.error('[LanguageService] ❌ Error loading translations in applyLanguage():', err);
          }
        });
      } else {
        console.log('[LanguageService] ✅ Languages already match, no need to reload');
      }
    } else {
      console.log('[LanguageService] ⚠️ TranslateService is not available yet');
    }
  }
}

