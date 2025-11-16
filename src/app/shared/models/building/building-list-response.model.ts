import type { Building } from './building.model';
import type { ApiResponse } from '../api/api-response.model';

/**
 * Building list response model
 */
export interface BuildingListResponse extends ApiResponse<Building> {
  result: Building[];
  totalPages: number;
  totalItems: number;
}

