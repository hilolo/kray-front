import { Injectable, signal, inject, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'fr';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly storageKey = 'language';
  private readonly currentLanguage = signal<Language>(this.getInitialLanguage());
  private readonly translateService = inject(TranslateService);
  private readonly ngZone = inject(NgZone);

  constructor() {
    // Initialize language after TranslateService is injected
    this.initLanguage();
  }

  setTranslateService(translateService: TranslateService): void {
    // This method is kept for backward compatibility but TranslateService is now injected
    // Initialize language after TranslateService is set
    this.initLanguage();
  }

  private initLanguage(): void {
    const savedLanguage = localStorage.getItem(this.storageKey) as Language | null;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      this.currentLanguage.set(savedLanguage);
      this.applyLanguage(savedLanguage);
    } else {
      // Default to French if no language is saved and save it
      const lang: Language = 'fr';
      localStorage.setItem(this.storageKey, lang);
      this.currentLanguage.set(lang);
      this.applyLanguage(lang);
    }
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    localStorage.setItem(this.storageKey, language);
    
    const previousLang = this.translateService.currentLang;
    
    // If same language, force a reload by switching to temp language then back
    // This ensures the translate pipe detects the change
    if (previousLang === language) {
      const tempLang = language === 'en' ? 'fr' : 'en';
      
      // Switch to temp language first
      this.translateService.use(tempLang).subscribe({
        next: () => {
          // Switch back to desired language - this will trigger the change event
          this.translateService.use(language).subscribe({
            next: () => {
              // Wait a microtask to ensure translations are fully stored
              Promise.resolve().then(() => {
                // Ensure change detection is triggered
                this.ngZone.run(() => {
                  this.applyLanguage(language);
                });
              });
            },
            error: () => {
              this.applyLanguage(language);
            }
          });
        },
        error: () => {
          // Fallback: try to use the language directly
          this.translateService.use(language).subscribe({
            next: () => {
              this.applyLanguage(language);
            },
            error: () => {
              this.applyLanguage(language);
            }
          });
        }
      });
    } else {
      // Load new language
      this.translateService.use(language).subscribe({
        next: () => {
          // Wait a microtask to ensure translations are fully stored
          Promise.resolve().then(() => {
            // Ensure change detection is triggered
            this.ngZone.run(() => {
              this.applyLanguage(language);
            });
          });
        },
        error: () => {
          this.applyLanguage(language);
        }
      });
    }
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
    // Default to French if no language is saved
    return 'fr';
  }

  private applyLanguage(language: Language): void {
    document.documentElement.setAttribute('lang', language);
  }

}


