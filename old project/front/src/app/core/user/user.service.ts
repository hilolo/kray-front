import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User, TeamMember, ApiResponse } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({providedIn: 'root'})
export class UserService
{
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<User>
    {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) =>
            {
                this._user.next(user);
            }),
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) =>
            {
                this._user.next(response);
            }),
        );
    }

    /**
     * Get team members
     */
    getTeamMembers(): Observable<ApiResponse<TeamMember[]>>
    {
        return this._httpClient.get<any>(`${environment.apiUrl}/api/user/team`)
            .pipe(
                map(response => {
                    // Handle different response structures
                    if (Array.isArray(response)) {
                        // Response is directly an array
                        return {
                            success: true,
                            data: response
                        };
                    } else if (response.status === 'Success' && response.data) {
                        // Response follows Result<T> structure
                        return {
                            success: true,
                            data: response.data
                        };
                    } else if (response.data && Array.isArray(response.data)) {
                        // Response has data property with array
                        return {
                            success: true,
                            data: response.data
                        };
                    } else {
                        return {
                            success: false,
                            data: []
                        };
                    }
                })
            );
    }

    /**
     * Get user permissions
     */
    getUserPermissions(userId: string): Observable<ApiResponse<any>>
    {
        return this._httpClient.get<any>(`${environment.apiUrl}/api/userpermissions/${userId}`)
            .pipe(
                map(response => {
                    // Handle different response structures
                    if (response.status === 'Succeed' || response.status === 'Success') {
                        return {
                            success: true,
                            data: response.data,
                            status: response.status,
                            message: response.message
                        };
                    } else if (response.success) {
                        return response;
                    } else {
                        return {
                            success: false,
                            data: null,
                            message: response.message || 'Failed to get user permissions'
                        };
                    }
                })
            );
    }

    /**
     * Update user permissions (admin only)
     */
    updateUserPermissions(userId: string, permissions: Record<string, { View: boolean; Edit: boolean; Delete: boolean }>): Observable<ApiResponse<any>>
    {
        return this._httpClient.put<any>(
            `${environment.apiUrl}/api/userpermissions/${userId}`,
            { Permissions: permissions }
        ).pipe(
            map(response => {
                // Handle different response structures
                if (response.status === 'Succeed' || response.status === 'Success') {
                    return {
                        success: true,
                        data: response.data,
                        status: response.status,
                        message: response.message
                    };
                } else if (response.success) {
                    return response;
                } else {
                    return {
                        success: false,
                        data: null,
                        message: response.message || 'Failed to update user permissions'
                    };
                }
            })
        );
    }
}
