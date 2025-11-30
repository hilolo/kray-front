import { Component, inject, signal, OnDestroy } from '@angular/core';
import { ZardAlertDialogRef } from '../alert-dialog/alert-dialog-ref';
import { Z_ALERT_MODAL_DATA } from '../alert-dialog/alert-dialog.service';
import { ZardIconComponent } from '../icon/icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WhatsAppService } from '@shared/services/whatsapp.service';
import { ToastService } from '@shared/services/toast.service';
import { ZardButtonComponent } from '../button/button.component';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

interface WhatsAppQrData {
  qrCodeBase64: string;
  isLoading?: boolean;
  isConnected?: boolean;
}

@Component({
  selector: 'app-whatsapp-qr',
  standalone: true,
  imports: [ZardIconComponent, TranslateModule, ZardButtonComponent],
  templateUrl: './whatsapp-qr.component.html',
})
export class WhatsAppQrComponent implements OnDestroy {
  private readonly data = inject<WhatsAppQrData>(Z_ALERT_MODAL_DATA);
  readonly dialogRef = inject(ZardAlertDialogRef);
  private readonly whatsAppService = inject(WhatsAppService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();
  
  readonly isLoading = signal(this.data?.isLoading ?? false);
  readonly isConnected = signal(this.data?.isConnected ?? false);
  readonly qrCodeBase64 = signal(this.data?.qrCodeBase64 || '');
  readonly isDisconnecting = signal(false);
  
  /**
   * Update loading state
   */
  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }
  
  /**
   * Update connected state
   */
  setConnected(connected: boolean): void {
    this.isConnected.set(connected);
  }

  /**
   * Disconnect WhatsApp
   */
  disconnect(): void {
    if (this.isDisconnecting()) {
      return;
    }

    this.isDisconnecting.set(true);

    this.whatsAppService.disconnect()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(this.translateService.instant('whatsapp.disconnect.success'));
          this.setConnected(false);
          this.isDisconnecting.set(false);
          
          // Immediately check status after disconnect
          this.whatsAppService.getStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (status) => {
                const isConnected = status.instance?.state === 'open';
                this.setConnected(isConnected);
              },
              error: (error) => {
                console.error('Error checking status after disconnect:', error);
                // Assume disconnected on error
                this.setConnected(false);
              }
            });
          
          // Close the dialog after a short delay
          setTimeout(() => {
            if (this.dialogRef) {
              this.dialogRef.close();
            }
          }, 1000);
        },
        error: (error) => {
          console.error('Error disconnecting WhatsApp:', error);
          this.toastService.error(this.translateService.instant('whatsapp.disconnect.error'));
          this.isDisconnecting.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

