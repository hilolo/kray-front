import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/api-response.model';
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
    return this.http.post<ApiResponse<T>>(url, body, options).pipe(
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

