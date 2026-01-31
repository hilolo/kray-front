import type { PropertyCategory } from '../property/property.model';

/**
 * Collaboration property request model from backend CollaborationPropertyRequestDto
 * Property requests shared with other companies for collaboration
 */
export interface CollaborationRequest {
  id: string;
  client: string | null; // Excluded for privacy
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
  collaborationDate: string | null;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
}
