import { Injectable, signal } from '@angular/core';

export type ThemePreset = 'default' | 'brutalist' | 'soft-pop' | 'tangerine' | 'neutral' | 'stone' | 'zinc' | 'gray' | 'slate' | 'special';

export interface ThemePresetInfo {
  value: ThemePreset;
  label: string;
  color: string; // Color swatch for UI display
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'themePreset';
  
  // Define themePresets first so it's available when loadTheme() is called
  readonly themePresets: ThemePresetInfo[] = [
    { value: 'default', label: 'Default', color: '#000000' },
    { value: 'brutalist', label: 'Brutalist', color: '#dc2626' },
    { value: 'soft-pop', label: 'Soft Pop', color: '#9333ea' },
    { value: 'tangerine', label: 'Tangerine', color: '#ea580c' },
    { value: 'neutral', label: 'Neutral', color: '#525252' },
    { value: 'stone', label: 'Stone', color: '#78716c' },
    { value: 'zinc', label: 'Zinc', color: '#71717a' },
    { value: 'gray', label: 'Gray', color: '#6b7280' },
    { value: 'slate', label: 'Slate', color: '#64748b' },
    { value: 'special', label: 'Special', color: '#667eea' },
  ];

  private readonly currentTheme = signal<ThemePreset>(this.loadTheme());

  constructor() {
    // Don't apply theme in constructor - wait for DOM to be ready
    // Theme will be applied in app component ngOnInit after dark mode
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ThemePreset {
    return this.currentTheme();
  }

  /**
   * Get current theme signal (readonly)
   */
  getCurrentThemeSignal() {
    return this.currentTheme.asReadonly();
  }

  /**
   * Set theme and apply it
   */
  setTheme(theme: ThemePreset): void {
    if (!this.isValidTheme(theme)) {
      console.warn(`Invalid theme: ${theme}. Using default theme.`);
      theme = 'default';
    }
    
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Apply the current theme (useful for initialization)
   */
  applyCurrentTheme(): void {
    const theme = this.currentTheme();
    this.applyTheme(theme);
  }

  /**
   * Load theme from localStorage
   */
  private loadTheme(): ThemePreset {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'default'; // SSR or localStorage not available
    }
    
    try {
      const saved = localStorage.getItem(this.storageKey) as ThemePreset | null;
      if (saved && this.isValidTheme(saved)) {
        return saved;
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
    return 'default';
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: ThemePreset): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // SSR or localStorage not available
    }
    
    try {
      localStorage.setItem(this.storageKey, theme);
      // Verify it was saved
      const saved = localStorage.getItem(this.storageKey);
      if (saved !== theme) {
        console.warn('Theme may not have been saved correctly to localStorage');
      }
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }

  /**
   * Apply theme by setting data attribute on document element
   */
  private applyTheme(theme: ThemePreset): void {
    if (typeof document === 'undefined') {
      console.warn('Document is not available, cannot apply theme');
      return;
    }

    const html = document.documentElement;
    
    // Remove all theme classes
    this.themePresets.forEach(preset => {
      html.classList.remove(`theme-${preset.value}`);
    });

    // Add current theme class
    if (theme !== 'default') {
      html.classList.add(`theme-${theme}`);
    }

    // Set data attribute for CSS targeting (but don't overwrite dark mode's data-theme)
    // We'll use a separate attribute for theme preset
    html.setAttribute('data-theme-preset', theme);
  }

  /**
   * Check if theme is valid
   */
  private isValidTheme(theme: string): theme is ThemePreset {
    return this.themePresets.some(preset => preset.value === theme);
  }
}

