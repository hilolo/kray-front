import type { PropertyCategory, TypePaiment, AttachmentDetails } from './property.model';

/**
 * Public property model from backend PublicPropertyDto
 * This model is used for public property views (no authentication required)
 */
export interface PublicProperty {
  id: string;
  identifier: string;
  name: string;
  description: string;
  address: string | null; // null if IsAddressPublic is false
  city: string;
  typeProperty: string;
  area: number;
  pieces: number;
  bathrooms: number;
  furnished: boolean;
  price: number;
  typePaiment: TypePaiment;
  features: string[];
  equipment: string[];
  category: PropertyCategory;
  defaultAttachmentUrl: string | null;
  attachments: AttachmentDetails[];
  isAddressPublic: boolean;
  // Company information
  companyName: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyWebsite: string | null;
  companyAddress: string | null;
  companyLogoUrl: string | null;
}

