import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
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

  /**
   * Get application settings
   * GET api/settings
   * @returns Observable of settings
   */
  getSettings(): Observable<Settings> {
    return this.apiService.get<Settings>('settings');
  }

  /**
   * Update application settings
   * PUT api/settings
   * @param request Settings update data
   * @returns Observable of updated settings
   */
  updateSettings(request: UpdateSettingsRequest): Observable<Settings> {
    return this.apiService.put<Settings>('settings', request);
  }
}

