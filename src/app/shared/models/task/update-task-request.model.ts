import type { TaskPriority, TaskStatus } from './task.model';

/**
 * Update task request
 */
export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDateTime: string; // ISO date string
  assignedUserId: string;
  contactId?: string;
  propertyId?: string;
}

