import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private readonly storageKey = 'theme';
  private readonly currentTheme = signal<'light' | 'dark'>(this.getInitialTheme());

  constructor() {
    this.initTheme();
  }

  initTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey);
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const theme = isDark ? 'dark' : 'light';
    this.currentTheme.set(theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
    this.applyTheme(newTheme);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme();
  }

  getCurrentThemeSignal() {
    return this.currentTheme.asReadonly();
  }

  private getInitialTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(this.storageKey) as 'light' | 'dark' | null;
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const html = document.documentElement;
    const isDark = theme === 'dark';

    html.classList.toggle('dark', isDark);
    html.setAttribute('data-theme', theme);
    html.style.colorScheme = theme;
    localStorage.setItem(this.storageKey, theme);
  }
}

