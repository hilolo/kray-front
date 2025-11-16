import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import type { MaintenanceListRequest } from '../models/maintenance/maintenance-list-request.model';
import type { MaintenanceListResponse } from '../models/maintenance/maintenance-list-response.model';
import type { CreateMaintenanceRequest } from '../models/maintenance/create-maintenance-request.model';
import type { UpdateMaintenanceRequest } from '../models/maintenance/update-maintenance-request.model';
import type { Maintenance } from '../models/maintenance/maintenance.model';
import { MaintenanceStatus, MaintenancePriority } from '../models/maintenance/maintenance.model';

/**
 * Service for maintenance-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private readonly apiService = inject(ApiService);

  /**
   * Normalize maintenance data - backend now returns enums as numbers
   * This function ensures priority and status are numbers
   */
  private normalizeMaintenance(maintenance: Maintenance): Maintenance {
    // Backend now returns numbers directly (JsonStringEnumConverter removed)
    // Just ensure they are numbers and return as-is
    return {
      ...maintenance,
      priority: typeof maintenance.priority === 'number' ? maintenance.priority : MaintenancePriority.Low,
      status: typeof maintenance.status === 'number' ? maintenance.status : MaintenanceStatus.Waiting,
    };
  }

  /**
   * Get paginated list of maintenances
   * POST api/Maintenance/list
   * @param request Maintenance list request parameters
   * @returns Observable of paginated maintenance list response
   */
  list(request: MaintenanceListRequest): Observable<MaintenanceListResponse> {
    return this.apiService.post<MaintenanceListResponse>('Maintenance/list', request).pipe(
      map((response) => ({
        ...response,
        result: response.result.map((maintenance) => this.normalizeMaintenance(maintenance)),
      }))
    );
  }

  /**
   * Create a new maintenance request
   * POST api/Maintenance/create
   * @param request Maintenance creation data
   * @returns Observable of created maintenance
   */
  create(request: CreateMaintenanceRequest): Observable<Maintenance> {
    return this.apiService.post<Maintenance>('Maintenance/create', request).pipe(
      map((maintenance) => this.normalizeMaintenance(maintenance))
    );
  }

  /**
   * Get a maintenance request by ID
   * GET api/Maintenance/{id}
   * @param id Maintenance ID
   * @returns Observable of maintenance
   */
  getById(id: string): Observable<Maintenance> {
    return this.apiService.get<Maintenance>(`Maintenance/${id}`).pipe(
      map((maintenance) => this.normalizeMaintenance(maintenance))
    );
  }

  /**
   * Update an existing maintenance request
   * PUT api/Maintenance/{id}
   * @param id Maintenance ID
   * @param request Maintenance update data
   * @returns Observable of updated maintenance
   */
  update(id: string, request: UpdateMaintenanceRequest): Observable<Maintenance> {
    return this.apiService.put<Maintenance>(`Maintenance/${id}`, request).pipe(
      map((maintenance) => this.normalizeMaintenance(maintenance))
    );
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

