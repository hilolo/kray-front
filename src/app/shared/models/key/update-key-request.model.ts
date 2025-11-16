/**
 * Request model for updating a key
 */
export interface UpdateKeyRequest {
  id: string;
  name: string;
  description: string;
  propertyId: string;
}

