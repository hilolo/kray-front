import { TransactionType, RevenueType, ExpenseType, TransactionStatus } from './transaction.model';
import { Payment } from './transaction.model';
import { AttachmentInput } from '../contact/create-contact-request.model';

/**
 * Create transaction request model
 * Maps to backend CreateTransactionDto which expects 'category' instead of 'type'
 */
export interface CreateTransactionRequest {
  category: TransactionType; // Maps to TransactionCategory in backend (Revenue=0, Expense=1)
  revenueType?: RevenueType;
  expenseType?: ExpenseType;
  propertyId?: string | null; // Optional - can be null if not provided
  leaseId?: string | null; // Optional - can be null if not provided
  contactId?: string | null; // From (revenue) or Pay to (expense) - Optional if otherContactName is provided
  otherContactName?: string | null; // For contacts not in the system
  reservationId?: string | null; // Optional - for reservation transactions
  date: Date | string; // Transaction date
  payments: Payment[];
  depositPrice?: number;
  description: string;
  status?: TransactionStatus; // Optional - status for the transaction (defaults to Pending if not provided)
  attachments?: AttachmentInput[];
}

