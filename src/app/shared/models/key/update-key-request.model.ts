import type { KeyImageInput } from './create-key-request.model';

/**
 * Request model for updating a key
 */
export interface UpdateKeyRequest {
  id: string;
  name: string;
  description: string;
  propertyId: string;
  defaultAttachmentId?: string | null;
  image?: KeyImageInput;
}

