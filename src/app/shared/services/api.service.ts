import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/api/api-response.model';
import { ToastService } from './toast.service';

/**
 * Base API service for making HTTP requests to the backend
 * Handles the standard API response format automatically
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Get the full URL for an endpoint
   */
  private getUrl(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return `${cleanBaseUrl}${cleanBaseUrl.endsWith('/') ? '' : '/'}${cleanEndpoint}`;
  }

  /**
   * Get request
   */
  get<T = any>(endpoint: string, params?: HttpParams | Record<string, any>): Observable<T> {
    const url = this.getUrl(endpoint);
    const options = {
      params: params instanceof HttpParams ? params : new HttpParams({ fromObject: params }),
    };

    return this.http.get<ApiResponse<T>>(url, options).pipe(
      map((response) => {
        // Check if response has error status even with 200 OK
        if (response.status === 'Failed') {
          if (response.message) {
            this.toastService.error(response.message);
          }
          throw new Error(response.message || 'Request failed');
        }
        return response.data; // Extract data from standard response
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Post request
   */
  post<T = any>(endpoint: string, body: any, options?: { headers?: HttpHeaders }): Observable<T> {
    const url = this.getUrl(endpoint);
    console.log('[ApiService] POST request:', {
      url: url,
      endpoint: endpoint,
      body: endpoint.includes('accept-invitation') 
        ? { ...body, password: '***', token: body.token ? body.token.substring(0, 10) + '...' : 'missing' }
        : body
    });
    
    const startTime = Date.now();
    
    return this.http.post<ApiResponse<T> | any>(url, body, options).pipe(
      map((response) => {
        const duration = Date.now() - startTime;
        console.log(`[ApiService] POST response (${duration}ms):`, {
          url: url,
          hasResponse: !!response,
          responseType: typeof response,
          hasStatus: response && typeof response === 'object' && 'status' in response,
          status: response?.status,
          hasData: response?.data !== undefined
        });
        
        // Handle case where response is the Result object directly (no wrapper)
        // Check if response has status property (Result object structure)
        if (response && typeof response === 'object' && 'status' in response) {
          // Check if response has error status even with 200 OK
          if (response.status === 'Failed') {
            console.error('[ApiService] Request failed with status Failed:', {
              code: response.code,
              message: response.message,
              errors: response.errors
            });
            
            // Create error object with code and data for company_restricted handling
            const error: any = new Error(response.message || 'Request failed');
            error.code = response.code;
            error.data = response.data;
            error.message = response.message;
            error.errors = response.errors;
            // Don't show toast for company_restricted - let login component handle it
            if (response.code !== 'company_restricted' && response.message) {
              this.toastService.error(response.message);
            }
            throw error;
          }
          // If response has data property, return it; otherwise return the response itself
          const result = response.data !== undefined ? response.data : response;
          console.log('[ApiService] Returning response data');
          return result;
        }
        // Fallback: return response as-is if it doesn't match expected structure
        console.log('[ApiService] Returning response as-is (no status property)');
        return response;
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        console.error(`[ApiService] POST error (${duration}ms):`, {
          url: url,
          error: error,
          status: error?.status,
          statusText: error?.statusText,
          errorBody: error?.error
        });
        return this.handleError(error);
      })
    );
  }

  /**
   * Put request
   */
  put<T = any>(endpoint: string, body: any, options?: { headers?: HttpHeaders }): Observable<T> {
    const url = this.getUrl(endpoint);
    return this.http.put<ApiResponse<T>>(url, body, options).pipe(
      map((response) => {
        // Check if response has error status even with 200 OK
        if (response.status === 'Failed') {
          if (response.message) {
            this.toastService.error(response.message);
          }
          throw new Error(response.message || 'Request failed');
        }
        return response.data; // Extract data from standard response
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Patch request
   */
  patch<T = any>(endpoint: string, body: any, options?: { headers?: HttpHeaders }): Observable<T> {
    const url = this.getUrl(endpoint);
    return this.http.patch<ApiResponse<T>>(url, body, options).pipe(
      map((response) => {
        // Check if response has error status even with 200 OK
        if (response.status === 'Failed') {
          if (response.message) {
            this.toastService.error(response.message);
          }
          throw new Error(response.message || 'Request failed');
        }
        return response.data; // Extract data from standard response
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete request
   */
  delete<T = any>(endpoint: string, params?: HttpParams | Record<string, any>): Observable<T> {
    const url = this.getUrl(endpoint);
    const options = {
      params: params instanceof HttpParams ? params : new HttpParams({ fromObject: params }),
    };

    return this.http.delete<ApiResponse<T>>(url, options).pipe(
      map((response) => {
        // Check if response has error status even with 200 OK
        if (response.status === 'Failed') {
          if (response.message) {
            this.toastService.error(response.message);
          }
          throw new Error(response.message || 'Request failed');
        }
        return response.data; // Extract data from standard response
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    console.error('API Error:', error);
    return throwError(() => error);
  };
}

