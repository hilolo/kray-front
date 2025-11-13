import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Bank, GetBanksFilter, PaginatedResult, CreateBankDto, UpdateBankDto } from './banks.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BanksService {
    private _banks: BehaviorSubject<Bank[]> = new BehaviorSubject<Bank[]>([]);
    private _bank: BehaviorSubject<Bank> = new BehaviorSubject<Bank>(null);
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
     * Getter for banks
     */
    get banks$(): Observable<Bank[]> {
        return this._banks.asObservable();
    }

    /**
     * Getter for bank
     */
    get bank$(): Observable<Bank> {
        return this._bank.asObservable();
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
     * Get banks with filter
     */
    getBanks(filter: GetBanksFilter): Observable<PaginatedResult<Bank>> {
        return this._httpClient.post<any>(`${this._apiUrl}/Bank/list`, filter).pipe(
            map(response => {
                // Backend returns { status: 'Succeed', data: {...}, ... }
                if (response && response.data) {
                    const paginatedResult = response.data;
                    
                    // Update banks immediately
                    this._banks.next(paginatedResult.result || []);
                    
                    // Update pagination
                    this._pagination.next({
                        currentPage: paginatedResult.currentPage,
                        totalPages: paginatedResult.totalPages,
                        totalItems: paginatedResult.totalItems
                    });
                    
                    return paginatedResult;
                } else {
                    this._banks.next([]);
                    this._pagination.next({ currentPage: 1, totalPages: 1, totalItems: 0 });
                    return { currentPage: 1, totalPages: 1, totalItems: 0, result: [] };
                }
            }),
            catchError(error => {
                // Reset state on error
                this._banks.next([]);
                this._pagination.next({ currentPage: 1, totalPages: 1, totalItems: 0 });
                throw error;
            })
        );
    }

    /**
     * Get bank by id
     */
    getBankById(id: string): Observable<Bank> {
        return this._httpClient.get<any>(`${this._apiUrl}/Bank/${id}`).pipe(
            map(response => {
                if (response && response.data) {
                    this._bank.next(response.data);
                    return response.data;
                }
                return null;
            })
        );
    }

    /**
     * Create bank
     */
    createBank(bank: CreateBankDto): Observable<Bank> {
        return this._httpClient.post<any>(`${this._apiUrl}/Bank/create`, bank).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                return null;
            })
        );
    }

    /**
     * Update bank
     */
    updateBank(id: string, bank: UpdateBankDto): Observable<Bank> {
        return this._httpClient.put<any>(`${this._apiUrl}/Bank/${id}`, bank).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                return null;
            })
        );
    }

    /**
     * Delete bank
     */
    deleteBank(id: string): Observable<boolean> {
        return this._httpClient.delete<any>(`${this._apiUrl}/Bank/${id}`).pipe(
            map(() => true),
            catchError(() => {
                return [false];
            })
        );
    }

    /**
     * Reset bank state
     */
    resetBank(): void {
        this._bank.next(null);
    }
}

