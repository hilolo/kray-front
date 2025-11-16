import { MaintenancePriority, MaintenanceStatus } from './maintenance.model';

/**
 * Request model for maintenance list endpoint
 * Based on GetMaintenancesFilter from backend
 */
export interface MaintenanceListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  propertyId?: string;
  contactId?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

