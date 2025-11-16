/**
 * Request model for task list endpoint
 * Based on GetTasksFilter from backend
 */
export interface TaskListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  month?: number;
  year?: number;
  assignedUserId?: string;
  contactId?: string;
  propertyId?: string;
}

