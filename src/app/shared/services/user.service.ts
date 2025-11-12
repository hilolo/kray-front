import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';
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

  // User information signals
  readonly user = computed(() => this.authService.currentUser());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  
  // Computed user properties for easy access
  readonly userName = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return 'User';
    // Extract name from email (part before @) or use email as display name
    return currentUser.email?.split('@')[0] || 'User';
  });

  readonly userEmail = computed(() => {
    const currentUser = this.user();
    return currentUser?.email || '';
  });

  readonly userAvatar = computed(() => {
    const currentUser = this.user();
    // If your user model has an avatar field, return it here
    // For now, returning null
    return null;
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
}

