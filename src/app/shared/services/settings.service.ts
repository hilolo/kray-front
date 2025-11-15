import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/api/api-response.model';
import type { Settings } from '../models/settings/settings.model';
import type { UpdateSettingsRequest } from '../models/settings/update-settings-request.model';

/**
 * Service for settings-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly apiService = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Get application settings
   * GET api/settings
   * Handles both wrapped (ApiResponse) and direct response formats
   * @returns Observable of settings
   */
  getSettings(): Observable<Settings> {
    const url = `${this.baseUrl}/settings`;
    return this.http.get<ApiResponse<Settings> | Settings>(url).pipe(
      map((response) => {
        // Check if response is wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'data' in response && 'status' in response) {
          const apiResponse = response as ApiResponse<Settings>;
          // Check if response has error status
          if (apiResponse.status === 'Failed') {
            throw new Error(apiResponse.message || 'Request failed');
          }
          return apiResponse.data;
        }
        // Response is returned directly (not wrapped)
        return response as Settings;
      })
    );
  }

  /**
   * Update application settings
   * PUT api/settings
   * Handles both wrapped (ApiResponse) and direct response formats
   * @param request Settings update data
   * @returns Observable of updated settings
   */
  updateSettings(request: UpdateSettingsRequest): Observable<Settings> {
    const url = `${this.baseUrl}/settings`;
    return this.http.put<ApiResponse<Settings> | Settings>(url, request).pipe(
      map((response) => {
        // Check if response is wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'data' in response && 'status' in response) {
          const apiResponse = response as ApiResponse<Settings>;
          // Check if response has error status
          if (apiResponse.status === 'Failed') {
            throw new Error(apiResponse.message || 'Request failed');
          }
          return apiResponse.data;
        }
        // Response is returned directly (not wrapped)
        return response as Settings;
      })
    );
  }
}

