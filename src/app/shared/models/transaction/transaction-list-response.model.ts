import { Transaction } from './transaction.model';

/**
 * Transaction list response
 */
export interface TransactionListResponse {
  items: Transaction[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

