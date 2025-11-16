import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { ReservationListRequest } from '../models/reservation/reservation-list-request.model';
import type { ReservationListResponse } from '../models/reservation/reservation-list-response.model';
import type { CreateReservationRequest } from '../models/reservation/create-reservation-request.model';
import type { UpdateReservationRequest } from '../models/reservation/update-reservation-request.model';
import type { Reservation } from '../models/reservation/reservation.model';
import { ReservationStatus } from '../models/reservation/reservation.model';
import type { PublicReservation } from '../models/reservation/public-reservation.model';

/**
 * Service for reservation-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of reservations
   * POST api/Reservation/list
   * @param request Reservation list request parameters
   * @returns Observable of paginated reservation list response
   */
  list(request: ReservationListRequest): Observable<ReservationListResponse> {
    return this.apiService.post<ReservationListResponse>('Reservation/list', request);
  }

  /**
   * Create a new reservation
   * POST api/Reservation/create
   * @param request Reservation creation data
   * @returns Observable of created reservation
   */
  create(request: CreateReservationRequest): Observable<Reservation> {
    return this.apiService.post<Reservation>('Reservation/create', request);
  }

  /**
   * Get a reservation by ID
   * GET api/Reservation/{id}
   * @param id Reservation ID
   * @returns Observable of reservation
   */
  getById(id: string): Observable<Reservation> {
    return this.apiService.get<Reservation>(`Reservation/${id}`);
  }

  /**
   * Update an existing reservation
   * PUT api/Reservation/{id}
   * @param id Reservation ID
   * @param request Reservation update data
   * @returns Observable of updated reservation
   */
  update(id: string, request: UpdateReservationRequest): Observable<Reservation> {
    return this.apiService.put<Reservation>(`Reservation/${id}`, request);
  }

  /**
   * Delete a reservation (soft delete)
   * DELETE api/Reservation/{id}
   * @param id Reservation ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Reservation/${id}`);
  }

  /**
   * Toggle archive status of a reservation
   * POST api/Reservation/{id}/archive?archive=true
   * @param id Reservation ID
   * @param archive True to archive, false to activate
   * @returns Observable of result
   */
  toggleArchive(id: string, archive: boolean = true): Observable<void> {
    return this.apiService.post<void>(`Reservation/${id}/archive?archive=${archive}`, {});
  }

  /**
   * Update reservation status
   * POST api/Reservation/{id}/status
   * @param id Reservation ID
   * @param status New status
   * @returns Observable of result
   */
  updateStatus(id: string, status: ReservationStatus): Observable<void> {
    return this.apiService.post<void>(`Reservation/${id}/status`, status);
  }

  /**
   * Get overlapping reservations for a property within a date range
   * GET api/Reservation/overlapping
   * @param propertyId Property ID
   * @param startDate Start date
   * @param endDate End date
   * @param excludeReservationId Optional reservation ID to exclude (for updates)
   * @returns Observable of overlapping reservations
   */
  getOverlappingReservations(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    excludeReservationId?: string
  ): Observable<Reservation[]> {
    const params = new URLSearchParams({
      propertyId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    if (excludeReservationId) {
      params.append('excludeReservationId', excludeReservationId);
    }
    return this.apiService.get<Reservation[]>(`Reservation/overlapping?${params.toString()}`);
  }

  /**
   * Get public reservations for a property (only dates and status, no client information)
   * GET api/public/properties/{propertyId}/reservations
   * @param propertyId Property ID
   * @returns Observable of public reservations
   */
  getPublicReservations(propertyId: string): Observable<PublicReservation[]> {
    return this.apiService.get<PublicReservation[]>(`public/properties/${propertyId}/reservations`);
  }
}

