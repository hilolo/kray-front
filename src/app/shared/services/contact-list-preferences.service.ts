import { Injectable, signal } from '@angular/core';
import { ContactType } from '@shared/models/contact/contact.model';
import type { ContactListPreferences, ContactListPreferencesMap, ContactListViewType } from '@shared/models/contact/contact-list-preferences.model';

/**
 * Service to manage contact list preferences (view type) per contact type
 * Persists preferences to localStorage
 */
@Injectable({
  providedIn: 'root',
})
export class ContactListPreferencesService {
  private readonly storageKey = 'contactListPreferences';
  private readonly defaultViewType: ContactListViewType = 'list';
  
  private readonly preferences = signal<ContactListPreferencesMap>(this.loadPreferences());

  constructor() {
    // Initialize preferences for all contact types if not present
    this.initializeDefaults();
  }

  /**
   * Get view type for a specific contact type
   */
  getViewType(contactType: ContactType): ContactListViewType {
    return this.preferences()[contactType]?.viewType || this.defaultViewType;
  }

  /**
   * Set view type for a specific contact type
   */
  setViewType(contactType: ContactType, viewType: ContactListViewType): void {
    const current = this.preferences();
    const updated: ContactListPreferencesMap = {
      ...current,
      [contactType]: {
        ...current[contactType],
        viewType,
      },
    };
    this.preferences.set(updated);
    this.savePreferences(updated);
  }

  /**
   * Get preferences signal (readonly)
   */
  getPreferences() {
    return this.preferences.asReadonly();
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): ContactListPreferencesMap {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string | number, ContactListPreferences>;
        // Ensure all contact types have preferences
        // Handle both string and number keys from localStorage
        const ownerPref = parsed[ContactType.Owner] || parsed[String(ContactType.Owner)] || parsed['0'];
        const tenantPref = parsed[ContactType.Tenant] || parsed[String(ContactType.Tenant)] || parsed['1'];
        const servicePref = parsed[ContactType.Service] || parsed[String(ContactType.Service)] || parsed['2'];
        
        const loaded: ContactListPreferencesMap = {
          [ContactType.Owner]: ownerPref || { viewType: this.defaultViewType },
          [ContactType.Tenant]: tenantPref || { viewType: this.defaultViewType },
          [ContactType.Service]: servicePref || { viewType: this.defaultViewType },
        };
        
        // Save back to ensure consistent format
        this.savePreferences(loaded);
        return loaded;
      }
    } catch (error) {
      console.error('Error loading contact list preferences:', error);
    }
    const defaults = this.getDefaultPreferences();
    // Save defaults on first load
    this.savePreferences(defaults);
    return defaults;
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(preferences: ContactListPreferencesMap): void {
    try {
      // Ensure we're saving with numeric keys for consistency
      const toSave = {
        [ContactType.Owner]: preferences[ContactType.Owner],
        [ContactType.Tenant]: preferences[ContactType.Tenant],
        [ContactType.Service]: preferences[ContactType.Service],
      };
      localStorage.setItem(this.storageKey, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving contact list preferences:', error);
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

  /**
   * Get default preferences for all contact types
   */
  private getDefaultPreferences(): ContactListPreferencesMap {
    return {
      [ContactType.Owner]: { viewType: this.defaultViewType },
      [ContactType.Tenant]: { viewType: this.defaultViewType },
      [ContactType.Service]: { viewType: this.defaultViewType },
    };
  }

  /**
   * Initialize defaults if any contact type is missing preferences
   */
  private initializeDefaults(): void {
    const current = this.preferences();
    let needsUpdate = false;
    const updated = { ...current };

    if (!updated[ContactType.Owner]) {
      updated[ContactType.Owner] = { viewType: this.defaultViewType };
      needsUpdate = true;
    }
    if (!updated[ContactType.Tenant]) {
      updated[ContactType.Tenant] = { viewType: this.defaultViewType };
      needsUpdate = true;
    }
    if (!updated[ContactType.Service]) {
      updated[ContactType.Service] = { viewType: this.defaultViewType };
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.preferences.set(updated);
      this.savePreferences(updated);
    }
  }
}

