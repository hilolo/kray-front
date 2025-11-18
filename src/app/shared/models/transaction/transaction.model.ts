/**
 * Transaction type enum
 */
export enum TransactionType {
  Revenue = 0,
  Expense = 1,
}

/**
 * Revenue type enum
 */
export enum RevenueType {
  Loyer = 0,
  Caution = 1,
  FraisAgence = 2,
  ReservationPart = 3,
  ReservationFull = 4,
  Maintenance = 5,
  Autre = 6,
}

/**
 * Expense type enum
 */
export enum ExpenseType {
  Loyer = 0,
  Maintenance = 1,
  Chargee = 2,
  Autre = 3,
}

/**
 * Transaction status enum
 */
export enum TransactionStatus {
  Pending = 0,
  Overdue = 1,
  Paid = 2,
}

/**
 * Payment model for transaction
 * Currency is always MAD (Moroccan Dirham)
 */
export interface Payment {
  amount: number;
  vatPercent: number;
  description: string;
}

/**
 * Transaction model from backend
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  revenueType?: RevenueType;
  expenseType?: ExpenseType;
  status: TransactionStatus;
  propertyId?: string;
  propertyName?: string;
  propertyIdentifier?: string;
  propertyAddress?: string;
  ownerName?: string;
  leaseId?: string;
  leaseTenantName?: string;
  contactId?: string; // From (revenue) or Pay to (expense)
  contactName?: string;
  otherContactName?: string; // For contacts not in the system
  payments: Payment[];
  totalAmount: number;
  description: string;
  companyId: string;
  date: string; // Transaction date (separate from createdAt)
  createdAt: string; // Record creation timestamp
  updatedAt: string | null;
}


