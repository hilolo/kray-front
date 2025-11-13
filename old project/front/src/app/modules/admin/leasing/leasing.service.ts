import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import {
    CreateLeasingDto,
    GetLeasingsFilter,
    Leasing,
    PaginatedResult,
    UpdateLeasingDto
} from './leasing.types';

@Injectable({ providedIn: 'root' })
export class LeasingService {
    private _httpClient = inject(HttpClient);
    private _leasing: BehaviorSubject<Leasing | null> = new BehaviorSubject<Leasing | null>(null);
    private _leasings: BehaviorSubject<Leasing[] | null> = new BehaviorSubject<Leasing[] | null>(null);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for leasing
     */
    get leasing$(): Observable<Leasing | null> {
        return this._leasing.asObservable();
    }

    /**
     * Getter for leasings
     */
    get leasings$(): Observable<Leasing[] | null> {
        return this._leasings.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get leasings with pagination and filters
     */
    getLeasings(filter: GetLeasingsFilter): Observable<PaginatedResult<Leasing>> {
        return this._httpClient.post<any>(`${environment.apiUrl}/api/leasing/list`, filter).pipe(
            tap((response) => {
                this._leasings.next(response.data.result);
            }),
            map((response) => response.data)
        );
    }

    /**
     * Get leasing by id
     */
    getLeasingById(id: string): Observable<Leasing> {
        return this._httpClient.get<any>(`${environment.apiUrl}/api/leasing/${id}`).pipe(
            tap((response) => {
                this._leasing.next(response.data || response);
            }),
            map((response) => response.data || response)
        );
    }

    /**
     * Create leasing
     */
    createLeasing(leasing: CreateLeasingDto): Observable<Leasing> {
        return this.leasings$.pipe(
            take(1),
            switchMap((leasings) =>
                this._httpClient.post<any>(`${environment.apiUrl}/api/leasing/create`, leasing).pipe(
                    map((response) => {
                        const newLeasing = response.data || response;

                        // Update leasings with the new leasing
                        if (leasings) {
                            this._leasings.next([newLeasing, ...leasings]);
                        }

                        return newLeasing;
                    })
                )
            )
        );
    }

    /**
     * Update leasing
     */
    updateLeasing(id: string, leasing: UpdateLeasingDto): Observable<Leasing> {
        return this.leasings$.pipe(
            take(1),
            switchMap((leasings) =>
                this._httpClient.put<any>(`${environment.apiUrl}/api/leasing/${id}`, leasing).pipe(
                    map((response) => {
                        const updatedLeasing = response.data || response;

                        // Update leasings with the updated leasing
                        if (leasings) {
                            const index = leasings.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                leasings[index] = updatedLeasing;
                                this._leasings.next(leasings);
                            }
                        }

                        // Update the leasing
                        this._leasing.next(updatedLeasing);

                        return updatedLeasing;
                    })
                )
            )
        );
    }

    /**
     * Delete leasing
     */
    deleteLeasing(id: string): Observable<boolean> {
        return this.leasings$.pipe(
            take(1),
            switchMap((leasings) =>
                this._httpClient.delete<any>(`${environment.apiUrl}/api/leasing/${id}`).pipe(
                    map((response) => {
                        // Update leasings by removing the deleted one
                        if (leasings) {
                            const index = leasings.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                leasings.splice(index, 1);
                                this._leasings.next(leasings);
                            }
                        }

                        return true;
                    })
                )
            )
        );
    }

    /**
     * Get leasings by property
     */
    getLeasingsByProperty(propertyId: string): Observable<Leasing[]> {
        return this._httpClient.get<any>(`${environment.apiUrl}/api/leasing/by-property/${propertyId}`).pipe(
            map((response) => response.data || response)
        );
    }

    /**
     * Get leasings by tenant/contact
     */
    getLeasingsByContact(contactId: string): Observable<Leasing[]> {
        return this._httpClient.get<any>(`${environment.apiUrl}/api/leasing/by-contact/${contactId}`).pipe(
            map((response) => response.data || response)
        );
    }

    /**
     * Archive leasing
     */
    archiveLeasing(id: string): Observable<boolean> {
        return this._httpClient.post<any>(`${environment.apiUrl}/api/leasing/${id}/archive?archive=true`, {}).pipe(
            map((response) => {
                return true;
            })
        );
    }

    /**
     * Activate archived leasing
     */
    activateLeasing(id: string): Observable<boolean> {
        return this._httpClient.post<any>(`${environment.apiUrl}/api/leasing/${id}/archive?archive=false`, {}).pipe(
            map((response) => {
                return true;
            })
        );
    }

    /**
     * Check for overlapping leases
     */
    checkOverlappingLeases(propertyId: string, tenancyStart: string, tenancyEnd: string, excludeLeaseId?: string): Observable<Leasing[]> {
        const params: any = {
            propertyId: propertyId,
            tenancyStart: tenancyStart,
            tenancyEnd: tenancyEnd
        };
        
        if (excludeLeaseId) {
            params.excludeLeaseId = excludeLeaseId;
        }

        return this._httpClient.get<any>(`${environment.apiUrl}/api/leasing/overlapping`, { params }).pipe(
            map((response) => response.data || response || [])
        );
    }
}

