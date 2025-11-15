import { ContactType } from './contact.model';

/**
 * Request model for contact list endpoint
 */
export interface ContactListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  type: ContactType;
  searchQuery?: string;
}

