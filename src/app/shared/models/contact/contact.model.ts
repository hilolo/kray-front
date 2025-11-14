/**
 * Contact type enum matching backend
 */
export enum ContactType {
  Owner = 0,
  Tenant = 1,
  Service = 2,
}

/**
 * Contact type string representation
 */
export type ContactTypeString = 'Owner' | 'Tenant' | 'Service';

/**
 * Attachment model from backend
 */
export interface Attachment {
  id: string;
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  fileSize: number;
  url: string;
  createdAt: string;
}

/**
 * List preferences for contact (client-side only, not from backend)
 */
export interface ContactList {
  viewType: 'list' | 'card';
}

/**
 * Contact model from backend
 */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  ice: string;
  rc: string;
  identifier: string;
  type: ContactTypeString;
  isACompany: boolean;
  email: string;
  phones: string[];
  avatar: string | null;
  attachments?: Attachment[];
  attachmentCount: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  list?: ContactList; // Client-side only: list preferences
}

/**
 * Helper function to convert ContactType enum to string
 */
export function contactTypeToString(type: ContactType): ContactTypeString {
  switch (type) {
    case ContactType.Owner:
      return 'Owner';
    case ContactType.Tenant:
      return 'Tenant';
    case ContactType.Service:
      return 'Service';
    default:
      return 'Tenant';
  }
}

/**
 * Helper function to convert string to ContactType enum
 */
export function stringToContactType(type: string): ContactType {
  switch (type) {
    case 'Owner':
      return ContactType.Owner;
    case 'Tenant':
      return ContactType.Tenant;
    case 'Service':
      return ContactType.Service;
    default:
      return ContactType.Tenant;
  }
}

/**
 * Helper function to convert route parameter string to ContactType enum
 * Route params use: 'tenants', 'owners', 'services'
 */
export function routeParamToContactType(param: string): ContactType {
  switch (param) {
    case 'owners':
      return ContactType.Owner;
    case 'tenants':
      return ContactType.Tenant;
    case 'services':
      return ContactType.Service;
    default:
      return ContactType.Tenant;
  }
}

/**
 * Helper function to convert ContactType enum to route parameter string
 * Route params use: 'tenants', 'owners', 'services'
 */
export function contactTypeToRouteParam(type: ContactType): string {
  switch (type) {
    case ContactType.Owner:
      return 'owners';
    case ContactType.Tenant:
      return 'tenants';
    case ContactType.Service:
      return 'services';
    default:
      return 'tenants';
  }
}

