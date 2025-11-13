import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import type { User } from '../models/user.model';

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
    return this.apiService.put<User>('api/user/me', userData).pipe(
      tap((updatedUser) => {
        // Update user in AuthService which will sync with localStorage
        this.authService.setUser(updatedUser);
      })
    );
  }
}

