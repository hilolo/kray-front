import type { ContactType } from './contact.model';

/**
 * View type for contact lists
 */
export type ContactListViewType = 'list' | 'card';

/**
 * List preferences for a specific contact type
 */
export interface ContactListPreferences {
  viewType: ContactListViewType;
}

/**
 * Preferences for all contact type lists
 */
export interface ContactListPreferencesMap {
  [ContactType.Owner]: ContactListPreferences;
  [ContactType.Tenant]: ContactListPreferences;
  [ContactType.Service]: ContactListPreferences;
}

