/**
 * Building model from backend BuildingDto
 */
export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  construction: number;
  year: number;
  floor: number;
  companyId: string;
  defaultAttachmentId: string | null;
  defaultAttachmentUrl: string | null;
  propertiesCount: number;
  createdAt: string;
  updatedAt: string;
}

