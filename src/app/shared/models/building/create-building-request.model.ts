/**
 * Create building request model
 */
export interface CreateBuildingRequest {
  name: string;
  address?: string;
  city?: string;
  description?: string;
  year: number;
  floor: number;
  image?: {
    fileName: string;
    base64Content: string;
  };
}

