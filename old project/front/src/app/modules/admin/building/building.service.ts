import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Building, GetBuildingsFilter, PaginatedResult, CreateBuildingDto, UpdateBuildingDto } from './building.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BuildingService
{
    private _buildings: BehaviorSubject<Building[]> = new BehaviorSubject<Building[]>([]);
    private _building: BehaviorSubject<Building> = new BehaviorSubject<Building>(null);
    private _pagination: BehaviorSubject<{ currentPage: number, totalPages: number, totalItems: number }> = new BehaviorSubject({ currentPage: 1, totalPages: 1, totalItems: 0 });
    private _apiUrl = environment.apiUrl + '/api';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for buildings
     */
    get buildings$(): Observable<Building[]>
    {
        return this._buildings.asObservable();
    }

    /**
     * Getter for building
     */
    get building$(): Observable<Building>
    {
        return this._building.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<{ currentPage: number, totalPages: number, totalItems: number }>
    {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get buildings with filter
     */
    getBuildings(filter: GetBuildingsFilter): Observable<PaginatedResult<Building>>
    {
        return this._httpClient.post<any>(`${this._apiUrl}/Building/list`, filter).pipe(
            map(response => {
                // Backend returns { status: 'Succeed', data: {...}, ... }
                if (response && response.data) {
                    const paginatedResult = response.data;
                    
                    // Update buildings immediately
                    this._buildings.next(paginatedResult.result || []);
                    
                    // Update pagination
                    this._pagination.next({
                        currentPage: paginatedResult.currentPage,
                        totalPages: paginatedResult.totalPages,
                        totalItems: paginatedResult.totalItems
                    });
                    
                    return paginatedResult;
                } else {
                    this._buildings.next([]);
                    this._pagination.next({ currentPage: 1, totalPages: 1, totalItems: 0 });
                    return { currentPage: 1, totalPages: 1, totalItems: 0, result: [] };
                }
            }),
            catchError(error => {
                // Reset state on error
                this._buildings.next([]);
                this._pagination.next({ currentPage: 1, totalPages: 1, totalItems: 0 });
                throw error;
            })
        );
    }

    /**
     * Get building by id
     */
    getBuildingById(id: string): Observable<Building>
    {
        return this._httpClient.get<any>(`${this._apiUrl}/Building/${id}`).pipe(
            map(response => {
                if (response && response.data) {
                    this._building.next(response.data);
                    return response.data;
                }
                return null;
            }),
            catchError(error => {
                throw error;
            })
        );
    }

    /**
     * Create building
     */
    createBuilding(building: CreateBuildingDto): Observable<any>
    {
        return this._httpClient.post<any>(`${this._apiUrl}/Building/create`, building).pipe(
            catchError(error => {
                throw error;
            })
        );
    }

    /**
     * Update building
     */
    updateBuilding(id: string, building: UpdateBuildingDto): Observable<Building>
    {
        return this._httpClient.put<any>(`${this._apiUrl}/Building/${id}`, building).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                return null;
            }),
            catchError(error => {
                throw error;
            })
        );
    }

    /**
     * Delete building
     */
    deleteBuilding(id: string): Observable<boolean>
    {
        return this._httpClient.delete<any>(`${this._apiUrl}/Building/${id}`).pipe(
            map(response => {
                return response && response.data;
            }),
            catchError(error => {
                throw error;
            })
        );
    }
}

