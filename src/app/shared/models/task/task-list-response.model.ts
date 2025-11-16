import type { Task } from './task.model';

/**
 * Paginated task list response
 */
export interface TaskListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  result: Task[];
}

