import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { PropertyListRequest } from '../models/property/property-list-request.model';
import type { PropertyListResponse } from '../models/property/property-list-response.model';
import type { CreatePropertyRequest } from '../models/property/create-property-request.model';
import type { UpdatePropertyRequest } from '../models/property/update-property-request.model';
import type { UpdatePropertySharingRequest, UpdatePropertySharingAdresseRequest, UpdatePropertyVisibilityRequest } from '../models/property/update-property-visibility-request.model';
import type { Property } from '../models/property/property.model';
import type { PublicProperty } from '../models/property/public-property.model';

/**
 * Service for property-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of properties
   * POST api/Property/list
   * @param request Property list request parameters
   * @returns Observable of paginated property list response
   */
  list(request: PropertyListRequest): Observable<PropertyListResponse> {
    return this.apiService.post<PropertyListResponse>('Property/list', request);
  }

  /**
   * Create a new property
   * POST api/Property/create
   * @param request Property creation data
   * @returns Observable of created property
   */
  create(request: CreatePropertyRequest): Observable<Property> {
    return this.apiService.post<Property>('Property/create', request);
  }

  /**
   * Get a property by ID
   * GET api/Property/{id}?includeRelated=false
   * @param id Property ID
   * @param includeRelated Whether to include related entities (default: false)
   * @returns Observable of property
   */
  getById(id: string, includeRelated: boolean = false): Observable<Property> {
    return this.apiService.get<Property>(`Property/${id}?includeRelated=${includeRelated}`);
  }

  /**
   * Update an existing property
   * PUT api/Property/{id}
   * @param id Property ID
   * @param request Property update data
   * @returns Observable of updated property
   */
  update(id: string, request: UpdatePropertyRequest): Observable<Property> {
    return this.apiService.put<Property>(`Property/${id}`, request);
  }

  /**
   * Delete a property (soft delete)
   * DELETE api/Property/{id}
   * @param id Property ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Property/${id}`);
  }

  /**
   * Update the archive status of a property
   * PATCH api/Property/archive-status
   * @param propertyId Property ID
   * @param isArchived Archive status
   * @returns Observable of updated property
   */
  updateArchiveStatus(propertyId: string, isArchived: boolean): Observable<Property> {
    return this.apiService.patch<Property>('Property/archive-status', {
      propertyId,
      isArchived,
    });
  }

  /**
   * Update property building (attach or detach)
   * PATCH api/Property/update-building
   * @param propertyId Property ID
   * @param buildingId Building ID (null to detach)
   * @returns Observable of updated property
   */
  updatePropertyBuilding(propertyId: string, buildingId: string | null): Observable<Property> {
    return this.apiService.patch<Property>('Property/update-building', {
      propertyId,
      buildingId: buildingId || null,
    });
  }

  /**
   * Update property sharing (isPublic)
   * PATCH api/Property/visibility (sends only isPublic)
   * @param request Property sharing update data
   * @returns Observable of updated property
   */
  updatePropertySharing(request: UpdatePropertySharingRequest): Observable<Property> {
    const body: { propertyId: string; isPublic?: boolean } = {
      propertyId: request.propertyId,
    };
    if (request.isPublic !== undefined) {
      body.isPublic = request.isPublic;
    }
    return this.apiService.patch<Property>('Property/visibility', body);
  }

  /**
   * Update property address sharing (isPublicAdresse)
   * PATCH api/Property/visibility (sends only isPublicAdresse)
   * @param request Property address sharing update data
   * @returns Observable of updated property
   */
  updatePropertySharingAdresse(request: UpdatePropertySharingAdresseRequest): Observable<Property> {
    const body: { propertyId: string; isPublicAdresse?: boolean } = {
      propertyId: request.propertyId,
    };
    if (request.isPublicAdresse !== undefined) {
      body.isPublicAdresse = request.isPublicAdresse;
    }
    return this.apiService.patch<Property>('Property/visibility', body);
  }

  /**
   * Update both property sharing fields (isPublic and isPublicAdresse)
   * PATCH api/Property/visibility
   * @param request Property visibility update data
   * @returns Observable of updated property
   */
  updatePropertyVisibility(request: UpdatePropertyVisibilityRequest): Observable<Property> {
    return this.apiService.patch<Property>('Property/visibility', request);
  }

  /**
   * Get a public property by ID (no authentication required)
   * GET api/public/properties/{id}
   * @param id Property ID
   * @returns Observable of public property
   */
  getPublicPropertyById(id: string): Observable<PublicProperty> {
    return this.apiService.get<PublicProperty>(`public/properties/${id}`);
  }

  /**
   * Update the collaboration status of a property
   * PATCH api/Property/collaboration-status
   * @param propertyId Property ID
   * @param isCollaboration Collaboration status
   * @returns Observable of updated property
   */
  updateCollaborationStatus(propertyId: string, isCollaboration: boolean): Observable<Property> {
    return this.apiService.patch<Property>('Property/collaboration-status', {
      propertyId,
      isCollaboration,
    });
  }
}

