import type { Lease } from './lease.model';

/**
 * Lease list response model matching backend PaginatedList<LeaseDto>
 */
export interface LeaseListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  result: Lease[];
}

