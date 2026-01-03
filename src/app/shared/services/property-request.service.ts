import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { PropertyRequest } from '../models/property-request/property-request.model';
import type { CreatePropertyRequestRequest } from '../models/property-request/property-request.model';
import type { UpdatePropertyRequestRequest } from '../models/property-request/property-request.model';
import type { PropertyRequestListRequest } from '../models/property-request/property-request.model';
import type { PropertyRequestListResponse } from '../models/property-request/property-request-list-response.model';

/**
 * Service for property request-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class PropertyRequestService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of property requests
   * POST api/PropertyRequest/list
   * @param request Property request list request parameters
   * @returns Observable of paginated property request list response
   */
  list(request: PropertyRequestListRequest): Observable<PropertyRequestListResponse> {
    return this.apiService.post<PropertyRequestListResponse>('PropertyRequest/list', request);
  }

  /**
   * Create a new property request
   * POST api/PropertyRequest/create
   * @param request Property request creation data
   * @returns Observable of created property request
   */
  create(request: CreatePropertyRequestRequest): Observable<PropertyRequest> {
    return this.apiService.post<PropertyRequest>('PropertyRequest/create', request);
  }

  /**
   * Get a property request by ID
   * GET api/PropertyRequest/{id}
   * @param id Property request ID
   * @returns Observable of property request
   */
  getById(id: string): Observable<PropertyRequest> {
    return this.apiService.get<PropertyRequest>(`PropertyRequest/${id}`);
  }

  /**
   * Update an existing property request
   * PUT api/PropertyRequest/{id}
   * @param id Property request ID
   * @param request Property request update data
   * @returns Observable of updated property request
   */
  update(id: string, request: UpdatePropertyRequestRequest): Observable<PropertyRequest> {
    return this.apiService.put<PropertyRequest>(`PropertyRequest/${id}`, request);
  }

  /**
   * Delete a property request (soft delete)
   * DELETE api/PropertyRequest/{id}
   * @param id Property request ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`PropertyRequest/${id}`);
  }
}

