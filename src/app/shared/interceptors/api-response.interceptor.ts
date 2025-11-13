import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';

/**
 * HTTP Interceptor to handle standard backend API response format
 * Transforms the response to extract the data property automatically
 * Shows toast error messages for API errors
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle HTTP errors
      if (error.error) {
        // If the error response follows the standard format
        if (error.error.status && error.error.data !== undefined) {
          // Show toast error if status is "Failed"
          if (error.error.status === 'Failed' && error.error.message) {
            toast.error(error.error.message, {
              duration: 5000, // 5 seconds
            });
          }
          // Return the error in the standard format
          return throwError(() => error.error);
        }
      }
      
      // Handle non-standard error format
      // Show generic error message
      const errorMessage = error.error?.message || error.message || 'An error occurred';
      if (error.status && error.status >= 400) {
        toast.error(errorMessage, {
          duration: 5000, // 5 seconds
        });
      }
      
      // Return the error as-is if it doesn't follow the standard format
      return throwError(() => error);
    })
  );
};

