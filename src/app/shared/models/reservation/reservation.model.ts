/**
 * Reservation status enum matching backend
 */
export enum ReservationStatus {
  Pending = 0,
  Approved = 1,
  Cancelled = 2
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
 * Reservation model from backend
 */
export interface Reservation {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAvatarUrl: string;
  propertyId: string;
  propertyIdentifier: string;
  propertyName: string;
  propertyAddress: string;
  propertyImageUrl: string;
  
  // Reservation Information
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  durationDays: number;
  numberOfNights: number;
  totalAmount: number;
  
  // Request Information
  reason: string;
  description: string;
  requestDate: string; // ISO date string
  
  // Status
  status: ReservationStatus;
  
  // Approval Information
  approvedBy: string | null;
  approvalDate: string | null; // ISO date string
  approvalNotes: string | null;
  
  // Additional Information
  privateNote: string;
  
  // Documents
  attachments: Attachment[];
  attachmentCount: number;
  
  // Archive status
  isArchived: boolean;
  
  // System fields
  companyId: string;
  createdAt: string;
  updatedAt: string | null;
}

