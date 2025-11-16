/**
 * Request model for updating property sharing (isPublic)
 * Based on UpdatePropertyVisibilityDto from backend
 */
export interface UpdatePropertySharingRequest {
  propertyId: string;
  isPublic?: boolean;
}

/**
 * Request model for updating property address sharing (isPublicAdresse)
 * Based on UpdatePropertyVisibilityDto from backend
 */
export interface UpdatePropertySharingAdresseRequest {
  propertyId: string;
  isPublicAdresse?: boolean;
}

/**
 * Request model for updating both property sharing fields
 * Based on UpdatePropertyVisibilityDto from backend
 */
export interface UpdatePropertyVisibilityRequest {
  propertyId: string;
  isPublic?: boolean;
  isPublicAdresse?: boolean;
}

