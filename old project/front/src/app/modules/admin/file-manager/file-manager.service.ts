import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item, Items } from 'app/modules/admin/file-manager/file-manager.types';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError, catchError } from 'rxjs';
import { environment } from 'environments/environment';

// API Result interface to match backend ActionResult<T> format
export interface ApiResult<T> {
    data: T;
    status: string;
    code: string;
    message?: string;
}

@Injectable({providedIn: 'root'})
export class FileManagerService
{
    // Private
    private _item: BehaviorSubject<Item | null> = new BehaviorSubject(null);
    private _items: BehaviorSubject<Items | null> = new BehaviorSubject(null);
    private _storageUsage: BehaviorSubject<StorageUsage | null> = new BehaviorSubject(null);
    private _storageUsageCache: { data: StorageUsage; timestamp: number } | null = null;
    private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
    private apiUrl = `${environment.apiUrl}/api/Attachment/file-manager`;

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
     * Getter for items
     */
    get items$(): Observable<Items>
    {
        return this._items.asObservable();
    }

    /**
     * Getter for item
     */
    get item$(): Observable<Item>
    {
        return this._item.asObservable();
    }

    /**
     * Getter for storage usage
     */
    get storageUsage$(): Observable<StorageUsage>
    {
        return this._storageUsage.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get items
     */
    getItems(root: string | null = null, searchTerm: string | null = null): Observable<Items>
    {
        const params: any = {};
        if (root) {
            params.root = root;
        }
        if (searchTerm) {
            params.searchTerm = searchTerm;
        }
        return this._httpClient.get<ApiResult<Items>>(this.apiUrl, {params}).pipe(
            map((response: ApiResult<Items>) => response.data),
            tap((response: Items) =>
            {
                // Only update items if not searching (to keep the original list intact)
                if (!searchTerm) {
                    this._items.next(response);
                }
            }),
        );
    }

    /**
     * Get item by id
     */
    getItemById(id: string): Observable<Item>
    {
        return this._items.pipe(
            take(1),
            map((items) =>
            {
                // Find within the folders and files
                const item = [...items.folders, ...items.files].find(value => value.id === id) || null;

                // Update the item
                this._item.next(item);

                // Return the item
                return item;
            }),
            switchMap((item) =>
            {
                if ( !item )
                {
                    return throwError('Could not found the item with id of ' + id + '!');
                }

                return of(item);
            }),
        );
    }

    /**
     * Clear the selected item
     */
    clearItem(): void
    {
        this._item.next(null);
    }

    /**
     * Upload files
     */
    uploadFiles(files: FileUploadFile[], root: string): Observable<any>
    {
        const uploadData = {
            files: files.map(f => ({
                fileName: f.fileName,
                base64Content: f.base64Content
            })),
            root: root || '/'
        };

        return this._httpClient.post<ApiResult<any>>(`${environment.apiUrl}/api/Attachment/upload`, uploadData).pipe(
            map((response: ApiResult<any>) => response.data)
        );
    }

    /**
     * Delete a file by ID
     */
    deleteFile(id: string): Observable<any>
    {
        return this._httpClient.delete<ApiResult<any>>(`${environment.apiUrl}/api/Attachment/${id}`).pipe(
            map((response: ApiResult<any>) => response.data)
        );
    }

    /**
     * Delete multiple files by IDs (files only, not folders)
     */
    bulkDeleteFiles(fileIds: string[]): Observable<any>
    {
        const request = {
            fileIds: fileIds
        };

        return this._httpClient.post<ApiResult<any>>(`${environment.apiUrl}/api/Attachment/bulk-delete`, request).pipe(
            map((response: ApiResult<any>) => response.data)
        );
    }

    /**
     * Get storage usage information with caching
     */
    getStorageUsage(): Observable<StorageUsage>
    {
        // Check if we have cached data that's still valid
        if (this._storageUsageCache && this.isCacheValid()) {
            this._storageUsage.next(this._storageUsageCache.data);
            return of(this._storageUsageCache.data);
        }

        // Fetch from API and cache the result
        return this._httpClient.get<ApiResult<StorageUsage>>(`${environment.apiUrl}/api/Attachment/storage-usage`).pipe(
            map((response: ApiResult<StorageUsage>) => response.data),
            tap((storageUsage: StorageUsage) => {
                // Cache the result
                this._storageUsageCache = {
                    data: storageUsage,
                    timestamp: Date.now()
                };
                this._storageUsage.next(storageUsage);
            }),
            catchError((error) => {
                console.error('Error fetching storage usage:', error);
                // Return cached data if available, even if expired
                if (this._storageUsageCache) {
                    this._storageUsage.next(this._storageUsageCache.data);
                    return of(this._storageUsageCache.data);
                }
                // Return default values if no cache available
                const defaultStorage: StorageUsage = {
                    usedBytes: 0,
                    limitBytes: 1073741824, // 1GB
                    usedPercentage: 0
                };
                this._storageUsage.next(defaultStorage);
                return of(defaultStorage);
            })
        );
    }

    /**
     * Check if cached data is still valid
     */
    private isCacheValid(): boolean
    {
        if (!this._storageUsageCache) {
            return false;
        }
        return (Date.now() - this._storageUsageCache.timestamp) < this.CACHE_DURATION;
    }

    /**
     * Clear storage usage cache (useful after file operations)
     */
    clearStorageUsageCache(): void
    {
        this._storageUsageCache = null;
    }
}

export interface FileUploadFile {
    fileName: string;
    base64Content: string;
}

export interface StorageUsage {
    usedBytes: number;
    limitBytes: number;
    usedPercentage: number;
}

