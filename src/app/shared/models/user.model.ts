import type { Company } from './company.model';

/**
 * User model from backend
 */
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  role: string;
  companyId: string;
  company: Company;
}

