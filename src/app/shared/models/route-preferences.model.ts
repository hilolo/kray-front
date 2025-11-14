/**
 * View type for list views
 */
export type RouteListViewType = 'list' | 'card';

/**
 * Preferences for a specific route
 */
export interface RoutePreferences {
  viewType?: RouteListViewType;
  pageSize?: number; // Number of rows per page
  [key: string]: any; // Allow additional custom preferences per route
}

/**
 * Map of route keys to their preferences
 */
export interface RoutePreferencesMap {
  [routeKey: string]: RoutePreferences;
}

