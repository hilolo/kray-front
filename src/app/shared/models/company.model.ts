/**
 * Company model from backend
 */
export interface Company {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  rc: string;
  ice: string;
  restricted: boolean;
  isDeleted: boolean;
  id: string;
  createdOn: string;
  lastModifiedOn: string;
}

