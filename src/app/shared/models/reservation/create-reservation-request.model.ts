import type { AttachmentInput } from '../contact/create-contact-request.model';

/**
 * Create reservation request model matching backend CreateReservationDto
 */
export interface CreateReservationRequest {
  contactId: string;
  propertyId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  maxGuests: number;
  totalAmount: number;
  description: string;
  privateNote: string;
  attachments: AttachmentInput[];
}

