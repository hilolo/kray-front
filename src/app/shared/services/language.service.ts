import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'fr';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly storageKey = 'language';
  private readonly currentLanguage = signal<Language>(this.getInitialLanguage());

  constructor() {
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
  }
}

