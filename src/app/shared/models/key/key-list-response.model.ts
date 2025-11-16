import type { Key } from './key.model';

/**
 * Response model for listing keys
 */
export interface KeyListResponse {
  result: Key[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

