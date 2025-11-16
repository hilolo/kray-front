import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { BuildingListRequest } from '../models/building/building-list-request.model';
import type { BuildingListResponse } from '../models/building/building-list-response.model';
import type { CreateBuildingRequest } from '../models/building/create-building-request.model';
import type { UpdateBuildingRequest } from '../models/building/update-building-request.model';
import type { Building } from '../models/building/building.model';

/**
 * Service for building-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of buildings
   * POST api/Building/list
   * @param request Building list request parameters
   * @returns Observable of paginated building list response
   */
  list(request: BuildingListRequest): Observable<BuildingListResponse> {
    return this.apiService.post<BuildingListResponse>('Building/list', request);
  }

  /**
   * Create a new building
   * POST api/Building/create
   * @param request Building creation data
   * @returns Observable of created building
   */
  create(request: CreateBuildingRequest): Observable<Building> {
    return this.apiService.post<Building>('Building/create', request);
  }

  /**
   * Get a building by ID
   * GET api/Building/{id}
   * @param id Building ID
   * @returns Observable of building
   */
  getById(id: string): Observable<Building> {
    return this.apiService.get<Building>(`Building/${id}`);
  }

  /**
   * Update an existing building
   * PUT api/Building/{id}
   * @param id Building ID
   * @param request Building update data
   * @returns Observable of updated building
   */
  update(id: string, request: UpdateBuildingRequest): Observable<Building> {
    return this.apiService.put<Building>(`Building/${id}`, request);
  }

  /**
   * Delete a building
   * DELETE api/Building/{id}
   * @param id Building ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Building/${id}`);
  }
}

