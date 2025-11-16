/**
 * Request model for listing banks
 */
export interface BankListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  contactId?: string;
}

