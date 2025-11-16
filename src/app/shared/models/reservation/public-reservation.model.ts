import { ReservationStatus } from './reservation.model';

/**
 * Public reservation model from backend PublicReservationDto
 * Only includes dates and status, no client information for privacy
 */
export interface PublicReservation {
  id: string;
  propertyId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: ReservationStatus;
}

