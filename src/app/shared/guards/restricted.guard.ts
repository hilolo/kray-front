import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Restricted guard
 * Redirects to /locked if company is restricted
 * Should be used on all routes except /locked and /login
 */
export const restrictedGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const company = userService.company();
  const isRestricted = company?.restricted === true;

  // If restricted, redirect to locked page
  if (isRestricted) {
    // Only redirect if not already on locked page to avoid infinite loop
    if (state.url !== '/locked') {
      router.navigate(['/locked'], { replaceUrl: true });
    }
    return false;
  }

  return true;
};

