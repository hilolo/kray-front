/**
 * Request model for creating a key
 */
export interface KeyImageInput {
  fileName: string;
  base64Content: string;
}

export interface CreateKeyRequest {
  name: string;
  description: string;
  propertyId: string;
  defaultAttachmentId?: string | null;
  image?: KeyImageInput;
}

