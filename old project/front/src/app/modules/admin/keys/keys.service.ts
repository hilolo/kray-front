import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Key, GetKeysFilter, PaginatedResult, CreateKeyDto, UpdateKeyDto } from './keys.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class KeysService {
    private _keys: BehaviorSubject<Key[]> = new BehaviorSubject<Key[]>([]);
    private _key: BehaviorSubject<Key> = new BehaviorSubject<Key>(null);
    private _pagination: BehaviorSubject<{ currentPage: number, totalPages: number, totalItems: number }> = new BehaviorSubject({ currentPage: 1, totalPages: 1, totalItems: 0 });
    private _apiUrl = environment.apiUrl + '/api';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for keys
     */
    get keys$(): Observable<Key[]> {
        return this._keys.asObservable();
    }

    /**
     * Getter for key
     */
    get key$(): Observable<Key> {
        return this._key.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<{ currentPage: number, totalPages: number, totalItems: number }> {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get keys with filter
     */
    getKeys(filter: GetKeysFilter): Observable<PaginatedResult<Key>> {
        return this._httpClient.post<any>(`${this._apiUrl}/Key/list`, filter).pipe(
            map(response => {
                // Backend returns { status: 'Succeed', data: {...}, ... }
                if (response && response.data) {
                    const paginatedResult = response.data;
                    
                    // Update keys immediately
                    this._keys.next(paginatedResult.result || []);
                    
                    // Update pagination
                    this._pagination.next({
                        currentPage: paginatedResult.currentPage,
                        totalPages: paginatedResult.totalPages,
                        totalItems: paginatedResult.totalItems
                    });
                    
                    return paginatedResult;
                } else {
                    this._keys.next([]);
                    this._pagination.next({ currentPage: 1, totalPages: 1, totalItems: 0 });
                    return { currentPage: 1, totalPages: 1, totalItems: 0, result: [] };
                }
            }),
            catchError(error => {
                // Reset state on error
                this._keys.next([]);
                this._pagination.next({ currentPage: 1, totalPages: 1, totalItems: 0 });
                throw error;
            })
        );
    }

    /**
     * Get key by id
     */
    getKeyById(id: string): Observable<Key> {
        return this._httpClient.get<any>(`${this._apiUrl}/Key/${id}`).pipe(
            map(response => {
                if (response && response.data) {
                    this._key.next(response.data);
                    return response.data;
                }
                return null;
            })
        );
    }

    /**
     * Create key
     */
    createKey(key: CreateKeyDto): Observable<Key> {
        return this._httpClient.post<any>(`${this._apiUrl}/Key/create`, key).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                return null;
            })
        );
    }

    /**
     * Update key
     */
    updateKey(id: string, key: UpdateKeyDto): Observable<Key> {
        return this._httpClient.put<any>(`${this._apiUrl}/Key/${id}`, key).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                return null;
            })
        );
    }

    /**
     * Delete key
     */
    deleteKey(id: string): Observable<boolean> {
        return this._httpClient.delete<any>(`${this._apiUrl}/Key/${id}`).pipe(
            map(() => true),
            catchError(() => {
                return [false];
            })
        );
    }

    /**
     * Reset key state
     */
    resetKey(): void {
        this._key.next(null);
    }
}

