/**
 * Leasing status enum matching backend
 */
export enum LeasingStatus {
  Active = 0,
  Expired = 1,
  Terminated = 2,
  Pending = 3
}

/**
 * Payment type for lease enum matching backend
 */
export enum TypePaimentLease {
  Monthly = 0,
  Quarterly = 1,      // Trimestrial (3 months)
  SemiAnnually = 2,   // 6 months
  Fully = 3           // Full payment
}

/**
 * Payment method enum matching backend
 */
export enum PaymentMethod {
  Cash = 0,
  BankTransfer = 1,
  Check = 2
}

/**
 * Attachment model from backend
 */
export interface Attachment {
  id: string;
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  fileSize: number;
  url: string;
  createdAt: string;
}

/**
 * Lease model from backend
 */
export interface Lease {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyIdentifier?: string;
  propertyAddress: string;
  propertyImageUrl: string;
  contactId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAvatarUrl: string;
  
  // Tenancy Information
  tenancyStart: string; // ISO date string
  tenancyEnd: string; // ISO date string
  tenancyDuration: number | null; // Calculated in months
  
  // Payment Information
  paymentType: TypePaimentLease;
  paymentMethod: PaymentMethod;
  paymentDate: number; // Day of month (1-31)
  rentPrice: number;
  depositPrice: number;
  
  // Receipt Information
  enableReceipts: boolean;
  notificationWhatsapp: boolean;
  notificationEmail: boolean;
  
  // Additional Information
  specialTerms: string;
  privateNote: string;
  
  // Documents
  attachments: Attachment[];
  attachmentCount: number;
  
  // Transactions (included in lease response)
  transactions?: import('../transaction/transaction.model').Transaction[];
  
  // Status
  status: LeasingStatus;
  isArchived: boolean;
  
  // System fields
  companyId: string;
  createdAt: string;
  updatedAt: string | null;
}

