import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor to automatically add JWT token to requests
 * Adds Authorization header with Bearer token if user is authenticated
 */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for static assets (translation files, images, etc.)
  const url = req.url.toLowerCase();
  const isAssetRequest = url.startsWith('/assets/') || url.includes('/assets/');
  if (isAssetRequest) {
    return next(req);
  }

  // Skip interceptor for public endpoints (no authentication required)
  const isPublicEndpoint = url.includes('/public/') || 
                           url.includes('/forgot-password') || 
                           url.includes('/reset-password') ||
                           url.includes('/sign-in');
  if (isPublicEndpoint) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  // If no token, proceed with the original request
  return next(req);
};

