import { TransactionType, RevenueType, ExpenseType } from './transaction.model';
import { Payment } from './transaction.model';

/**
 * Update transaction request model
 */
export interface UpdateTransactionRequest {
  revenueType?: RevenueType;
  expenseType?: ExpenseType;
  leaseId?: string | null;
  contactId: string; // From (revenue) or Pay to (expense)
  payments: Payment[];
  description: string;
}

