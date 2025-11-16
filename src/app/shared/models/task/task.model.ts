/**
 * Task Priority enum
 */
export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

/**
 * Task Status enum
 */
export enum TaskStatus {
  ToDo = 1,
  InProgress = 2,
  Completed = 3,
}

/**
 * Task model from backend
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDateTime: string; // ISO date string
  assignedUserId: string;
  assignedUserName?: string;
  contactId?: string;
  contactName?: string;
  contactIdentifier?: string; // Contact reference/identifier (for future backend support)
  propertyId?: string;
  propertyName?: string;
  propertyIdentifier?: string; // Property identifier/reference
  propertyAddress?: string; // Property address
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

