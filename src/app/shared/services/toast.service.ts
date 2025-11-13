import { Injectable } from '@angular/core';
import { toast as ngxToast, type ExternalToast } from 'ngx-sonner';

/**
 * Toast service that wraps ngx-sonner with global default durations
 * - Success toasts: 2 seconds (2000ms)
 * - Error toasts: 5 seconds (5000ms)
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly defaultDurations = {
    success: 2000, // 2 seconds
    error: 5000,   // 5 seconds
    info: 4000,    // 4 seconds (default)
    warning: 4000, // 4 seconds
  };

  /**
   * Show a success toast with default 2 second duration
   */
  success(message: string, options?: ExternalToast): void {
    ngxToast.success(message, {
      ...options,
      // Allow override of duration if explicitly provided, otherwise use default
      duration: options?.duration ?? this.defaultDurations.success,
    });
  }

  /**
   * Show an error toast with default 5 second duration
   */
  error(message: string, options?: ExternalToast): void {
    ngxToast.error(message, {
      ...options,
      // Allow override of duration if explicitly provided, otherwise use default
      duration: options?.duration ?? this.defaultDurations.error,
    });
  }

  /**
   * Show an info toast with default 4 second duration
   */
  info(message: string, options?: ExternalToast): void {
    ngxToast.info(message, {
      ...options,
      duration: options?.duration ?? this.defaultDurations.info,
    });
  }

  /**
   * Show a warning toast with default 4 second duration
   */
  warning(message: string, options?: ExternalToast): void {
    ngxToast.warning(message, {
      ...options,
      duration: options?.duration ?? this.defaultDurations.warning,
    });
  }

  /**
   * Show a default toast
   */
  message(message: string, options?: ExternalToast): void {
    ngxToast.message(message, options);
  }

  /**
   * Show a loading toast
   */
  loading(message: string, options?: ExternalToast): void {
    ngxToast.loading(message, options);
  }

  /**
   * Promise toast - shows loading, then success/error based on promise result
   */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): void {
    ngxToast.promise(promise, messages);
  }

  /**
   * Dismiss a toast by ID
   */
  dismiss(toastId?: string | number): void {
    ngxToast.dismiss(toastId);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    ngxToast.dismiss();
  }
}

