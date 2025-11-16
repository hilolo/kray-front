import { ReservationStatus } from './reservation.model';
import type { AttachmentInput } from '../contact/create-contact-request.model';

/**
 * Update reservation request model matching backend UpdateReservationDto
 */
export interface UpdateReservationRequest {
  contactId: string;
  propertyId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalAmount: number;
  description: string;
  privateNote: string;
  status?: ReservationStatus; // Optional - backend keeps existing status if not provided
  approvedBy?: string | null;
  approvalNotes?: string | null;
  attachmentsToAdd: AttachmentInput[];
  attachmentsToDelete: string[];
}

