import { TaskStatus, TaskPriority } from './task.model';

/**
 * Request model for task list endpoint
 * Based on GetTasksFilter from backend
 */
export interface TaskListRequest {
  currentPage: number;
  pageSize: number;
  ignore: boolean;
  searchQuery?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  month?: number;
  year?: number;
  assignedUserId?: string;
  contactId?: string;
  propertyId?: string;
}

