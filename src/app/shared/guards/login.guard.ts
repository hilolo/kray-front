import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Login guard
 * Prevents authenticated users from accessing the login page
 * Redirects to home if user is already authenticated
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is authenticated, redirect to home
  if (authService.checkAuthentication()) {
    router.navigate(['/']);
    return false;
  }

  // User is not authenticated, allow access to login page
  return true;
};

