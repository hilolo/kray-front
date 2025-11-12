import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';

/**
 * HTTP Interceptor to handle standard backend API response format
 * Transforms the response to extract the data property automatically
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle HTTP errors
      if (error.error) {
        // If the error response follows the standard format
        if (error.error.status && error.error.data !== undefined) {
          // Return the error in the standard format
          return throwError(() => error.error);
        }
      }
      // Return the error as-is if it doesn't follow the standard format
      return throwError(() => error);
    })
  );
};

