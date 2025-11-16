/**
 * Building model from backend BuildingDto
 */
export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  year: number;
  floor: number;
  companyId: string;
  defaultAttachmentId: string | null;
  defaultAttachmentUrl: string | null;
  propertiesCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

