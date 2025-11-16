import type { Reservation } from './reservation.model';

/**
 * Reservation list response model matching backend PaginatedList<ReservationDto>
 */
export interface ReservationListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  result: Reservation[];
}

