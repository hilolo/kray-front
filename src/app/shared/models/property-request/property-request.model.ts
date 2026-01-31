import type { PropertyCategory } from '../property/property.model';

/**
 * PropertyRequest model from backend PropertyRequestDto
 */
export interface PropertyRequest {
  id: string;
  companyId: string;
  category: PropertyCategory;
  budget: number;
  pieces: number;
  bathrooms: number;
  isFurnished: boolean;
  price: number;
  surface: number;
  zone: string;
  ville: string;
  description: string;
  isCollaborate: boolean;
  collaborationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create PropertyRequest request model
 */
export interface CreatePropertyRequestRequest {
  category: PropertyCategory;
  budget: number;
  pieces: number;
  bathrooms: number;
  isFurnished: boolean;
  price: number;
  surface: number;
  zone: string;
  ville: string;
  description: string;
  isCollaborate: boolean;
}

/**
 * Update PropertyRequest request model
 * Note: isCollaborate is NOT included here - use updateCollaborationStatus() instead
 */
export interface UpdatePropertyRequestRequest {
  id: string;
  companyId?: string;
  category?: PropertyCategory;
  budget?: number;
  pieces?: number;
  bathrooms?: number;
  isFurnished?: boolean;
  price?: number;
  surface?: number;
  zone?: string;
  ville?: string;
  description?: string;
}

/**
 * PropertyRequest list request model
 */
export interface PropertyRequestListRequest {
  searchQuery?: string;
  contactId?: string;
  isCollaborate?: boolean;
  category?: PropertyCategory;
  currentPage?: number;
  pageSize?: number;
  ignore?: boolean;
}

