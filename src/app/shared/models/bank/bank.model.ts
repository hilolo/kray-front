import type { Contact } from '../contact/contact.model';

/**
 * Bank model from backend BankDto
 */
export interface Bank {
  id: string;
  companyId: string;
  contactId: string;
  contact?: Contact;
  bankName: string;
  rib: string;
  iban?: string;
  swift?: string;
  createdOn: string;
  lastModifiedOn?: string;
}

