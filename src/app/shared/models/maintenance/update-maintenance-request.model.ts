import { MaintenancePriority, MaintenanceStatus } from './maintenance.model';

/**
 * Request model for updating a maintenance request
 * Based on UpdateMaintenanceDto from backend
 */
export interface UpdateMaintenanceRequest {
  id: string;
  propertyId: string;
  priority: MaintenancePriority;
  contactId: string;
  status: MaintenanceStatus;
  subject: string;
  description: string;
  scheduledDateTime: string; // ISO date string
}

