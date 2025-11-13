import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { PermissionService } from 'app/core/auth/permission.service';
import { environment } from 'environments/environment';
import { catchError, Observable, of, switchMap, throwError, tap } from 'rxjs';
import { CompanyRestrictedDialogComponent } from 'app/shared/components/company-restricted-dialog/company-restricted-dialog.component';

@Injectable({providedIn: 'root'})
export class AuthService
{
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _permissionService = inject(PermissionService);
    private _dialog = inject(MatDialog);

    constructor() {
        // Security: Remove any legacy permissions from localStorage
        // Permissions should only exist in JWT tokens and memory
        this._cleanupLegacyStorage();
    }

    /**
     * Remove legacy permission storage from localStorage
     * This prevents users from manually tampering with permissions
     */
    private _cleanupLegacyStorage(): void {
        localStorage.removeItem('userPermissions');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     * Note: This endpoint is not implemented in the backend yet
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        // TODO: Implement forgot password endpoint in backend
        return throwError('Forgot password functionality not implemented yet');
    }

    /**
     * Reset password
     * Note: This endpoint is not implemented in the backend yet
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        // TODO: Implement reset password endpoint in backend
        return throwError('Reset password functionality not implemented yet');
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(`${environment.apiUrl}/api/user/sign-in`, credentials).pipe(
            switchMap((response: any) =>
            {
                // Store the access token in the local storage
                this.accessToken = response.data.jwt.token;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.data.user;

                // Load and store settings in localStorage
                this._loadAndStoreSettings();

                // Extract and store permissions from JWT token
                try {
                    const decodedToken = AuthUtils.decodeToken(response.data.jwt.token);
                    if (decodedToken && decodedToken.permissions) {
                        const permissions = JSON.parse(decodedToken.permissions);
                        // Convert PascalCase to camelCase
                        const normalizedPermissions = this.normalizePermissions(permissions);
                        this._permissionService.setPermissions(normalizedPermissions);
                    }
                } catch (error) {
                    console.error('Error parsing permissions from token:', error);
                }

                return of(response);
            }),
            catchError((error) => {
                // Check if the error is due to company restriction
                if (error.error?.code === 'company_restricted') {
                    // Show company restricted dialog
                    this._dialog.open(CompanyRestrictedDialogComponent, {
                        disableClose: true,
                        panelClass: 'company-restricted-dialog',
                        width: '480px'
                    });
                }
                return throwError(() => error);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // Sign in using the token
        return this._httpClient.post(`${environment.apiUrl}/api/user/sign-in-with-token`, {}).pipe(
            switchMap((response: any) =>
            {
                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if ( response.data.jwt.token )
                {
                    this.accessToken = response.data.jwt.token;
                    
                    // Extract and store permissions from JWT token
                    try {
                        const decodedToken = AuthUtils.decodeToken(response.data.jwt.token);
                        if (decodedToken && decodedToken.permissions) {
                            const permissions = JSON.parse(decodedToken.permissions);
                            // Convert PascalCase to camelCase
                            const normalizedPermissions = this.normalizePermissions(permissions);
                            this._permissionService.setPermissions(normalizedPermissions);
                        }
                    } catch (error) {
                        console.error('Error parsing permissions from token:', error);
                    }
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.data.user;

                // Return true
                return of(true);
            }),
            catchError((error) =>
            {
                // Check if the error is due to company restriction
                if (error.error?.code === 'company_restricted') {
                    // Show company restricted dialog
                    this._dialog.open(CompanyRestrictedDialogComponent, {
                        disableClose: true,
                        panelClass: 'company-restricted-dialog',
                        width: '480px'
                    });
                }

                // Return false
                return of(false);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Clear permissions
        this._permissionService.clearPermissions();

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     * Note: This endpoint is not implemented in the backend yet
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        // TODO: Implement sign up endpoint in backend
        return throwError('Sign up functionality not implemented yet');
    }

    /**
     * Unlock session
     * Note: This endpoint is not implemented in the backend yet
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        // TODO: Implement unlock session endpoint in backend
        return throwError('Unlock session functionality not implemented yet');
    }

    /**
     * Get current user information
     */
    getCurrentUser(): Observable<any>
    {
        return this._httpClient.get(`${environment.apiUrl}/api/user/me`);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    /**
     * Load and store application settings in localStorage
     */
    private _loadAndStoreSettings(): void
    {
        this._httpClient.get<any>(`${environment.apiUrl}/api/settings`).subscribe({
            next: (response) => {
                // Remove id and companyId before storing
                const { id, companyId, ...settingsToStore } = response;
                localStorage.setItem('applicationSettings', JSON.stringify(settingsToStore));
            },
            error: (error) => {
                console.error('Error loading settings:', error);
            }
        });
    }

    /**
     * Get settings from localStorage
     */
    getSettings(): any
    {
        const settingsJson = localStorage.getItem('applicationSettings');
        return settingsJson ? JSON.parse(settingsJson) : null;
    }

    /**
     * Update settings in localStorage
     */
    updateSettings(settings: any): void
    {
        // Remove id and companyId before storing
        const { id, companyId, ...settingsToStore } = settings;
        localStorage.setItem('applicationSettings', JSON.stringify(settingsToStore));
    }

    /**
     * Refresh JWT token to get updated permissions
     */
    refreshToken(): Observable<any>
    {
        return this._httpClient.post(`${environment.apiUrl}/api/user/sign-in-with-token`, {}).pipe(
            tap((response: any) =>
            {
                if (response.data.jwt.token) {
                    // Update the access token
                    this.accessToken = response.data.jwt.token;
                    
                    // Extract and update permissions from new JWT token
                    try {
                        const decodedToken = AuthUtils.decodeToken(response.data.jwt.token);
                        if (decodedToken && decodedToken.permissions) {
                            const permissions = JSON.parse(decodedToken.permissions);
                            // Convert PascalCase to camelCase
                            const normalizedPermissions = this.normalizePermissions(permissions);
                            this._permissionService.setPermissions(normalizedPermissions);
                        }
                    } catch (error) {
                        console.error('Error parsing permissions from token:', error);
                    }

                    // Update user data if available
                    if (response.data.user) {
                        this._userService.user = response.data.user;
                    }
                }
            })
        );
    }

    /**
     * Normalize permissions from PascalCase to camelCase
     * Converts backend format {Edit: boolean, View: boolean, Delete: boolean}
     * to frontend format {edit: boolean, view: boolean, delete: boolean}
     */
    private normalizePermissions(permissions: any): Record<string, { view: boolean; edit: boolean; delete: boolean }> {
        const normalized: Record<string, { view: boolean; edit: boolean; delete: boolean }> = {};
        
        for (const [module, perms] of Object.entries(permissions)) {
            const modulePerms = perms as any;
            normalized[module] = {
                view: modulePerms.View ?? modulePerms.view ?? false,
                edit: modulePerms.Edit ?? modulePerms.edit ?? false,
                delete: modulePerms.Delete ?? modulePerms.delete ?? false
            };
        }
        
        return normalized;
    }
}
