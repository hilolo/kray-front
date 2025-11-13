import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import {
    CreateReservationDto,
    GetReservationsFilter,
    Reservation,
    PaginatedResult,
    UpdateReservationDto,
    ReservationStatus
} from './reservation.types';

@Injectable({ providedIn: 'root' })
export class ReservationService {
    private _httpClient = inject(HttpClient);
    private _reservation: BehaviorSubject<Reservation | null> = new BehaviorSubject<Reservation | null>(null);
    private _reservations: BehaviorSubject<Reservation[] | null> = new BehaviorSubject<Reservation[] | null>(null);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for reservation
     */
    get reservation$(): Observable<Reservation | null> {
        return this._reservation.asObservable();
    }

    /**
     * Getter for reservations
     */
    get reservations$(): Observable<Reservation[] | null> {
        return this._reservations.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get reservations with pagination and filters
     */
    getReservations(filter: GetReservationsFilter): Observable<PaginatedResult<Reservation>> {
        return this._httpClient.post<any>(`${environment.apiUrl}/api/reservation/list`, filter).pipe(
            tap((response) => {
                this._reservations.next(response.data.result);
            }),
            map((response) => response.data)
        );
    }

    /**
     * Get reservation by id
     */
    getReservationById(id: string): Observable<Reservation> {
        return this._httpClient.get<any>(`${environment.apiUrl}/api/reservation/${id}`).pipe(
            tap((response) => {
                this._reservation.next(response.data || response);
            }),
            map((response) => response.data || response)
        );
    }

    /**
     * Create reservation
     */
    createReservation(reservation: CreateReservationDto): Observable<Reservation> {
        return this.reservations$.pipe(
            take(1),
            switchMap((reservations) =>
                this._httpClient.post<any>(`${environment.apiUrl}/api/reservation/create`, reservation).pipe(
                    map((response) => {
                        const newReservation = response.data || response;

                        // Update reservations with the new reservation
                        if (reservations) {
                            this._reservations.next([newReservation, ...reservations]);
                        }

                        return newReservation;
                    })
                )
            )
        );
    }

    /**
     * Update reservation
     */
    updateReservation(id: string, reservation: UpdateReservationDto): Observable<Reservation> {
        return this.reservations$.pipe(
            take(1),
            switchMap((reservations) =>
                this._httpClient.put<any>(`${environment.apiUrl}/api/reservation/${id}`, reservation).pipe(
                    map((response) => {
                        const updatedReservation = response.data || response;

                        // Update reservations with the updated reservation
                        if (reservations) {
                            const index = reservations.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                reservations[index] = updatedReservation;
                                this._reservations.next(reservations);
                            }
                        }

                        // Update the reservation if it's the current one
                        if (this._reservation.value && this._reservation.value.id === id) {
                            this._reservation.next(updatedReservation);
                        }

                        return updatedReservation;
                    })
                )
            )
        );
    }

    /**
     * Delete reservation
     */
    deleteReservation(id: string): Observable<boolean> {
        return this.reservations$.pipe(
            take(1),
            switchMap((reservations) =>
                this._httpClient.delete<any>(`${environment.apiUrl}/api/reservation/${id}`).pipe(
                    map((response) => {
                        // Remove reservation from the list
                        if (reservations) {
                            const index = reservations.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                reservations.splice(index, 1);
                                this._reservations.next(reservations);
                            }
                        }

                        // Clear the reservation if it's the current one
                        if (this._reservation.value && this._reservation.value.id === id) {
                            this._reservation.next(null);
                        }

                        return true;
                    })
                )
            )
        );
    }

    /**
     * Archive reservation
     */
    archiveReservation(id: string): Observable<boolean> {
        return this._httpClient.post<any>(`${environment.apiUrl}/api/reservation/${id}/archive?archive=true`, {}).pipe(
            map((response) => {
                return response.isSuccess || response.success;
            })
        );
    }

    /**
     * Activate (unarchive) reservation
     */
    activateReservation(id: string): Observable<boolean> {
        return this._httpClient.post<any>(`${environment.apiUrl}/api/reservation/${id}/archive?archive=false`, {}).pipe(
            map((response) => {
                return response.isSuccess || response.success;
            })
        );
    }

    /**
     * Toggle archive status
     */
    toggleArchive(id: string, archive: boolean): Observable<boolean> {
        return archive ? this.archiveReservation(id) : this.activateReservation(id);
    }

    /**
     * Update reservation status
     */
    updateReservationStatus(id: string, status: ReservationStatus): Observable<boolean> {
        return this.reservations$.pipe(
            take(1),
            switchMap((reservations) =>
                this._httpClient.post<any>(`${environment.apiUrl}/api/reservation/${id}/status`, status).pipe(
                    map((response) => {
                        // Update the reservation status in the local list
                        if (reservations) {
                            const index = reservations.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                reservations[index].status = status;
                                this._reservations.next([...reservations]);
                            }
                        }

                        return response.isSuccess !== undefined ? response.isSuccess : true;
                    })
                )
            )
        );
    }

    /**
     * Check for overlapping reservations
     */
    checkOverlappingReservations(propertyId: string, startDate: string, endDate: string, excludeReservationId?: string): Observable<Reservation[]> {
        const params: any = {
            propertyId: propertyId,
            startDate: startDate,
            endDate: endDate
        };
        
        if (excludeReservationId) {
            params.excludeReservationId = excludeReservationId;
        }

        return this._httpClient.get<any>(`${environment.apiUrl}/api/reservation/overlapping`, { params }).pipe(
            map((response) => response.data || response || [])
        );
    }
}
