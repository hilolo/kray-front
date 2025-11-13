import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import type { LoginResponseData } from '../models/api-response.model';
import type { User } from '../models/user.model';

/**
 * Authentication service
 * Handles login, logout, and user session management
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // User state signals
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly token = signal<string | null>(null);

  constructor() {
    // Load user and token from localStorage on service initialization
    this.loadUserFromStorage();
  }

  /**
   * Login with email and password
   * POST https://localhost:5001/api/user/sign-in
   */
  login(email: string, password: string): Observable<LoginResponseData> {
    return this.apiService.post<LoginResponseData>('api/user/sign-in', {
      email,
      password,
    }).pipe(
      tap((response) => {
        // Store user and token
        this.setUser(response.user);
        this.setToken(response.jwt.token);
        
        // Save to localStorage
        this.saveUserToStorage(response.user);
        this.saveTokenToStorage(response.jwt.token);
        
        // Update authentication state
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Sign in with token (refresh user data after login)
   * POST https://localhost:5001/api/user/sign-in-with-token
   */
  signInWithToken(): Observable<LoginResponseData> {
    return this.apiService.post<LoginResponseData>('api/user/sign-in-with-token', {}).pipe(
      tap((response) => {
        // Update user and token with fresh data
        this.setUser(response.user);
        this.setToken(response.jwt.token);
        
        // Save to localStorage
        this.saveUserToStorage(response.user);
        this.saveTokenToStorage(response.jwt.token);
        
        // Update authentication state
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    console.log('AuthService: logout() called');
    console.log('AuthService: Current user before logout:', this.currentUser());
    console.log('AuthService: Is authenticated before logout:', this.isAuthenticated());
    
    // Clear user and token
    this.currentUser.set(null);
    this.token.set(null);
    this.isAuthenticated.set(false);
    console.log('AuthService: Cleared user and token signals');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('AuthService: Cleared localStorage');
    
    // Navigate to login
    console.log('AuthService: Navigating to login page...');
    this.router.navigate(['/login']).then(
      (success) => {
        console.log('AuthService: Navigation successful:', success);
      },
      (error) => {
        console.error('AuthService: Navigation error:', error);
      }
    );
  }

  /**
   * Set current user
   */
  setUser(user: User): void {
    // Preserve company information if not present in the updated user
    const currentUser = this.currentUser();
    if (currentUser && currentUser.company && !user.company) {
      // Merge company data from existing user if not in updated user
      user = { ...user, company: currentUser.company };
    }
    
    this.currentUser.set(user);
    // Save to localStorage to persist the update
    this.saveUserToStorage(user);
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token.set(token);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Check if user is authenticated
   */
  checkAuthentication(): boolean {
    return this.isAuthenticated() && this.token() !== null;
  }

  /**
   * Save user to localStorage
   */
  private saveUserToStorage(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Save token to localStorage
   */
  private saveTokenToStorage(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Load user from localStorage
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const tokenStr = localStorage.getItem('token');
    
    if (userStr && tokenStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUser.set(user);
        this.token.set(tokenStr);
        this.isAuthenticated.set(true);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.clearStorage();
      }
    }
  }

  /**
   * Clear all storage
   */
  private clearStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}

