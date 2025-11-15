import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenRefreshService } from '../services/token-refresh.service';

/**
 * HTTP Interceptor to automatically refresh token on 401 Unauthorized errors
 * Attempts to refresh the token using sign-in-with-token and retries the original request
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenRefreshService = inject(TokenRefreshService);

  // Skip interceptor for static assets (translation files, images, etc.)
  const url = req.url.toLowerCase();
  const isAssetRequest = url.startsWith('/assets/') || url.includes('/assets/');
  if (isAssetRequest) {
    return next(req);
  }

  // Check if token is empty before making the request
  const currentToken = authService.getToken();
  if (!currentToken || currentToken.trim() === '') {
    const isSignInEndpoint = url.includes('/sign-in') || url.includes('/sign-in-with-token');
    
    // If token is empty and not a sign-in endpoint, try to refresh first
    if (!isSignInEndpoint && !tokenRefreshService.getIsRefreshing()) {
      console.log('[TokenRefresh] Token is empty, attempting to refresh before request:', url);
      tokenRefreshService.setRefreshing(true);
      
      return authService.signInWithToken().pipe(
        switchMap((response) => {
          // Token refresh successful
          console.log('[TokenRefresh] Token refresh successful, proceeding with request');
          const newToken = response.jwt.token;
          tokenRefreshService.setToken(newToken);
          
          // Proceed with the original request with the new token
          return retryRequest(req, next, newToken);
        }),
        catchError((refreshError) => {
          // Token refresh failed - logout user
          console.error('[TokenRefresh] Token refresh failed, logging out:', refreshError);
          tokenRefreshService.reset();
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip interceptor for static assets
      const url = req.url.toLowerCase();
      const isAssetRequest = url.startsWith('/assets/') || url.includes('/assets/');
      if (isAssetRequest) {
        return throwError(() => error);
      }

      const isSignInEndpoint = url.includes('/sign-in') || url.includes('/sign-in-with-token');
      const hasToken = !!authService.getToken();
      
      // Handle 401 Unauthorized errors
      // Also handle status 0 (network errors) if we have a token - might be auth-related
      // Also handle if token becomes empty
      const tokenIsEmpty = !authService.getToken() || authService.getToken()?.trim() === '';
      const shouldRefresh = (error.status === 401 || (error.status === 0 && hasToken) || tokenIsEmpty) && !isSignInEndpoint;
      
      if (shouldRefresh) {
        // Skip token refresh for sign-in and sign-in-with-token endpoints to avoid infinite loops
        if (isSignInEndpoint) {
          console.log('[TokenRefresh] Skipping refresh for sign-in endpoint:', url);
          return throwError(() => error);
        }

        // Skip if this is already a retry attempt to prevent infinite loops
        if (req.headers.has('X-Retry-Attempt')) {
          console.log('[TokenRefresh] Skipping refresh - already a retry attempt');
          return throwError(() => error);
        }

        // If token is empty, log out immediately
        if (tokenIsEmpty) {
          console.log('[TokenRefresh] Token is empty, logging out');
          authService.logout();
          return throwError(() => error);
        }

        console.log(`[TokenRefresh] ${error.status === 401 ? '401' : 'Status 0'} detected, attempting to refresh token for:`, url);

        // If we're not already refreshing, start the refresh process
        if (!tokenRefreshService.getIsRefreshing()) {
          console.log('[TokenRefresh] Starting token refresh...');
          tokenRefreshService.setRefreshing(true);

          // Attempt to refresh the token
          return authService.signInWithToken().pipe(
            switchMap((response) => {
              // Token refresh successful
              console.log('[TokenRefresh] Token refresh successful');
              const newToken = response.jwt.token;
              
              // Check if new token is empty
              if (!newToken || newToken.trim() === '') {
                console.error('[TokenRefresh] Refreshed token is empty, logging out');
                tokenRefreshService.reset();
                authService.logout();
                return throwError(() => new Error('Token refresh returned empty token'));
              }
              
              tokenRefreshService.setToken(newToken);
              
              // Retry the original request with the new token
              console.log('[TokenRefresh] Retrying original request with new token');
              return retryRequest(req, next, newToken);
            }),
            catchError((refreshError) => {
              // Token refresh failed - logout user
              console.error('[TokenRefresh] Token refresh failed, logging out:', refreshError);
              tokenRefreshService.reset();
              authService.logout();
              return throwError(() => error); // Return original error, not refresh error
            })
          );
        } else {
          // If we're already refreshing, wait for the token and then retry
          console.log('[TokenRefresh] Token refresh in progress, waiting...');
          return tokenRefreshService.getToken().pipe(
            switchMap((token) => {
              // Check if token is empty
              if (!token || token.trim() === '') {
                console.error('[TokenRefresh] Received empty token, logging out');
                tokenRefreshService.reset();
                authService.logout();
                return throwError(() => new Error('Received empty token'));
              }
              
              console.log('[TokenRefresh] Got refreshed token, retrying request');
              return retryRequest(req, next, token);
            })
          );
        }
      }

      // For other errors, pass through
      return throwError(() => error);
    })
  );
};

/**
 * Retry the original request with a new token
 */
function retryRequest(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  token: string
): Observable<any> {
  // Clone the request and add the new token
  // Add a custom header to mark this as a retry to prevent infinite loops
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Retry-Attempt': '1', // Mark as retry to prevent infinite loops
    },
  });
  
  return next(clonedRequest);
}

