import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { MaintenanceListRequest } from '../models/maintenance/maintenance-list-request.model';
import type { MaintenanceListResponse } from '../models/maintenance/maintenance-list-response.model';
import type { CreateMaintenanceRequest } from '../models/maintenance/create-maintenance-request.model';
import type { UpdateMaintenanceRequest } from '../models/maintenance/update-maintenance-request.model';
import type { Maintenance } from '../models/maintenance/maintenance.model';
import { MaintenanceStatus } from '../models/maintenance/maintenance.model';

/**
 * Service for maintenance-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of maintenances
   * POST api/Maintenance/list
   * @param request Maintenance list request parameters
   * @returns Observable of paginated maintenance list response
   */
  list(request: MaintenanceListRequest): Observable<MaintenanceListResponse> {
    return this.apiService.post<MaintenanceListResponse>('Maintenance/list', request);
  }

  /**
   * Create a new maintenance request
   * POST api/Maintenance/create
   * @param request Maintenance creation data
   * @returns Observable of created maintenance
   */
  create(request: CreateMaintenanceRequest): Observable<Maintenance> {
    return this.apiService.post<Maintenance>('Maintenance/create', request);
  }

  /**
   * Get a maintenance request by ID
   * GET api/Maintenance/{id}
   * @param id Maintenance ID
   * @returns Observable of maintenance
   */
  getById(id: string): Observable<Maintenance> {
    return this.apiService.get<Maintenance>(`Maintenance/${id}`);
  }

  /**
   * Update an existing maintenance request
   * PUT api/Maintenance/{id}
   * @param id Maintenance ID
   * @param request Maintenance update data
   * @returns Observable of updated maintenance
   */
  update(id: string, request: UpdateMaintenanceRequest): Observable<Maintenance> {
    return this.apiService.put<Maintenance>(`Maintenance/${id}`, request);
  }

  /**
   * Delete a maintenance request (soft delete)
   * DELETE api/Maintenance/{id}
   * @param id Maintenance ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Maintenance/${id}`);
  }

  /**
   * Update the status of a maintenance request
   * POST api/Maintenance/{id}/status
   * @param id Maintenance ID
   * @param status New status
   * @returns Observable of result
   */
  updateStatus(id: string, status: MaintenanceStatus): Observable<void> {
    return this.apiService.post<void>(`Maintenance/${id}/status`, status);
  }
}

