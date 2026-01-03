import { PropertyRequest } from './property-request.model';

/**
 * Paginated property request list response
 */
export interface PropertyRequestListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  result: PropertyRequest[];
}

