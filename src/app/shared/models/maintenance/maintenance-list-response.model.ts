import { Maintenance } from './maintenance.model';

/**
 * Paginated maintenance list response
 */
export interface MaintenanceListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  result: Maintenance[];
}

