import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { CollaborationProperty } from '../models/collaboration/collaboration-property.model';
import type { CollaborationRequest } from '../models/collaboration/collaboration-request.model';
import type { Property } from '../models/property/property.model';
import type { PropertyRequest } from '../models/property-request/property-request.model';

/**
 * Service for collaboration-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class CollaborationService {
  private readonly apiService = inject(ApiService);

  /**
   * Get all collaboration-enabled properties (own company and others)
   * GET api/Collaboration/properties
   * @returns Observable of collaboration properties list
   */
  getCollaborationProperties(): Observable<CollaborationProperty[]> {
    return this.apiService.get<CollaborationProperty[]>('Collaboration/properties');
  }

  /**
   * Get all collaboration-enabled property requests (own company and others)
   * GET api/Collaboration/requests
   * @returns Observable of collaboration property requests list
   */
  getCollaborationRequests(): Observable<CollaborationRequest[]> {
    return this.apiService.get<CollaborationRequest[]>('Collaboration/requests');
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
   * Get all collaboration-enabled property requests from the current company (requests we have shared)
   * GET api/Collaboration/my-requests
   * @returns Observable of property request list
   */
  getMySharedRequests(): Observable<PropertyRequest[]> {
    return this.apiService.get<PropertyRequest[]>('Collaboration/my-requests');
  }

  /**
   * Bulk unshare property requests (set IsCollaborate = false for multiple requests)
   * POST api/Collaboration/bulk-unshare-requests
   * @param propertyRequestIds List of property request IDs to unshare
   * @returns Observable of number of requests successfully unshared
   */
  bulkUnshareRequests(propertyRequestIds: string[]): Observable<number> {
    return this.apiService.post<number>('Collaboration/bulk-unshare-requests', { propertyRequestIds });
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

