import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { LeaseListRequest } from '../models/lease/lease-list-request.model';
import type { LeaseListResponse } from '../models/lease/lease-list-response.model';
import type { CreateLeaseRequest } from '../models/lease/create-lease-request.model';
import type { UpdateLeaseRequest } from '../models/lease/update-lease-request.model';
import type { Lease } from '../models/lease/lease.model';

/**
 * Service for lease-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class LeaseService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of leases
   * POST api/Leasing/list
   * @param request Lease list request parameters
   * @returns Observable of paginated lease list response
   */
  list(request: LeaseListRequest): Observable<LeaseListResponse> {
    return this.apiService.post<LeaseListResponse>('Leasing/list', request);
  }

  /**
   * Create a new lease
   * POST api/Leasing/create
   * @param request Lease creation data
   * @returns Observable of created lease
   */
  create(request: CreateLeaseRequest): Observable<Lease> {
    return this.apiService.post<Lease>('Leasing/create', request);
  }

  /**
   * Get a lease by ID
   * GET api/Leasing/{id}
   * @param id Lease ID
   * @returns Observable of lease
   */
  getById(id: string): Observable<Lease> {
    return this.apiService.get<Lease>(`Leasing/${id}`);
  }

  /**
   * Update an existing lease
   * PUT api/Leasing/{id}
   * @param id Lease ID
   * @param request Lease update data
   * @returns Observable of updated lease
   */
  update(id: string, request: UpdateLeaseRequest): Observable<Lease> {
    return this.apiService.put<Lease>(`Leasing/${id}`, request);
  }

  /**
   * Delete a lease (soft delete)
   * DELETE api/Leasing/{id}
   * @param id Lease ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Leasing/${id}`);
  }

  /**
   * Toggle archive status of a lease
   * POST api/Leasing/{id}/archive?archive=true
   * @param id Lease ID
   * @param archive True to archive, false to activate
   * @returns Observable of result
   */
  toggleArchive(id: string, archive: boolean = true): Observable<void> {
    return this.apiService.post<void>(`Leasing/${id}/archive?archive=${archive}`, {});
  }
}

