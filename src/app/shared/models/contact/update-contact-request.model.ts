import { ContactType } from './contact.model';
import { AttachmentInput } from './create-contact-request.model';

/**
 * Update contact request matching backend UpdateContactDto
 */
export interface UpdateContactRequest {
  id: string; // Required
  firstName?: string;
  lastName?: string;
  companyName?: string;
  ice?: string;
  rc?: string;
  identifier?: string;
  email?: string;
  phones?: string[];
  avatar?: string; // Base64 string or null/empty to preserve existing
  removeAvatar?: boolean; // Flag to indicate if avatar should be removed
  attachmentsToAdd?: AttachmentInput[]; // New attachments to add
  attachmentsToDelete?: string[]; // Attachment IDs to delete
}

