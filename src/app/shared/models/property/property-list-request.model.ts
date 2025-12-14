import { PropertyCategory } from './property.model';
import { TypePaiment } from './property.model';

/**
 * Request model for property list endpoint
 * Based on GetPropertiesFilter from backend
 */
export interface PropertyListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  identifier?: string;
  typeProperty?: string;
  typeProperties?: string[]; // Multiple property types
  typePaiment?: TypePaiment;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  buildingId?: string;
  unattachedOnly?: boolean;
  contactId?: string;
  category?: PropertyCategory;
  city?: string;
  address?: string;
  isArchived?: boolean;
}

