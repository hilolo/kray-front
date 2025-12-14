import { LeasingStatus } from './lease.model';

/**
 * Lease list request filter matching backend GetLeasesFilter
 */
export interface LeaseListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  propertyId?: string;
  contactId?: string;
  status?: LeasingStatus;
  isArchived?: boolean;
}

