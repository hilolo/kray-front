import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

/**
 * Service to manage token refresh state
 * Prevents multiple simultaneous refresh attempts
 */
@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  /**
   * Check if token refresh is in progress
   */
  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Set refresh state
   */
  setRefreshing(value: boolean): void {
    this.isRefreshing = value;
    if (!value) {
      this.refreshTokenSubject.next(null);
    }
  }

  /**
   * Set the new token after successful refresh
   */
  setToken(token: string): void {
    this.refreshTokenSubject.next(token);
    this.isRefreshing = false;
  }

  /**
   * Get observable that emits when token is refreshed
   */
  getToken(): Observable<string> {
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1)
    ) as Observable<string>;
  }

  /**
   * Reset refresh state (on error)
   */
  reset(): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);
  }
}

