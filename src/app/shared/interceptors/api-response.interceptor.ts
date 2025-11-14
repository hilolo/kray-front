import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';

/**
 * HTTP Interceptor to handle standard backend API response format
 * Transforms the response to extract the data property automatically
 * Shows toast error messages for API errors
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't show toast for 401 errors - they're handled by token refresh interceptor
      // But still allow them to pass through so token refresh can handle them
      if (error.status === 401) {
        // Return the error as-is so token refresh interceptor can handle it
        // The token refresh interceptor runs before this one, so if it didn't handle it,
        // we should pass it through without transformation
        return throwError(() => error);
      }

      // Handle HTTP errors
      if (error.error) {
        // If the error response follows the standard format
        if (error.error.status && error.error.data !== undefined) {
          // Show toast error if status is "Failed"
          if (error.error.status === 'Failed' && error.error.message) {
            toastService.error(error.error.message);
          }
          // Return the error in the standard format
          return throwError(() => error.error);
        }
      }
      
      // Handle non-standard error format
      // Show generic error message
      const errorMessage = error.error?.message || error.message || 'An error occurred';
      if (error.status && error.status >= 400) {
        toastService.error(errorMessage);
      }
      
      // Return the error as-is if it doesn't follow the standard format
      return throwError(() => error);
    })
  );
};

