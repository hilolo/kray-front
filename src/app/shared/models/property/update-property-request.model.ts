import { PropertyCategory } from './property.model';
import { TypePaiment } from './property.model';
import { PropertyImageInput } from './create-property-request.model';

/**
 * Request model for updating a property
 * Based on UpdatePropertyDto from backend
 */
export interface UpdatePropertyRequest {
  id: string;
  identifier?: string;
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  typeProperty?: string;
  area?: number;
  pieces?: number;
  bathrooms?: number;
  furnished?: boolean;
  price?: number;
  typePaiment?: TypePaiment;
  buildingId?: string;
  contactId?: string;
  defaultAttachmentId?: string;
  features?: string[];
  equipment?: string[];
  category?: PropertyCategory;
  isPublic?: boolean;
  isPublicAdresse?: boolean;
  isShared?: boolean;
  imagesToAdd?: PropertyImageInput[];
  attachmentsToDelete?: string[];
}

