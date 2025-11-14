/**
 * Search options model for list views
 * Used for pagination, filtering, and searching across modules
 */
export interface SearchOptions {
  /** Current page number (1-based) */
  currentPage?: number;
  
  /** Number of items per page */
  pageSize?: number;
  
  /** Search query string */
  searchQuery?: string;
  
  /** Whether to ignore/include archived/deleted items */
  ignore?: boolean;
  
  /** Optional company ID filter */
  companyId?: string | null;
  
  /** Additional dynamic filters that can be added per module */
  [key: string]: any;
}

/**
 * Default search options values
 */
export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  ignore: false,
  companyId: null,
};

/**
 * Creates a search options object with default values
 * @param options Partial search options to override defaults
 * @returns SearchOptions with defaults applied
 */
export function createSearchOptions(options?: Partial<SearchOptions>): SearchOptions {
  return {
    ...DEFAULT_SEARCH_OPTIONS,
    ...options,
  };
}

