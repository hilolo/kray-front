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
import { TransactionService } from '@shared/services/transaction.service';
import { ContactService } from '@shared/services/contact.service';
import { Contact } from '@shared/models/contact/contact.model';
import { PdfGenerationService } from '@shared/services/pdf-generation.service';
import { Transaction, TransactionType, RevenueType, ExpenseType, TransactionStatus } from '@shared/models/transaction/transaction.model';
import { Subject, takeUntil } from 'rxjs';
import { DocumentType } from '@shared/services/document.service';

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
  private readonly transactionService = inject(TransactionService);
  private readonly contactService = inject(ContactService);
  private readonly pdfGenerationService = inject(PdfGenerationService);
  private readonly destroy$ = new Subject<void>();

  readonly NotificationType = NotificationType;

  readonly selectedType = signal<NotificationType | null>(null);
  readonly isWhatsAppAvailable = signal<boolean | null>(null);
  readonly checkingWhatsAppStatus = signal(false);
  readonly contacts = signal<string[]>(['']);
  readonly isSending = signal(false);
  readonly isContactFieldDisabled = signal(false);
  readonly isLoadingContact = signal(false);
  readonly loadedContact = signal<Contact | null>(null);
  readonly transactionContactIndices = signal<Set<number>>(new Set());
  readonly whatsAppErrors = signal<Map<number, string>>(new Map());

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
    // Reset transaction contact indices
    this.transactionContactIndices.set(new Set());
    // Clear WhatsApp errors when changing type
    this.whatsAppErrors.set(new Map());
    // Load contact information from transaction
    this.loadTransactionContact(type);
  }

  /**
   * Load contact information from transaction and populate contacts field
   */
  private loadTransactionContact(type: NotificationType): void {
    if (!this.transactionId) {
      this.contacts.set(['']);
      this.isContactFieldDisabled.set(false);
      this.transactionContactIndices.set(new Set());
      this.loadedContact.set(null);
      return;
    }

    this.isLoadingContact.set(true);
    this.transactionService.getById(this.transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transaction) => {
          if (transaction.contactId) {
            this.contactService.getById(transaction.contactId, false)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (contact) => {
                  this.loadedContact.set(contact);
                  this.populateContactFields(contact, type);
                  this.isLoadingContact.set(false);
                },
                error: (error) => {
                  console.error('Error loading contact:', error);
                  this.contacts.set(['']);
                  this.isContactFieldDisabled.set(false);
                  this.transactionContactIndices.set(new Set());
                  this.loadedContact.set(null);
                  this.isLoadingContact.set(false);
                }
              });
          } else {
            // No contact ID, reset to empty
            this.contacts.set(['']);
            this.isContactFieldDisabled.set(false);
            this.transactionContactIndices.set(new Set());
            this.loadedContact.set(null);
            this.isLoadingContact.set(false);
          }
        },
        error: (error) => {
          console.error('Error loading transaction:', error);
          this.contacts.set(['']);
          this.isContactFieldDisabled.set(false);
          this.transactionContactIndices.set(new Set());
          this.loadedContact.set(null);
          this.isLoadingContact.set(false);
        }
      });
  }

  /**
   * Populate contact fields based on notification type
   */
  private populateContactFields(contact: Contact, type: NotificationType): void {
    if (type === NotificationType.Email) {
      // For email, use the contact's email
      if (contact.email && contact.email.trim()) {
        this.contacts.set([contact.email]);
        this.transactionContactIndices.set(new Set([0]));
        this.isContactFieldDisabled.set(true);
      } else {
        this.contacts.set(['']);
        this.transactionContactIndices.set(new Set());
        this.isContactFieldDisabled.set(false);
        this.loadedContact.set(null);
      }
    } else if (type === NotificationType.WhatsApp) {
      // For WhatsApp, use the contact's phone numbers
      if (contact.phones && contact.phones.length > 0) {
        // Filter out empty phone numbers
        const validPhones = contact.phones.filter((phone: string) => phone && phone.trim());
        if (validPhones.length > 0) {
          this.contacts.set(validPhones);
          // Mark all phone numbers from transaction as disabled
          const indices = new Set(validPhones.map((_, index) => index));
          this.transactionContactIndices.set(indices);
          this.isContactFieldDisabled.set(true);
        } else {
          this.contacts.set(['']);
          this.transactionContactIndices.set(new Set());
          this.isContactFieldDisabled.set(false);
          this.loadedContact.set(null);
        }
      } else {
        this.contacts.set(['']);
        this.transactionContactIndices.set(new Set());
        this.isContactFieldDisabled.set(false);
        this.loadedContact.set(null);
      }
    }
  }

  /**
   * Get contact name for display
   */
  getContactName(): string {
    const contact = this.loadedContact();
    if (!contact) return '';
    if (contact.isACompany) {
      return contact.companyName || '';
    }
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  }

  /**
   * Check if a contact field is from the transaction (should be disabled)
   */
  isContactFromTransaction(index: number): boolean {
    return this.transactionContactIndices().has(index);
  }

  /**
   * Add a new contact field
   */
  addContact(): void {
    const current = this.contacts();
    this.contacts.set([...current, '']);
    // New contacts are not from transaction, so they're editable
  }

  /**
   * Remove a contact field
   */
  removeContact(index: number): void {
    const current = this.contacts();
    const transactionIndices = this.transactionContactIndices();
    
    // Don't allow removing if it's the only transaction contact
    if (transactionIndices.has(index) && transactionIndices.size === 1 && current.length === 1) {
      return;
    }
    
    if (current.length > 1) {
      // Remove the contact
      const newContacts = current.filter((_, i) => i !== index);
      this.contacts.set(newContacts);
      
      // Update transaction contact indices (shift indices after the removed one)
      const newIndices = new Set<number>();
      transactionIndices.forEach((idx) => {
        if (idx < index) {
          newIndices.add(idx);
        } else if (idx > index) {
          newIndices.add(idx - 1);
        }
        // Skip the removed index
      });
      this.transactionContactIndices.set(newIndices);
      
      // If no transaction contacts remain, clear the disabled state
      if (newIndices.size === 0) {
        this.isContactFieldDisabled.set(false);
        this.loadedContact.set(null);
      }
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
    
    // Clear WhatsApp error for this field when user edits it
    const errors = this.whatsAppErrors();
    if (errors.has(index)) {
      const newErrors = new Map(errors);
      newErrors.delete(index);
      this.whatsAppErrors.set(newErrors);
    }
  }

  /**
   * Get filtered contacts (remove empty ones)
   */
  getValidContacts(): string[] {
    return this.contacts().filter(c => c.trim().length > 0);
  }

  /**
   * Get error message for a contact field
   */
  getContactErrorMessage(index: number): string {
    // Check for WhatsApp verification errors first
    const whatsAppError = this.whatsAppErrors().get(index);
    if (whatsAppError) {
      return whatsAppError;
    }
    
    const contact = this.contacts()[index];
    if (!contact || !contact.trim()) {
      return '';
    }
    
    if (this.selectedType() === NotificationType.Email) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        return this.translateService.instant('notification.error.invalidEmail') || 'Invalid email address';
      }
    } else if (this.selectedType() === NotificationType.WhatsApp) {
      // Basic phone validation (at least 8 digits)
      const phoneRegex = /^[\d\s\+\-\(\)]{8,}$/;
      if (!phoneRegex.test(contact.replace(/\s/g, ''))) {
        return this.translateService.instant('notification.error.invalidPhone') || 'Invalid phone number';
      }
    }
    
    return '';
  }

  /**
   * Get help text for a contact field
   */
  getContactHelpText(index: number): string {
    // Don't show help text if there's an error (including WhatsApp errors)
    if (this.getContactErrorMessage(index)) {
      return '';
    }
    // Don't show help text for transaction contacts
    if (this.isContactFromTransaction(index)) {
      return '';
    }
    // Don't show help text if field is empty
    const contact = this.contacts()[index];
    if (!contact || !contact.trim()) {
      return '';
    }
    // Only show help text if field has value and no errors
    return '';
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    const selectedType = this.selectedType();
    const validContacts = this.getValidContacts();
    const allContacts = this.contacts();
    
    console.log('[Notification] [Validation] Checking form validity', {
      selectedType: selectedType !== null ? (selectedType === NotificationType.Email ? 'Email' : 'WhatsApp') : 'null',
      selectedTypeValue: selectedType,
      validContactsCount: validContacts.length,
      validContacts: validContacts,
      allContactsCount: allContacts.length,
      allContacts: allContacts
    });
    
    // Check for null explicitly (not falsy, because 0 is a valid enum value for Email)
    if (selectedType === null) {
      console.log('[Notification] [Validation] Failed: No notification type selected');
      return false;
    }
    
    if (validContacts.length === 0) {
      console.log('[Notification] [Validation] Failed: No valid contacts found', {
        allContacts: allContacts,
        filteredContacts: validContacts
      });
      return false;
    }
    
    // Check if any contacts have validation errors (email format, etc.)
    const hasErrors = allContacts.some((contact, index) => {
      const error = this.getContactErrorMessage(index);
      return error && error.length > 0;
    });
    
    if (hasErrors) {
      console.log('[Notification] [Validation] Failed: Some contacts have validation errors');
      return false;
    }
    
    console.log('[Notification] [Validation] Form is valid');
    return true;
  }

  /**
   * Send notification
   */
  sendNotification(): void {
    console.log('[Notification] Send notification called');
    
    const isValid = this.isFormValid();
    const isCurrentlySending = this.isSending();
    
    if (!isValid || isCurrentlySending) {
      console.log('[Notification] Form validation failed or already sending', {
        isValid: isValid,
        isSending: isCurrentlySending,
        selectedType: this.selectedType(),
        contacts: this.contacts(),
        validContacts: this.getValidContacts()
      });
      return;
    }

    const type = this.selectedType();
    if (type === null) {
      console.error('[Notification] No notification type selected');
      return;
    }

    const validContacts = this.getValidContacts();
    if (validContacts.length === 0) {
      console.error('[Notification] No valid contacts found');
      this.toastService.error(this.translateService.instant('notification.error.noContacts'));
      return;
    }

    console.log('[Notification] Starting notification send', {
      type: type === NotificationType.Email ? 'Email' : 'WhatsApp',
      contactsCount: validContacts.length,
      contacts: validContacts,
      transactionId: this.transactionId
    });

    this.isSending.set(true);

    // If WhatsApp, verify all numbers first
    if (type === NotificationType.WhatsApp) {
      console.log('[Notification] WhatsApp type selected - verifying numbers');
      this.verifyWhatsAppNumbers(validContacts);
    } else {
      // For email, send directly
      console.log('[Notification] Email type selected - sending directly');
      this.sendNotificationRequest(validContacts, type);
    }
  }

  /**
   * Verify WhatsApp numbers before sending
   */
  private verifyWhatsAppNumbers(numbers: string[]): void {
    console.log('[Notification] [WhatsApp] Starting number verification', { numbers });
    
    // Clear previous errors
    this.whatsAppErrors.set(new Map());
    
    this.whatsAppService.sendWhatsAppNumbers(numbers)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[Notification] [WhatsApp] Verification response received:', response);
          
          // ApiService returns response.data if it exists, so response is { content: [...] }
          // But handle both cases just in case
          const content = (response as any)?.content || (response as any)?.data?.content || [];
          
          console.log('[Notification] [WhatsApp] Verification content:', content);
          
          if (!Array.isArray(content) || content.length === 0) {
            console.error('[Notification] [WhatsApp] Invalid response structure or empty content');
            this.toastService.error(this.translateService.instant('notification.error.verifyFailed') || 'Failed to verify WhatsApp numbers');
            this.isSending.set(false);
            return;
          }
          
          // Create a map of errors per contact index
          const errors = new Map<number, string>();
          const currentContacts = this.contacts();
          
          // Verify we got results for all numbers
          if (content.length !== numbers.length) {
            console.error('[Notification] [WhatsApp] Response length mismatch. Expected:', numbers.length, 'Got:', content.length);
            this.toastService.error(this.translateService.instant('notification.error.verifyFailed') || 'Failed to verify all WhatsApp numbers');
            this.isSending.set(false);
            return;
          }

          console.log('[Notification] [WhatsApp] Processing verification results for', content.length, 'numbers');

          // Match response numbers to the numbers we sent, then find the corresponding contact index
          content.forEach((check: any, responseIndex: number) => {
            console.log('[Notification] [WhatsApp] Checking number:', check.number, 'exists:', check.exists, 'responseIndex:', responseIndex);
            if (!check.exists) {
              // First, find which number in the sent array matches this response
              const sentNumberIndex = numbers.findIndex(sentNumber => {
                // Normalize both numbers for comparison (remove spaces, +, etc.)
                const normalizedSent = sentNumber.replace(/[\s\+\-\(\)]/g, '');
                const normalizedCheck = check.number.replace(/[\s\+\-\(\)]/g, '');
                const matches = normalizedSent === normalizedCheck || 
                              normalizedSent.endsWith(normalizedCheck) || 
                              normalizedCheck.endsWith(normalizedSent);
                return matches;
              });
              
              console.log('[Notification] [WhatsApp] Sent number index for', check.number, ':', sentNumberIndex);
              
              if (sentNumberIndex !== -1) {
                // Now find the corresponding contact index
                const sentNumber = numbers[sentNumberIndex];
                const contactIndex = currentContacts.findIndex(contact => {
                  // Normalize both for comparison
                  const normalizedContact = contact.replace(/[\s\+\-\(\)]/g, '');
                  const normalizedSent = sentNumber.replace(/[\s\+\-\(\)]/g, '');
                  return normalizedContact === normalizedSent || 
                         normalizedContact.endsWith(normalizedSent) || 
                         normalizedSent.endsWith(normalizedContact);
                });
                
                console.log('[Notification] [WhatsApp] Contact index for number', check.number, ':', contactIndex);
                
                if (contactIndex !== -1) {
                  errors.set(contactIndex, this.translateService.instant('notification.error.numberWithoutWhatsApp') || 'This number does not have WhatsApp');
                } else {
                  // Fallback: use the same index as in the numbers array if contacts match
                  if (sentNumberIndex < currentContacts.length) {
                    errors.set(sentNumberIndex, this.translateService.instant('notification.error.numberWithoutWhatsApp') || 'This number does not have WhatsApp');
                  }
                }
              } else {
                // If we can't match, use response index as fallback
                console.warn('Could not find sent number for response:', check.number);
                if (responseIndex < currentContacts.length) {
                  errors.set(responseIndex, this.translateService.instant('notification.error.numberWithoutWhatsApp') || 'This number does not have WhatsApp');
                }
              }
            }
          });

          console.log('[Notification] [WhatsApp] Verification complete. Errors found:', errors.size, 'out of', content.length, 'numbers checked');

          // CRITICAL: Do not send if ANY number doesn't have WhatsApp
          if (errors.size > 0) {
            // Some numbers don't have WhatsApp - show errors under each field
            console.warn('[Notification] [WhatsApp] BLOCKED: Not sending notification due to verification errors:', errors);
            this.whatsAppErrors.set(errors);
            this.isSending.set(false);
            // DO NOT send notification - return early
            return;
          }
          
          // Only send if ALL numbers have WhatsApp
          console.log('[Notification] [WhatsApp] All numbers verified successfully, proceeding to send notification');
          this.sendNotificationRequest(numbers, NotificationType.WhatsApp);
        },
        error: (error: any) => {
          console.error('[Notification] [WhatsApp] Error verifying WhatsApp numbers:', error);
          console.error('[Notification] [WhatsApp] Error details:', {
            status: error?.status,
            statusText: error?.statusText,
            error: error?.error,
            message: error?.message
          });
          const errorMessage = error?.error?.message || error?.message || this.translateService.instant('notification.error.verifyFailed') || 'Failed to verify WhatsApp numbers';
          this.toastService.error(errorMessage);
          this.isSending.set(false);
        }
      });
  }

  /**
   * Generate receipt PDF base64 for the transaction
   */
  private async generateReceiptBase64(transaction: Transaction): Promise<string | null> {
    try {
      console.log('[Notification] Generating receipt for transaction:', transaction.id);
      
      let receiptObservable: any;
      
      // Determine which receipt to generate based on transaction type
      const transactionType = transaction.type ?? transaction.category;
      
      // Pass true to use PdfmakeNotification instead of Pdfmake for notifications
      const isNotification = true;
      
      if (transactionType === TransactionType.Revenue) {
        if (transaction.revenueType === RevenueType.Loyer) {
          receiptObservable = this.transactionService.generateReceipt(transaction.id, DocumentType.Lease, isNotification);
        } else if (transaction.revenueType === RevenueType.Caution) {
          receiptObservable = this.transactionService.generateReceipt(transaction.id, DocumentType.Deposit, isNotification);
        } else if (transaction.revenueType === RevenueType.FraisAgence) {
          receiptObservable = this.transactionService.generateReceipt(transaction.id, DocumentType.Fees, isNotification);
        } else if (transaction.revenueType === RevenueType.Maintenance) {
          receiptObservable = this.transactionService.generateReceipt(transaction.id, DocumentType.Maintenance, isNotification);
        } else {
          console.log('[Notification] No receipt type available for revenue type:', transaction.revenueType);
          return null;
        }
      } else if (transactionType === TransactionType.Expense) {
        if (transaction.expenseType === ExpenseType.Maintenance) {
          receiptObservable = this.transactionService.generateReceipt(transaction.id, DocumentType.Maintenance, isNotification);
        } else {
          console.log('[Notification] No receipt type available for expense type:', transaction.expenseType);
          return null;
        }
      } else {
        console.log('[Notification] No receipt type available for transaction type:', transactionType);
        return null;
      }

      if (!receiptObservable) {
        return null;
      }

      // Get PDFMake JSON from backend
      const pdfMakeData = await receiptObservable.pipe(takeUntil(this.destroy$)).toPromise();
      
      // Handle response format (may be wrapped in data property)
      let dataToProcess: any = pdfMakeData;
      if (typeof pdfMakeData === 'object' && pdfMakeData !== null && 'data' in pdfMakeData) {
        dataToProcess = (pdfMakeData as any).data;
      }

      // Parse PDFMake JSON if needed
      let pdfMakeJson: any;
      if (typeof dataToProcess === 'string') {
        pdfMakeJson = JSON.parse(dataToProcess);
      } else if (typeof dataToProcess === 'object' && dataToProcess !== null) {
        pdfMakeJson = dataToProcess;
      } else {
        throw new Error('Invalid PDFMake data format');
      }

      // Validate PDFMake structure
      if (!pdfMakeJson || (!pdfMakeJson.content && !pdfMakeJson.text)) {
        throw new Error('PDFMake data is missing required content property');
      }

      // Convert PDFMake JSON to PDF data URL
      const pdfResult = await this.pdfGenerationService.generatePdfFromJson(pdfMakeJson);
      
      // Extract base64 from data URL (remove "data:application/pdf;base64," prefix)
      const base64Receipt = pdfResult.dataUrl.split(',')[1];
      
      console.log('[Notification] Receipt generated successfully, base64 length:', base64Receipt?.length);
      return base64Receipt;
    } catch (error: any) {
      console.error('[Notification] Error generating receipt:', error);
      // Don't fail the notification if receipt generation fails
      return null;
    }
  }

  /**
   * Send the notification request
   */
  private async sendNotificationRequest(contacts: string[], type: NotificationType): Promise<void> {
    const notificationType = type === NotificationType.Email ? 'Email' : 'WhatsApp';
    console.log(`[Notification] [${notificationType}] Preparing to send notification request`);
    
    // Filter out empty contacts before sending
    const validContacts = contacts.filter(c => c && c.trim().length > 0);
    
    if (validContacts.length === 0) {
      console.error(`[Notification] [${notificationType}] No valid contacts provided after filtering`);
      this.toastService.error(this.translateService.instant('notification.error.noContacts') || 'No valid contacts provided');
      this.isSending.set(false);
      return;
    }

    // Get transaction to generate receipt (for Paid Loyer transactions and all Maintenance transactions)
    let receiptBase64: string | null = null;
    try {
      const transaction = await this.transactionService.getById(this.transactionId).pipe(takeUntil(this.destroy$)).toPromise();
      if (transaction) {
        const transactionType = transaction.type ?? transaction.category;
        const isLoyer = transactionType === TransactionType.Revenue && transaction.revenueType === RevenueType.Loyer;
        const isMaintenanceRevenue = transactionType === TransactionType.Revenue && transaction.revenueType === RevenueType.Maintenance;
        const isMaintenanceExpense = transactionType === TransactionType.Expense && transaction.expenseType === ExpenseType.Maintenance;
        const isMaintenance = isMaintenanceRevenue || isMaintenanceExpense;
        const isPaid = transaction.status === TransactionStatus.Paid;
        
        // Generate receipt for:
        // 1. Paid Loyer transactions
        // 2. All Maintenance transactions (regardless of status - they always need the receipt)
        if ((isLoyer && isPaid) || isMaintenance) {
          receiptBase64 = await this.generateReceiptBase64(transaction);
        } else {
          console.log('[Notification] Skipping receipt generation', {
            isLoyer,
            isPaid,
            isMaintenance,
            status: transaction.status,
            revenueType: transaction.revenueType,
            expenseType: transaction.expenseType
          });
        }
      }
    } catch (error) {
      console.error('[Notification] Error fetching transaction for receipt generation:', error);
      // Continue without receipt if transaction fetch fails
    }

    const request = {
      type,
      contacts: validContacts,
      message: '',
      transactionId: this.transactionId,
      file: receiptBase64 || undefined, // Base64 receipt PDF
    };

    console.log(`[Notification] [${notificationType}] Sending notification request:`, {
      type: notificationType,
      contactsCount: validContacts.length,
      contacts: validContacts,
      transactionId: this.transactionId,
      hasReceipt: !!receiptBase64
    });

    this.notificationService.create(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log(`[Notification] [${notificationType}] Notification created successfully:`, response);
          
          // Show type-specific success message
          const successKey = type === NotificationType.Email 
            ? 'notification.success.emailSent' 
            : 'notification.success.whatsappSent';
          const successMessage = this.translateService.instant(successKey) || 
            (type === NotificationType.Email 
              ? 'Email notification sent successfully' 
              : 'WhatsApp notification sent successfully');
          
          this.toastService.success(successMessage);
          this.dialogRef.close({ success: true });
        },
        error: (error: any) => {
          console.error(`[Notification] [${notificationType}] Error sending notification:`, error);
          console.error(`[Notification] [${notificationType}] Error details:`, {
            status: error?.status,
            statusText: error?.statusText,
            error: error?.error,
            message: error?.message,
            url: error?.url,
            request: request
          });
          const errorMessage = error?.error?.message || error?.error?.errors || error?.message || this.translateService.instant('notification.error.sendFailed') || 'Failed to send notification';
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

