import { TransactionType, RevenueType, ExpenseType } from './transaction.model';

/**
 * Transaction list request filter
 */
export interface TransactionListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  companyId?: string;
  type?: TransactionType;
  revenueTypes?: RevenueType[]; // Filter by multiple revenue types
  expenseTypes?: ExpenseType[]; // Filter by multiple expense types
  propertyId?: string;
  leaseId?: string;
  contactId?: string;
}

