import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import {
    CreateMaintenanceDto,
    GetMaintenancesFilter,
    Maintenance,
    MaintenanceStatus,
    PaginatedResult,
    UpdateMaintenanceDto
} from './maintenance.types';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
    private _httpClient = inject(HttpClient);
    private _maintenance: BehaviorSubject<Maintenance | null> = new BehaviorSubject<Maintenance | null>(null);
    private _maintenances: BehaviorSubject<Maintenance[] | null> = new BehaviorSubject<Maintenance[] | null>(null);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for maintenance
     */
    get maintenance$(): Observable<Maintenance | null> {
        return this._maintenance.asObservable();
    }

    /**
     * Getter for maintenances
     */
    get maintenances$(): Observable<Maintenance[] | null> {
        return this._maintenances.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get maintenances with pagination and filters
     */
    getMaintenances(filter: GetMaintenancesFilter): Observable<PaginatedResult<Maintenance>> {
        return this._httpClient.post<any>(`${environment.apiUrl}/api/maintenance/list`, filter).pipe(
            tap((response) => {
                this._maintenances.next(response.data.result);
            }),
            map((response) => response.data)
        );
    }

    /**
     * Get maintenance by id
     */
    getMaintenanceById(id: string): Observable<Maintenance> {
        return this._httpClient.get<any>(`${environment.apiUrl}/api/maintenance/${id}`).pipe(
            tap((response) => {
                this._maintenance.next(response.data || response);
            }),
            map((response) => response.data || response)
        );
    }

    /**
     * Create maintenance
     */
    createMaintenance(maintenance: CreateMaintenanceDto): Observable<Maintenance> {
        return this.maintenances$.pipe(
            take(1),
            switchMap((maintenances) =>
                this._httpClient.post<any>(`${environment.apiUrl}/api/maintenance/create`, maintenance).pipe(
                    map((response) => {
                        const newMaintenance = response.data || response;

                        // Update maintenances with the new maintenance
                        if (maintenances) {
                            this._maintenances.next([newMaintenance, ...maintenances]);
                        }

                        return newMaintenance;
                    })
                )
            )
        );
    }

    /**
     * Update maintenance
     */
    updateMaintenance(id: string, maintenance: UpdateMaintenanceDto): Observable<Maintenance> {
        return this.maintenances$.pipe(
            take(1),
            switchMap((maintenances) =>
                this._httpClient.put<any>(`${environment.apiUrl}/api/maintenance/${id}`, maintenance).pipe(
                    map((response) => {
                        const updatedMaintenance = response.data || response;

                        // Update maintenances with the updated maintenance
                        if (maintenances) {
                            const index = maintenances.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                maintenances[index] = updatedMaintenance;
                                this._maintenances.next([...maintenances]);
                            }
                        }

                        return updatedMaintenance;
                    })
                )
            )
        );
    }

    /**
     * Delete maintenance
     */
    deleteMaintenance(id: string): Observable<boolean> {
        return this.maintenances$.pipe(
            take(1),
            switchMap((maintenances) =>
                this._httpClient.delete<any>(`${environment.apiUrl}/api/maintenance/${id}`).pipe(
                    map((response) => {
                        // Update maintenances by removing the deleted one
                        if (maintenances) {
                            const index = maintenances.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                maintenances.splice(index, 1);
                                this._maintenances.next([...maintenances]);
                            }
                        }

                        return response.isSuccess !== undefined ? response.isSuccess : true;
                    })
                )
            )
        );
    }

    /**
     * Update maintenance status
     */
    updateMaintenanceStatus(id: string, status: MaintenanceStatus): Observable<boolean> {
        return this.maintenances$.pipe(
            take(1),
            switchMap((maintenances) =>
                this._httpClient.post<any>(`${environment.apiUrl}/api/maintenance/${id}/status`, status).pipe(
                    map((response) => {
                        // Update the maintenance status in the local list
                        if (maintenances) {
                            const index = maintenances.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                maintenances[index].status = status;
                                this._maintenances.next([...maintenances]);
                            }
                        }

                        return response.isSuccess !== undefined ? response.isSuccess : true;
                    })
                )
            )
        );
    }
}

