import { TransactionType, RevenueType, ExpenseType } from './transaction.model';
import { Payment } from './transaction.model';

/**
 * Update transaction request model
 */
export interface UpdateTransactionRequest {
  category?: TransactionType; // Category (Revenue or Expense) - maps to Category in backend
  revenueType?: RevenueType;
  expenseType?: ExpenseType;
  leaseId?: string | null;
  contactId: string; // From (revenue) or Pay to (expense)
  date: Date | string; // Transaction date
  payments: Payment[];
  description: string;
}

