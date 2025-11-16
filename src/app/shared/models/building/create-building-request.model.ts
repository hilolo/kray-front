/**
 * Create building request model
 */
export interface CreateBuildingRequest {
  name: string;
  address?: string;
  city?: string;
  description?: string;
  construction: number;
  year: number;
  floor: number;
  companyId: string;
  image?: {
    fileName: string;
    base64Content: string;
  };
}

