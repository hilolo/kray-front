/**
 * Maintenance status enum matching backend MaintenanceStatus
 */
export enum MaintenanceStatus {
  Waiting = 1,
  InProgress = 2,
  Done = 3,
  Cancelled = 4
}

/**
 * Maintenance priority enum matching backend MaintenancePriority
 */
export enum MaintenancePriority {
  Low = 1,
  Medium = 2,
  Urgent = 3
}

/**
 * Maintenance model from backend MaintenanceDto
 */
export interface Maintenance {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyImageUrl: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  companyId: string;
  companyName: string;
  priority: MaintenancePriority | string | number; // Can be enum, string, or number from API
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactImageUrl: string | null;
  status: MaintenanceStatus | string | number; // Can be enum, string, or number from API
  subject: string;
  description: string;
  scheduledDateTime: string; // ISO date string
  createdOn: string; // ISO date string
  lastModifiedOn: string | null; // ISO date string
}

