/**
 * Building list request model
 */
export interface BuildingListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  isArchived?: boolean;
}

