import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { environment } from 'environments/environment';
import { Observable, ReplaySubject, tap, of } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);
    private _cachedNavigation: Navigation | null = null;
    private _lastFetchTime: number | null = null;
    private _cacheExpiryDuration: number = 60 * 60 * 1000; // 1 hour in milliseconds
    private _currentLanguage: string = 'en';

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data with caching (1 hour expiry)
     */
    get(language: string = 'en'): Observable<Navigation>
    {
        const currentTime = Date.now();
        const isCacheValid = this._cachedNavigation && 
                            this._lastFetchTime && 
                            (currentTime - this._lastFetchTime) < this._cacheExpiryDuration &&
                            this._currentLanguage === language;

        // If cache is valid, return cached data
        if (isCacheValid) {
            this._navigation.next(this._cachedNavigation);
            return of(this._cachedNavigation);
        }

        // Otherwise, fetch from API
        return this._httpClient.get<any>(`${environment.apiUrl}/api/common/navigation`).pipe(
            tap((response) =>
            {
                // Extract the data array from the API response
                // The API returns a Result wrapper with data property
                const navigationData = response.data || [];
                
                // Apply language-based translation
                const translatedData = this._applyTranslations(navigationData, language);
                
                // Transform the API response to match the expected Navigation interface
                const navigation: Navigation = {
                    compact: translatedData,
                    default: translatedData,
                    futuristic: translatedData,
                    horizontal: translatedData
                };
                
                // Update cache
                this._cachedNavigation = navigation;
                this._lastFetchTime = currentTime;
                this._currentLanguage = language;
                
                this._navigation.next(navigation);
            }),
        );
    }

    /**
     * Clear the navigation cache (useful when user logs out or needs fresh data)
     */
    clearCache(): void
    {
        this._cachedNavigation = null;
        this._lastFetchTime = null;
    }

    /**
     * Apply translations based on language
     */
    private _applyTranslations(items: any[], language: string): any[]
    {
        return items.map(item => {
            const translatedItem = { ...item };
            
            // Set the title based on language
            switch (language.toLowerCase()) {
                case 'fr':
                    translatedItem.title = item.titleFr || item.title;
                    break;
                case 'en':
                default:
                    translatedItem.title = item.titleEn || item.title;
                    break;
            }

            // Recursively apply translations to children
            if (item.children && item.children.length > 0) {
                translatedItem.children = this._applyTranslations(item.children, language);
            }

            return translatedItem;
        });
    }
}
