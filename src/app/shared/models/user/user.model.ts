import type { Company } from '../company/company.model';

/**
 * User model from backend
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  isAdmin: boolean;
  role: string;
  companyId: string;
  company: Company;
}

