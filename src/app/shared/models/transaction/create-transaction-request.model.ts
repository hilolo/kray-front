import { TransactionType, RevenueType, ExpenseType } from './transaction.model';
import { Payment } from './transaction.model';
import { AttachmentInput } from '../contact/create-contact-request.model';

/**
 * Create transaction request model
 */
export interface CreateTransactionRequest {
  type: TransactionType;
  revenueType?: RevenueType;
  expenseType?: ExpenseType;
  propertyId: string;
  leaseId?: string | null;
  contactId: string; // From (revenue) or Pay to (expense)
  date: Date | string; // Transaction date
  payments: Payment[];
  description: string;
  attachments?: AttachmentInput[];
}

