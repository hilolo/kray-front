import type { Bank } from './bank.model';

/**
 * Response model for listing banks
 */
export interface BankListResponse {
  result: Bank[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

