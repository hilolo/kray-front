import { ReservationStatus } from './reservation.model';

/**
 * Reservation list request filter matching backend GetReservationsFilter
 */
export interface ReservationListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  companyId?: string;
  contactId?: string;
  propertyId?: string;
  status?: ReservationStatus;
  isArchived?: boolean;
  startDateFrom?: string; // ISO date string
  startDateTo?: string; // ISO date string
}

