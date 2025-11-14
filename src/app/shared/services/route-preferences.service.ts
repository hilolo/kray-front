import { Injectable, signal } from '@angular/core';
import type { RoutePreferences, RoutePreferencesMap, RouteListViewType } from '@shared/models/route-preferences.model';

/**
 * Generic service to manage route preferences (view type, etc.) for any route in the app
 * Persists preferences to localStorage
 */
@Injectable({
  providedIn: 'root',
})
export class RoutePreferencesService {
  private readonly storageKey = 'routePreferences';
  private readonly defaultViewType: RouteListViewType = 'list';
  private readonly defaultPageSize: number = 10;
  
  private readonly preferences = signal<RoutePreferencesMap>(this.loadPreferences());

  /**
   * Get view type for a specific route
   * @param routeKey - Unique identifier for the route (e.g., 'contact/tenants', 'contact/owners', 'products/list')
   */
  getViewType(routeKey: string): RouteListViewType {
    return this.preferences()[routeKey]?.viewType || this.defaultViewType;
  }

  /**
   * Set view type for a specific route
   * @param routeKey - Unique identifier for the route
   * @param viewType - The view type to set ('list' or 'card')
   */
  setViewType(routeKey: string, viewType: RouteListViewType): void {
    const current = this.preferences();
    const updated: RoutePreferencesMap = {
      ...current,
      [routeKey]: {
        ...current[routeKey],
        viewType,
      },
    };
    this.preferences.set(updated);
    this.savePreferences(updated);
  }

  /**
   * Get page size (rows per page) for a specific route
   * @param routeKey - Unique identifier for the route
   */
  getPageSize(routeKey: string): number {
    return this.preferences()[routeKey]?.pageSize || this.defaultPageSize;
  }

  /**
   * Set page size (rows per page) for a specific route
   * @param routeKey - Unique identifier for the route
   * @param pageSize - The page size to set
   */
  setPageSize(routeKey: string, pageSize: number): void {
    const current = this.preferences();
    const updated: RoutePreferencesMap = {
      ...current,
      [routeKey]: {
        ...current[routeKey],
        pageSize,
      },
    };
    this.preferences.set(updated);
    this.savePreferences(updated);
  }

  /**
   * Get all preferences for a specific route
   * @param routeKey - Unique identifier for the route
   */
  getPreferences(routeKey: string): RoutePreferences {
    return this.preferences()[routeKey] || { viewType: this.defaultViewType, pageSize: this.defaultPageSize };
  }

  /**
   * Set preferences for a specific route
   * @param routeKey - Unique identifier for the route
   * @param preferences - The preferences to set
   */
  setPreferences(routeKey: string, preferences: RoutePreferences): void {
    const current = this.preferences();
    const updated: RoutePreferencesMap = {
      ...current,
      [routeKey]: {
        ...current[routeKey],
        ...preferences,
      },
    };
    this.preferences.set(updated);
    this.savePreferences(updated);
  }

  /**
   * Get a specific preference value for a route
   * @param routeKey - Unique identifier for the route
   * @param key - The preference key
   * @param defaultValue - Default value if not found
   */
  getPreference<T = any>(routeKey: string, key: string, defaultValue?: T): T | undefined {
    const routePrefs = this.preferences()[routeKey];
    return routePrefs?.[key] ?? defaultValue;
  }

  /**
   * Set a specific preference value for a route
   * @param routeKey - Unique identifier for the route
   * @param key - The preference key
   * @param value - The value to set
   */
  setPreference<T = any>(routeKey: string, key: string, value: T): void {
    const current = this.preferences();
    const routePrefs = current[routeKey] || {};
    const updated: RoutePreferencesMap = {
      ...current,
      [routeKey]: {
        ...routePrefs,
        [key]: value,
      },
    };
    this.preferences.set(updated);
    this.savePreferences(updated);
  }

  /**
   * Get all preferences signal (readonly)
   */
  getAllPreferences() {
    return this.preferences.asReadonly();
  }

  /**
   * Clear preferences for a specific route
   * @param routeKey - Unique identifier for the route
   */
  clearRoute(routeKey: string): void {
    const current = this.preferences();
    const updated = { ...current };
    delete updated[routeKey];
    this.preferences.set(updated);
    this.savePreferences(updated);
  }

  /**
   * Clear all preferences
   */
  clearAll(): void {
    this.preferences.set({});
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): RoutePreferencesMap {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as RoutePreferencesMap;
        // Migrate old contact list preferences if they exist
        this.migrateOldPreferences(parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading route preferences:', error);
    }
    
    // Try to migrate from old contact list preferences
    const migrated = this.migrateFromContactListPreferences();
    if (migrated) {
      return migrated;
    }
    
    return {};
  }

  /**
   * Migrate from old contact list preferences format
   */
  private migrateFromContactListPreferences(): RoutePreferencesMap | null {
    try {
      const oldKey = 'contactListPreferences';
      const oldData = localStorage.getItem(oldKey);
      if (oldData) {
        const parsed = JSON.parse(oldData) as Record<string | number, { viewType: string }>;
        const migrated: RoutePreferencesMap = {};
        
        // Map old contact type keys to route keys
        const parseViewType = (value: string | undefined): RouteListViewType => {
          if (value === 'list' || value === 'card') {
            return value as RouteListViewType;
          }
          return this.defaultViewType;
        };
        
        if (parsed['0'] || parsed[0]) {
          migrated['contact/owners'] = { viewType: parseViewType((parsed['0'] || parsed[0])?.viewType) };
        }
        if (parsed['1'] || parsed[1]) {
          migrated['contact/tenants'] = { viewType: parseViewType((parsed['1'] || parsed[1])?.viewType) };
        }
        if (parsed['2'] || parsed[2]) {
          migrated['contact/services'] = { viewType: parseViewType((parsed['2'] || parsed[2])?.viewType) };
        }
        
        if (Object.keys(migrated).length > 0) {
          // Save migrated data
          this.savePreferences(migrated);
          // Optionally remove old data (comment out if you want to keep it as backup)
          // localStorage.removeItem(oldKey);
          return migrated;
        }
      }
    } catch (error) {
      console.error('Error migrating from contact list preferences:', error);
    }
    return null;
  }

  /**
   * Migrate old preferences format if needed
   */
  private migrateOldPreferences(parsed: RoutePreferencesMap): void {
    // Add any migration logic here if needed in the future
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(preferences: RoutePreferencesMap): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving route preferences:', error);
      // Handle quota exceeded or other storage errors
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Clearing old preferences and retrying...');
        try {
          localStorage.removeItem(this.storageKey);
          localStorage.setItem(this.storageKey, JSON.stringify(preferences));
        } catch (retryError) {
          console.error('Failed to save preferences after clearing:', retryError);
        }
      }
    }
  }
}

