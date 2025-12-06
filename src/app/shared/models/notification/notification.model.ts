/**
 * Notification type enum
 */
export enum NotificationType {
  Email = 0,
  WhatsApp = 1,
}

/**
 * Notification status enum
 */
export enum NotificationStatus {
  Sent = 0,
  Failed = 1,
  Cancelled = 2,
}

/**
 * Create notification request model
 */
export interface CreateNotificationRequest {
  type: NotificationType;
  contacts: string[]; // List of emails or phone numbers
  message: string;
  transactionId: string;
  repeat?: number;
  scheduledSent?: string; // ISO date string
}

/**
 * Notification model from backend
 */
export interface Notification {
  id: string;
  type: NotificationType;
  contacts: string[];
  status: NotificationStatus;
  repeat: number;
  message: string;
  transactionId: string;
  scheduledSent?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}


