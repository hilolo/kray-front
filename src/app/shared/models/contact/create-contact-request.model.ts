import { ContactType } from './contact.model';

/**
 * Attachment input for contact creation
 */
export interface AttachmentInput {
  fileName: string;
  base64Content: string;
  root?: string;
  contactId?: string;
}

/**
 * Create contact request matching backend CreateContactDto
 */
export interface CreateContactRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  ice?: string;
  rc?: string;
  identifier: string; // Required
  type: ContactType; // Required
  isACompany: boolean; // Required
  email?: string;
  phones?: string[];
  avatar?: string;
  attachments?: AttachmentInput[];
  companyId: string; // Required
}

