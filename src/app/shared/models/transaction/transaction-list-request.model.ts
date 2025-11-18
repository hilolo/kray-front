import { TransactionType } from './transaction.model';

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
  propertyId?: string;
  leaseId?: string;
  contactId?: string;
}

