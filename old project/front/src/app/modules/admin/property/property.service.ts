import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { Property, GetPropertiesFilter, PaginatedResult, CreatePropertyDto, PropertyDto, UpdatePropertyDto, UpdatePropertyVisibilityDto, PublicProperty } from './property.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PropertyService
{
    private _properties: BehaviorSubject<Property[]> = new BehaviorSubject<Property[]>([]);
    private _property: BehaviorSubject<Property> = new BehaviorSubject<Property>(null);
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
     * Getter for properties
     */
    get properties$(): Observable<Property[]>
    {
        return this._properties.asObservable();
    }

    /**
     * Getter for property
     */
    get property$(): Observable<Property>
    {
        return this._property.asObservable();
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
     * Get properties with filter
     */
    getProperties(filter: GetPropertiesFilter): Observable<PaginatedResult<Property>>
    {
        return this._httpClient.post<any>(`${this._apiUrl}/Property/list`, filter).pipe(
            map(response => {
                // Backend returns { status: 'Succeed', data: {...}, ... }
                if (response && response.data) {
                    const paginatedResult = response.data;
                    
                    // Update properties immediately
                    this._properties.next(paginatedResult.result || []);
                    
                    // Update pagination
                    this._pagination.next({
                        currentPage: paginatedResult.currentPage,
                        totalPages: paginatedResult.totalPages,
                        totalItems: paginatedResult.totalItems
                    });
                    
                    return paginatedResult;
                } else {
                    this._properties.next([]);
                    this._pagination.next({ currentPage: 1, totalPages: 1, totalItems: 0 });
                    return { currentPage: 1, totalPages: 1, totalItems: 0, result: [] };
                }
            }),
            catchError(error => {
                // Reset state on error
                this._properties.next([]);
                this._pagination.next({ currentPage: 1, totalPages: 1, totalItems: 0 });
                throw error;
            })
        );
    }

    /**
     * Get property by id
     * @param id Property ID
     * @param includeRelated If true, includes related entities (Leases, Maintenances, Keys, Contact). Default is false for edit mode, true for detail mode.
     */
    getPropertyById(id: string, includeRelated: boolean = false): Observable<Property>
    {
        const params = includeRelated ? { includeRelated: 'true' } : {};
        return this._httpClient.get<any>(`${this._apiUrl}/Property/${id}`, { params }).pipe(
            map(response => {
                if (response && response.data) {
                    this._property.next(response.data);
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
     * Create property
     */
    createProperty(property: CreatePropertyDto): Observable<any>
    {
        return this._httpClient.post<any>(`${this._apiUrl}/Property/create`, property).pipe(
            catchError(error => {
                throw error;
            })
        );
    }

    /**
     * Update property
     */
    updateProperty(id: string, property: UpdatePropertyDto): Observable<Property>
    {
        return this._httpClient.put<any>(`${this._apiUrl}/Property/${id}`, property).pipe(
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
     * Delete property
     */
    deleteProperty(id: string): Observable<boolean>
    {
        return this._httpClient.delete<any>(`${this._apiUrl}/Property/${id}`).pipe(
            map(response => {
                // Backend returns { status: 'Succeed', ... } for successful operations
                // If we get a 200 OK response, the delete was successful
                // The Base controller returns error status codes (400, 404, 500) for failures
                // So if we reach here, the operation succeeded
                if (response && response.status) {
                    // Check status field if available
                    return response.status === 'Succeed' || response.status === 'Success';
                }
                // If response exists but no status field, HTTP 200 OK means success
                return true;
            }),
            catchError(error => {
                throw error;
            })
        );
    }

    /**
     * Update the building assignment for a property (lightweight operation - doesn't affect images)
     * Pass buildingId to attach, or null to detach
     */
    updatePropertyBuilding(propertyId: string, buildingId: string | null): Observable<Property>
    {
        return this._httpClient.patch<any>(`${this._apiUrl}/Property/update-building`, {
            propertyId: propertyId,
            buildingId: buildingId
        }).pipe(
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
     * Update property visibility flags
     */
    updatePropertyVisibility(payload: UpdatePropertyVisibilityDto): Observable<Property>
    {
        return this._httpClient.patch<any>(`${this._apiUrl}/Property/visibility`, payload).pipe(
            map(response => {
                if (response && response.data)
                {
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
     * Get public property details (no authentication required)
     */
    getPublicPropertyById(id: string): Observable<PublicProperty>
    {
        return this._httpClient.get<any>(`${this._apiUrl}/public/properties/${id}`).pipe(
            map(response => {
                if (response && response.data)
                {
                    return response.data as PublicProperty;
                }
                return null;
            }),
            catchError(error => {
                throw error;
            })
        );
    }
}


