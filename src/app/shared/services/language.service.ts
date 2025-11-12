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
    this.translateService = translateService;
    // Initialize language after TranslateService is set
    this.initLanguage();
  }

  private initLanguage(): void {
    const savedLanguage = localStorage.getItem(this.storageKey) as Language | null;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      this.currentLanguage.set(savedLanguage);
      this.applyLanguage(savedLanguage);
    } else {
      // Default to browser language or 'en'
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      const lang: Language = browserLang === 'fr' ? 'fr' : 'en';
      this.currentLanguage.set(lang);
      this.applyLanguage(lang);
    }
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    this.applyLanguage(language);
    if (this.translateService) {
      this.translateService.use(language);
    }
    localStorage.setItem(this.storageKey, language);
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
    document.documentElement.setAttribute('lang', language);
    // Set initial language for TranslateService if it's available
    if (this.translateService && this.translateService.currentLang !== language) {
      this.translateService.use(language).subscribe();
    }
  }
}

