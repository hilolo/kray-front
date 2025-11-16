import type { TaskPriority, TaskStatus } from './task.model';

/**
 * Create task request
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus; // Optional, defaults to ToDo
  priority: TaskPriority;
  scheduledDateTime: string; // ISO date string
  assignedUserId: string;
  contactId?: string;
  propertyId?: string;
}

