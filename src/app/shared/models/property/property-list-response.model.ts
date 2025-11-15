import { Property } from './property.model';

/**
 * Paginated property list response
 */
export interface PropertyListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  result: Property[];
}

