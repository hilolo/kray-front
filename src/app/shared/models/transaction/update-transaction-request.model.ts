import { TransactionType, RevenueType, ExpenseType } from './transaction.model';
import { Payment } from './transaction.model';
import { AttachmentInput } from '@shared/models/contact/create-contact-request.model';

/**
 * Update transaction request model
 */
export interface UpdateTransactionRequest {
  category?: TransactionType; // Category (Revenue or Expense) - maps to Category in backend
  revenueType?: RevenueType;
  expenseType?: ExpenseType;
  leaseId?: string | null;
  contactId?: string | null; // From (revenue) or Pay to (expense) - Optional if otherContactName is provided
  otherContactName?: string | null; // For contacts not in the system
  reservationId?: string | null; // Optional - for reservation transactions
  date: Date | string; // Transaction date
  payments: Payment[];
  depositPrice?: number;
  description: string;
  attachmentsToAdd?: AttachmentInput[];
  attachmentsToDelete?: string[];
}

