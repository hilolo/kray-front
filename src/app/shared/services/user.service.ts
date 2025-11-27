import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import type { User } from '../models/user/user.model';
import type { TeamMember } from '../models/user/team-member.model';
import type { UserPermissions } from '../models/user/user-permissions.model';

/**
 * User service
 * Manages user information and provides user-related data
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);

  // User information signals
  readonly user = computed(() => this.authService.currentUser());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  
  // Computed user properties for easy access
  readonly userName = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return 'User';
    // Use name if available, otherwise extract from email
    return currentUser.name || currentUser.email?.split('@')[0] || 'User';
  });

  readonly userEmail = computed(() => {
    const currentUser = this.user();
    return currentUser?.email || '';
  });

  readonly userAvatar = computed(() => {
    const currentUser = this.user();
    return currentUser?.avatar || null;
  });

  readonly userRole = computed(() => {
    const currentUser = this.user();
    return currentUser?.role || '';
  });

  readonly company = computed(() => {
    const currentUser = this.user();
    return currentUser?.company || null;
  });

  readonly companyName = computed(() => {
    const company = this.company();
    return company?.name || '';
  });

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.user();
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Update user information
   * PUT https://localhost:5001/api/user/me
   */
  updateUser(userData: { name?: string; phone?: string; avatar?: string }): Observable<User> {
    return this.apiService.put<User>('user/me', userData).pipe(
      tap((updatedUser) => {
        // Update user in AuthService which will sync with localStorage
        this.authService.setUser(updatedUser);
      })
    );
  }

  /**
   * Update user password
   * PATCH https://localhost:5001/api/user/updatePassword
   */
  updatePassword(passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.apiService.patch('user/updatePassword', passwordData);
  }

  /**
   * Get team members
   * GET api/user/team
   */
  getTeamMembers(): Observable<TeamMember[]> {
    return this.apiService.get<TeamMember[]>('user/team');
  }

  /**
   * Get user permissions
   * GET api/userpermissions/{userId}
   */
  getUserPermissions(userId: string): Observable<UserPermissions> {
    return this.apiService.get<UserPermissions>(`userpermissions/${userId}`);
  }

  /**
   * Update user permissions
   * PUT api/userpermissions/{userId}
   */
  updateUserPermissions(userId: string, permissions: UserPermissions['permissions']): Observable<UserPermissions> {
    // Transform permissions to match API format (capitalize keys)
    const transformedPermissions: Record<string, { View: boolean; Edit: boolean; Delete: boolean }> = {};
    
    Object.keys(permissions).forEach((key) => {
      const modulePerms = permissions[key as keyof typeof permissions];
      if (modulePerms) {
        transformedPermissions[key] = {
          View: modulePerms.view,
          Edit: modulePerms.edit,
          Delete: modulePerms.delete,
        };
      }
    });

    return this.apiService.put<UserPermissions>(`userpermissions/${userId}`, {
      Permissions: transformedPermissions,
    });
  }

  /**
   * Invite team member
   * POST api/user/invite
   */
  inviteTeamMember(inviteData: { email: string; role: string }): Observable<TeamMember> {
    return this.apiService.post<TeamMember>('user/invite', inviteData);
  }

  /**
   * Delete user
   * DELETE api/user/{id}
   */
  deleteUser(userId: string): Observable<any> {
    return this.apiService.delete(`user/${userId}`);
  }

}

