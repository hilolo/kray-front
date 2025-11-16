/**
 * Request model for listing keys
 */
export interface KeyListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  propertyId?: string;
}

