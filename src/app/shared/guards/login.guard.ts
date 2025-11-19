import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

/**
 * Login guard
 * Prevents authenticated users from accessing the login page
 * Redirects to locked page if company is restricted
 * Redirects to home if user is already authenticated and not restricted
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  // If user is authenticated, check if restricted
  if (authService.checkAuthentication()) {
    const company = userService.company();
    const isRestricted = company?.restricted === true;

    // If restricted, redirect to locked page
    if (isRestricted) {
      router.navigate(['/locked']);
      return false;
    }

    // If not restricted, redirect to home
    router.navigate(['/']);
    return false;
  }

  // User is not authenticated, allow access to login page
  return true;
};

