import { TypePaimentLease, PaymentMethod } from './lease.model';
import type { AttachmentInput } from '../contact/create-contact-request.model';

/**
 * Create lease request model matching backend CreateLeaseDto
 */
export interface CreateLeaseRequest {
  propertyId: string;
  contactId: string;
  tenancyStart: string; // ISO date string
  tenancyEnd: string; // ISO date string
  paymentType: TypePaimentLease;
  paymentMethod: PaymentMethod;
  paymentDate: number; // Day of month (1-31)
  rentPrice: number;
  depositPrice: number;
  enableReceipts: boolean;
  notificationWhatsapp: boolean;
  notificationEmail: boolean;
  specialTerms: string;
  privateNote: string;
  attachments: AttachmentInput[];
}

