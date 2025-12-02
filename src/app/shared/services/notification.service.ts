import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { CreateNotificationRequest } from '../models/notification/notification.model';
import type { Notification } from '../models/notification/notification.model';

/**
 * Service for notification-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apiService = inject(ApiService);

  /**
   * Create a new notification
   * POST api/Notification/create
   * @param request Notification creation data
   * @returns Observable of created notification
   */
  create(request: CreateNotificationRequest): Observable<Notification> {
    return this.apiService.post<Notification>('Notification/create', request);
  }
}

