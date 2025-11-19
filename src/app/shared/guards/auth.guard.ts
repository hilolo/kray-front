import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

/**
 * Authentication guard
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 * Redirects to locked page if company is restricted
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.checkAuthentication()) {
    // User is not authenticated, redirect to login
    // Store the attempted URL for redirecting after login
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Check if company is restricted
  const company = userService.company();
  const isRestricted = company?.restricted === true;

  if (isRestricted) {
    // Only redirect if not already on locked page to avoid infinite loop
    if (state.url !== '/locked') {
      router.navigate(['/locked'], { replaceUrl: true });
    }
    return false;
  }

  return true;
};

