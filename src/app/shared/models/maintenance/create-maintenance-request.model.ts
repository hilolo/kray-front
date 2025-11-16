import { MaintenancePriority, MaintenanceStatus } from './maintenance.model';

/**
 * Request model for creating a maintenance request
 * Based on CreateMaintenanceDto from backend
 */
export interface CreateMaintenanceRequest {
  propertyId: string;
  companyId?: string;
  priority: MaintenancePriority;
  contactId: string;
  status: MaintenanceStatus;
  subject: string;
  description: string;
  scheduledDateTime: string; // ISO date string
}

