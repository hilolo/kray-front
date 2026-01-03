import type { PropertyCategory } from '../property/property.model';

/**
 * PropertyRequest model from backend PropertyRequestDto
 */
export interface PropertyRequest {
  id: string;
  client: string;
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Create PropertyRequest request model
 */
export interface CreatePropertyRequestRequest {
  client: string;
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
 */
export interface UpdatePropertyRequestRequest {
  id: string;
  client?: string;
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
  isCollaborate?: boolean;
}

/**
 * PropertyRequest list request model
 */
export interface PropertyRequestListRequest {
  searchQuery?: string;
  contactId?: string;
  currentPage?: number;
  pageSize?: number;
  ignore?: boolean;
}

