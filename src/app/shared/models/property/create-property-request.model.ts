import { PropertyCategory } from './property.model';
import { TypePaiment } from './property.model';

/**
 * Property image input for create/update
 */
export interface PropertyImageInput {
  fileName: string;
  base64Content: string;
  isDefault: boolean;
}

/**
 * Request model for creating a property
 * Based on CreatePropertyDto from backend
 */
export interface CreatePropertyRequest {
  identifier: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  typeProperty?: string;
  area: number;
  pieces: number;
  bathrooms: number;
  furnished: boolean;
  price: number;
  typePaiment: TypePaiment;
  buildingId?: string;
  contactId: string;
  defaultAttachmentId?: string;
  features?: string[];
  equipment?: string[];
  category: PropertyCategory;
  isPublic: boolean;
  isPublicAdresse: boolean;
  isShared: boolean;
  images?: PropertyImageInput[];
  defaultImageId?: string;
}

