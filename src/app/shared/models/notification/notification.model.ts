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
  Pending = 0,
  Sent = 1,
  Failed = 2,
  Cancelled = 3,
}

/**
 * Create notification request model
 */
export interface CreateNotificationRequest {
  type: NotificationType;
  contacts: string[]; // List of emails or phone numbers
  message: string;
  transactionId?: string; // Optional - for transaction-based notifications
  reservationId?: string; // Optional - for reservation-based notifications (booking receipt)
  repeat?: number;
  scheduledSent?: string; // ISO date string
  file?: string; // Base64 encoded receipt PDF
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
  sentAt?: string; // ISO date string - when notification was sent
  file?: string; // Base64 encoded receipt PDF
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}


