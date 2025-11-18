import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardDatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { ZardFileViewerComponent } from '@shared/components/file-viewer/file-viewer.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ImageItem } from '@shared/image-viewer/image-viewer.component';
import { getFileViewerType } from '@shared/utils/file-type.util';
import { AttachmentInput } from '@shared/models/contact/create-contact-request.model';
import { TransactionService } from '@shared/services/transaction.service';
import { PropertyService } from '@shared/services/property.service';
import { LeaseService } from '@shared/services/lease.service';
import { ContactService } from '@shared/services/contact.service';
import { ToastService } from '@shared/services/toast.service';
import { UserService } from '@shared/services/user.service';
import { TransactionType, RevenueType, Payment } from '@shared/models/transaction/transaction.model';
import { CreateTransactionRequest } from '@shared/models/transaction/create-transaction-request.model';
import type { Property } from '@shared/models/property/property.model';
import { PropertyCategory } from '@shared/models/property/property.model';
import type { Lease } from '@shared/models/lease/lease.model';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  file: File;
}

@Component({
  selector: 'app-add-revenue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputGroupComponent,
    ZardComboboxComponent,
    ZardCardComponent,
    ZardDatePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-revenue.component.html',
})
export class AddRevenueComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private readonly propertyService = inject(PropertyService);
  private readonly leaseService = inject(LeaseService);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly TransactionType = TransactionType;
  readonly RevenueType = RevenueType;

  // Form data
  readonly payments = signal<Payment[]>([
    { amount: 0, vatPercent: 0, description: '' }
  ]);

  readonly formData = signal({
    propertyId: '',
    leaseId: '',
    revenueType: RevenueType.Loyer,
    contactId: '',
    date: new Date(),
    description: '',
  });

  readonly formSubmitted = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingProperties = signal(false);
  readonly isLoadingLeases = signal(false);
  readonly isLoadingContacts = signal(false);

  readonly properties = signal<Property[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly leases = signal<Lease[]>([]);
  readonly leaseOptions = signal<ZardComboboxOption[]>([]);
  readonly contacts = signal<Contact[]>([]);
  readonly contactOptions = signal<ZardComboboxOption[]>([]);

  readonly selectedProperty = signal<Property | null>(null);

  // File upload
  readonly uploadedFiles = signal<UploadedFile[]>([]);
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  // File viewer
  readonly fileViewerOpen = signal(false);
  readonly fileViewerUrl = signal<string>('');
  readonly fileViewerName = signal<string>('');
  readonly fileViewerSize = signal<number>(0);
  readonly fileViewerImages = signal<ImageItem[]>([]);
  readonly fileViewerCurrentIndex = signal<number>(0);

  readonly hasUploadedFiles = computed(() => this.uploadedFiles().length > 0);
  readonly uploadedFilesSize = computed(() => {
    return this.uploadedFiles().reduce((total, file) => total + file.size, 0);
  });

  // Revenue type options
  readonly revenueTypeOptions: ZardComboboxOption[] = [
    { value: RevenueType.Loyer.toString(), label: 'Loyer' },
    { value: RevenueType.Caution.toString(), label: 'Caution' },
    { value: RevenueType.FraisAgence.toString(), label: 'Frais d\'agence' },
    { value: RevenueType.ReservationPart.toString(), label: 'Reservation Part' },
    { value: RevenueType.ReservationFull.toString(), label: 'Reservation Full' },
    { value: RevenueType.Maintenance.toString(), label: 'Maintenance' },
    { value: RevenueType.Autre.toString(), label: 'Autre' },
  ];

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    const payments = this.payments();
    return (
      data.contactId !== '' &&
      data.date !== null &&
      payments.length > 0 &&
      payments.every(p => p.amount > 0)
    );
  });

  readonly propertyIdError = computed(() => {
    // Property is optional, no error
    return '';
  });

  readonly contactIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    if (!this.formData().contactId || this.formData().contactId === '') {
      return 'From (contact) is required';
    }
    return '';
  });

  readonly propertyIdHasError = computed(() => {
    // Property is optional, no error
    return false;
  });

  readonly contactIdHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().contactId || this.formData().contactId === '');
  });

  readonly totalAmount = computed(() => {
    return this.payments().reduce((sum, payment) => {
      const amountWithVat = payment.amount * (1 + payment.vatPercent / 100);
      return sum + amountWithVat;
    }, 0);
  });

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.loadProperties();
      this.loadContacts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperties(): void {
    this.isLoadingProperties.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: true,
      companyId: companyId,
      isArchived: false,
    };

    setTimeout(() => {
      this.propertyService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.properties.set(response.result);
          const options: ZardComboboxOption[] = response.result.map((property) => {
            const parts: string[] = [];
            if (property.identifier) parts.push(property.identifier);
            if (property.name) parts.push(property.name);
            if (property.address) parts.push(property.address);
            return {
              value: property.id,
              label: parts.join(' - '),
            };
          });
          this.propertyOptions.set(options);
          this.isLoadingProperties.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.isLoadingProperties.set(false);
          this.cdr.markForCheck();
        },
      });
    }, 0);
  }

  loadLeases(): void {
    if (!this.formData().propertyId) {
      this.leases.set([]);
      this.leaseOptions.set([]);
      return;
    }

    this.isLoadingLeases.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: true,
      companyId: companyId,
      propertyId: this.formData().propertyId,
      isArchived: false,
    };

    setTimeout(() => {
      this.leaseService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.leases.set(response.result);
          const options: ZardComboboxOption[] = response.result.map((lease) => {
            return {
              value: lease.id,
              label: `${lease.tenantName} - ${lease.tenancyStart} to ${lease.tenancyEnd}`,
            };
          });
          this.leaseOptions.set(options);
          this.isLoadingLeases.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading leases:', error);
          this.isLoadingLeases.set(false);
          this.cdr.markForCheck();
        },
      });
    }, 0);
  }

  loadContacts(): void {
    this.isLoadingContacts.set(true);
    
    // Load contacts of all types (Owner, Tenant, Service) and combine them
    const contactTypes = [ContactType.Owner, ContactType.Tenant, ContactType.Service];
    const requests = contactTypes.map(type => 
      this.contactService.list({
        currentPage: 1,
        pageSize: 1000,
        ignore: true,
        type: type,
      }).pipe(takeUntil(this.destroy$))
    );

    setTimeout(() => {
      // Combine all requests
      forkJoin(requests).subscribe({
        next: (responses) => {
          // Combine all contacts from all types
          const allContacts: Contact[] = [];
          responses.forEach(response => {
            allContacts.push(...response.result);
          });
          
          this.contacts.set(allContacts);
          const options: ZardComboboxOption[] = allContacts.map((contact) => {
            let name = '';
            if (contact.isACompany) {
              name = contact.companyName || '';
            } else {
              name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
            }
            const parts: string[] = [];
            if (name) parts.push(name);
            if (contact.identifier) parts.push(contact.identifier);
            return {
              value: contact.id,
              label: parts.join(' - '),
            };
          });
          this.contactOptions.set(options);
          this.isLoadingContacts.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
          this.isLoadingContacts.set(false);
          this.cdr.markForCheck();
        },
      });
    }, 0);
  }

  updatePropertyId(value: string): void {
    this.formData.update(data => ({ ...data, propertyId: value || '' }));
    if (value) {
      const property = this.properties().find(p => p.id === value);
      this.selectedProperty.set(property || null);
      this.loadLeases();
    } else {
      this.selectedProperty.set(null);
      this.leases.set([]);
      this.leaseOptions.set([]);
      this.formData.update(data => ({ ...data, leaseId: '' }));
    }
    this.cdr.markForCheck();
  }

  updateLeaseId(value: string): void {
    this.formData.update(data => ({ ...data, leaseId: value || '' }));
    this.cdr.markForCheck();
  }

  updateContactId(value: string): void {
    this.formData.update(data => ({ ...data, contactId: value || '' }));
    this.cdr.markForCheck();
  }

  updateRevenueType(value: string): void {
    this.formData.update(data => ({ ...data, revenueType: parseInt(value) as RevenueType }));
    this.cdr.markForCheck();
  }

  updateDate(value: Date | null): void {
    this.formData.update(data => ({ ...data, date: value || new Date() }));
    this.cdr.markForCheck();
  }

  updateDescription(value: string): void {
    this.formData.update(data => ({ ...data, description: value }));
    this.cdr.markForCheck();
  }

  addPayment(): void {
    this.payments.update(payments => [...payments, { amount: 0, vatPercent: 0, description: '' }]);
    this.cdr.markForCheck();
  }

  removePayment(index: number): void {
    this.payments.update(payments => {
      if (payments.length > 1) {
        const newPayments = [...payments];
        newPayments.splice(index, 1);
        return newPayments;
      }
      return payments;
    });
    this.cdr.markForCheck();
  }

  updatePayment(index: number, field: keyof Payment, value: string | number): void {
    this.payments.update(payments => {
      const newPayments = [...payments];
      // Only convert to number for numeric fields (amount, vatPercent)
      // Keep description as string
      if (field === 'description') {
        newPayments[index] = { ...newPayments[index], [field]: typeof value === 'string' ? value : String(value) };
      } else {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        newPayments[index] = { ...newPayments[index], [field]: numValue };
      }
      return newPayments;
    });
    this.cdr.markForCheck();
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted.set(true);

    if (!this.isFormValid()) {
      return;
    }

    this.isSaving.set(true);

    try {
      const data = this.formData();
      
      // Convert uploaded files to attachments
      let attachments: AttachmentInput[] | undefined;
      const uploadedFiles = this.uploadedFiles();
      if (uploadedFiles.length > 0) {
        attachments = await Promise.all(
          uploadedFiles.map(async (uploadedFile) => {
            const base64Content = await this.fileToBase64(uploadedFile.file);
            return {
              fileName: uploadedFile.name,
              base64Content: base64Content,
              root: 'transaction',
            };
          })
        );
      }

      const request: CreateTransactionRequest = {
        category: TransactionType.Revenue, // Maps to TransactionCategory.Revenue (0) in backend
        revenueType: data.revenueType,
        propertyId: data.propertyId && data.propertyId.trim() !== '' ? data.propertyId : null,
        leaseId: data.leaseId && data.leaseId.trim() !== '' ? data.leaseId : null,
        contactId: data.contactId,
        date: data.date,
        payments: this.payments(),
        description: data.description,
        attachments: attachments,
      };

      this.transactionService.create(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toastService.success('Revenue transaction created successfully');
          this.router.navigate(['/transaction']);
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.toastService.error('Failed to create transaction');
          this.isSaving.set(false);
          this.cdr.markForCheck();
        },
      });
    } catch (error) {
      console.error('Error preparing transaction request:', error);
      this.toastService.error('Failed to prepare transaction');
      this.isSaving.set(false);
      this.cdr.markForCheck();
    }
  }

  onCancel(): void {
    this.router.navigate(['/transaction']);
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} MAD`;
  }

  // File upload handlers
  onUploadClick(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 10MB per file)
        if (file.size > 10 * 1024 * 1024) {
          this.toastService.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
          file: file,
        };

        newFiles.push(uploadedFile);
      }

      if (newFiles.length > 0) {
        this.uploadedFiles.update(files => [...files, ...newFiles]);
        this.cdr.markForCheck();
      }
    }

    // Reset input
    input.value = '';
  }

  onRemoveFile(fileId: string): void {
    this.uploadedFiles.update(files => files.filter(f => f.id !== fileId));
    this.cdr.markForCheck();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(type: string): 'image' | 'file-text' | 'file-spreadsheet' | 'file' {
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf')) return 'file-text';
    if (type.includes('word') || type.includes('document')) return 'file-text';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'file-spreadsheet';
    return 'file';
  }

  /**
   * Convert File to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

