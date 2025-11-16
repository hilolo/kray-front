/**
 * Update building request model
 */
export interface UpdateBuildingRequest {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  description?: string;
  year?: number;
  floor?: number;
  image?: {
    fileName: string;
    base64Content: string;
  };
  removeImage?: boolean;
  defaultAttachmentId?: string;
}

