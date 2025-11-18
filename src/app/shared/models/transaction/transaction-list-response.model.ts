import { Transaction } from './transaction.model';

/**
 * Transaction list response
 */
export interface TransactionListResponse {
  result: Transaction[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

