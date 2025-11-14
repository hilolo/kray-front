import { Contact } from './contact.model';

/**
 * Paginated contact list response
 */
export interface ContactListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  result: Contact[];
}

