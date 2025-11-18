import type { AttachmentDetails } from '../property/property.model';

/**
 * Key model from backend KeyDto
 */
export interface Key {
  id: string;
  name: string;
  description: string;
  propertyId: string;
  property?: Property;
  defaultAttachmentId?: string | null;
  defaultAttachmentUrl?: string | null;
  attachments?: AttachmentDetails[];
  createdOn: string;
  lastModifiedOn?: string;
}

/**
 * Property reference (simplified)
 */
export interface Property {
  id: string;
  identifier: string;
  name: string;
  address?: string;
  city?: string;
}

