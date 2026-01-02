import type { PropertyCategory, TypePaiment, AttachmentDetails } from '../property/property.model';

/**
 * Collaboration property model from backend CollaborationPropertyDto
 * Properties shared with other companies for collaboration
 */
export interface CollaborationProperty {
  id: string;
  identifier: string;
  name: string;
  description: string;
  // Address is intentionally excluded for privacy
  city: string;
  typeProperty: string;
  area: number;
  pieces: number;
  bathrooms: number;
  furnished: boolean;
  price: number;
  typePaiment: TypePaiment;
  defaultAttachmentId: string | null;
  defaultAttachmentUrl: string | null;
  features: string[];
  equipment: string[];
  category: PropertyCategory;
  attachments: AttachmentDetails[];
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  createdAt: string;
  updatedAt: string;
  collaborationAt: string | null;
}

