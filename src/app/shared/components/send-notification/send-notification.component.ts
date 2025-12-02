import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Z_MODAL_DATA } from '../dialog/dialog.service';
import { ZardDialogRef } from '../dialog/dialog-ref';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '../form/form.component';
import { ZardInputDirective } from '../input/input.directive';
import { ZardInputGroupComponent } from '../input-group/input-group.component';
import { NotificationService } from '@shared/services/notification.service';
import { WhatsAppService } from '@shared/services/whatsapp.service';
import { ToastService } from '@shared/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationType } from '@shared/models/notification/notification.model';
import { Subject, takeUntil } from 'rxjs';

interface SendNotificationData {
  transactionId: string;
}

@Component({
  selector: 'app-send-notification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardButtonComponent,
    ZardIconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardInputGroupComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './send-notification.component.html',
})
export class SendNotificationComponent implements OnInit, OnDestroy {
  private readonly dialogData = inject<SendNotificationData>(Z_MODAL_DATA);
  readonly dialogRef = inject(ZardDialogRef);
  private readonly notificationService = inject(NotificationService);
  private readonly whatsAppService = inject(WhatsAppService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  readonly NotificationType = NotificationType;

  readonly selectedType = signal<NotificationType | null>(null);
  readonly isWhatsAppAvailable = signal<boolean | null>(null);
  readonly checkingWhatsAppStatus = signal(false);
  readonly contacts = signal<string[]>(['']);
  readonly message = signal<string>('');
  readonly isSending = signal(false);

  readonly transactionId = this.dialogData?.transactionId || '';

  ngOnInit(): void {
    this.checkWhatsAppStatus();
  }

  /**
   * Check WhatsApp service status
   */
  checkWhatsAppStatus(): void {
    this.checkingWhatsAppStatus.set(true);
    this.whatsAppService.getStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          const isConnected = status.instance?.state === 'open';
          this.isWhatsAppAvailable.set(isConnected);
          this.checkingWhatsAppStatus.set(false);
        },
        error: (error) => {
          console.error('Error checking WhatsApp status:', error);
          this.isWhatsAppAvailable.set(false);
          this.checkingWhatsAppStatus.set(false);
        }
      });
  }

  /**
   * Handle notification type selection
   */
  onTypeChange(type: NotificationType): void {
    this.selectedType.set(type);
    // Reset contacts when type changes
    this.contacts.set(['']);
  }

  /**
   * Add a new contact field
   */
  addContact(): void {
    const current = this.contacts();
    this.contacts.set([...current, '']);
  }

  /**
   * Remove a contact field
   */
  removeContact(index: number): void {
    const current = this.contacts();
    if (current.length > 1) {
      this.contacts.set(current.filter((_, i) => i !== index));
    }
  }

  /**
   * Update contact value
   */
  updateContact(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target?.value || '';
    const current = this.contacts();
    const updated = [...current];
    updated[index] = value;
    this.contacts.set(updated);
  }

  /**
   * Update message value
   */
  updateMessage(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const value = target?.value || '';
    this.message.set(value);
  }

  /**
   * Get filtered contacts (remove empty ones)
   */
  getValidContacts(): string[] {
    return this.contacts().filter(c => c.trim().length > 0);
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    if (!this.selectedType()) return false;
    if (this.getValidContacts().length === 0) return false;
    if (!this.message().trim()) return false;
    return true;
  }

  /**
   * Send notification
   */
  sendNotification(): void {
    if (!this.isFormValid() || this.isSending()) {
      return;
    }

    const type = this.selectedType();
    if (type === null) return;

    const validContacts = this.getValidContacts();
    if (validContacts.length === 0) {
      this.toastService.error(this.translateService.instant('notification.error.noContacts'));
      return;
    }

    this.isSending.set(true);

    const request = {
      type,
      contacts: validContacts,
      message: this.message(),
      transactionId: this.transactionId,
      repeat: 1,
    };

    this.notificationService.create(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(this.translateService.instant('notification.success.sent'));
          this.dialogRef.close({ success: true });
        },
        error: (error: any) => {
          console.error('Error sending notification:', error);
          const errorMessage = error?.error?.message || error?.message || this.translateService.instant('notification.error.sendFailed');
          this.toastService.error(errorMessage);
          this.isSending.set(false);
        }
      });
  }

  /**
   * Close dialog
   */
  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

