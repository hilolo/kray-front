/**
 * Contact type definition
 */
export type ContactType = 'tenants' | 'owners' | 'services';

/**
 * Contact model from backend
 */
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  priority: 'high' | 'medium' | 'low';
  category: string;
  type: ContactType;
}

