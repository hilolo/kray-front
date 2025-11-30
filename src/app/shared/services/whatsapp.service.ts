import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { WhatsAppStatus } from '../models/whatsapp/whatsapp-status.model';
import type { WhatsAppConnect } from '../models/whatsapp/whatsapp-status.model';
import type { WhatsAppNumbersResponse } from '../models/whatsapp/whatsapp-status.model';

/**
 * Service for WhatsApp-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class WhatsAppService {
  private readonly apiService = inject(ApiService);

  /**
   * Get the connection status of the WhatsApp instance for the current company
   * GET api/WhatsApp/status
   * @returns Observable of WhatsApp status (open/close)
   */
  getStatus(): Observable<WhatsAppStatus> {
    return this.apiService.get<WhatsAppStatus>('WhatsApp/status');
  }

  /**
   * Connect the WhatsApp instance for the current company
   * GET api/WhatsApp/connect
   * @returns Observable of WhatsApp connect response with QR code
   */
  connect(): Observable<WhatsAppConnect> {
    return this.apiService.get<WhatsAppConnect>('WhatsApp/connect');
  }

  /**
   * Disconnect/Logout the WhatsApp instance for the current company
   * DELETE api/WhatsApp/logout
   * @returns Observable of void
   */
  disconnect(): Observable<void> {
    return this.apiService.delete<void>('WhatsApp/logout');
  }

  /**
   * Send WhatsApp numbers to check if they have WhatsApp
   * POST api/WhatsApp/send-numbers
   * @param numbers Array of phone numbers to check
   * @returns Observable of response with check results
   */
  sendWhatsAppNumbers(numbers: string[]): Observable<WhatsAppNumbersResponse> {
    return this.apiService.post<WhatsAppNumbersResponse>('WhatsApp/send-numbers', { numbers });
  }
}

