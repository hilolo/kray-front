import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { CollaborationProperty } from '../models/collaboration/collaboration-property.model';
import type { Property } from '../models/property/property.model';

/**
 * Service for collaboration-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class CollaborationService {
  private readonly apiService = inject(ApiService);

  /**
   * Get all collaboration-enabled properties from other companies
   * GET api/Collaboration/properties
   * @returns Observable of collaboration properties list
   */
  getCollaborationProperties(): Observable<CollaborationProperty[]> {
    return this.apiService.get<CollaborationProperty[]>('Collaboration/properties');
  }

  /**
   * Get all collaboration-enabled properties from the current company (properties we have shared)
   * GET api/Collaboration/my-properties
   * @returns Observable of property list (full Property objects including address)
   */
  getMySharedProperties(): Observable<Property[]> {
    return this.apiService.get<Property[]>('Collaboration/my-properties');
  }

  /**
   * Bulk unshare properties (set IsCollaboration = false for multiple properties)
   * POST api/Collaboration/bulk-unshare
   * @param propertyIds List of property IDs to unshare
   * @returns Observable of number of properties successfully unshared
   */
  bulkUnshareProperties(propertyIds: string[]): Observable<number> {
    return this.apiService.post<number>('Collaboration/bulk-unshare', { propertyIds });
  }

  /**
   * Get a single collaboration property by ID
   * GET api/Collaboration/properties/{id}
   * @param id Property ID
   * @returns Observable of collaboration property
   */
  getCollaborationPropertyById(id: string): Observable<CollaborationProperty> {
    return this.apiService.get<CollaborationProperty>(`Collaboration/properties/${id}`);
  }
}

