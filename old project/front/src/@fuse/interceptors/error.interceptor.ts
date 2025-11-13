import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const errorHandlerService = inject(ErrorHandlerService);
    
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Handle the error
            errorHandlerService.handleError(error);
            
            // Re-throw the error so it can be handled by the component if needed
            return throwError(() => error);
        })
    );
};
