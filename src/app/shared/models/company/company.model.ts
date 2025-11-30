/**
 * Company model from backend
 */
export interface Company {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website: string;
  address: string;
  city: string;
  rc: string;
  ice: string;
  image: string;
  restricted: boolean;
  isDeleted: boolean;
  id: string;
  createdOn: string;
  lastModifiedOn: string;
}

