import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password reset service
 * Handles forgot password and reset password functionality
 */
@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private readonly apiService = inject(ApiService);

  /**
   * Request password reset
   * POST /api/user/forgot-password
   */
  forgotPassword(email: string): Observable<any> {
    return this.apiService.post('user/forgot-password', { email });
  }

  /**
   * Reset password with token
   * POST /api/user/reset-password
   */
  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.apiService.post('user/reset-password', {
      token,
      newPassword,
      confirmPassword,
    });
  }
}

