import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { ZardFileViewerComponent } from '@shared/components/file-viewer/file-viewer.component';
import { ImageItem } from '@shared/image-viewer/image-viewer.component';
import { getFileViewerType } from '@shared/utils/file-type.util';
import { LeaseService } from '@shared/services/lease.service';
import { UserService } from '@shared/services/user.service';
import { ToastService } from '@shared/services/toast.service';
import type { Lease } from '@shared/models/lease/lease.model';
import { LeasingStatus, TypePaimentLease, PaymentMethod } from '@shared/models/lease/lease.model';
import type { CreateLeaseRequest } from '@shared/models/lease/create-lease-request.model';
import type { UpdateLeaseRequest } from '@shared/models/lease/update-lease-request.model';
import type { AttachmentInput } from '@shared/models/contact/create-contact-request.model';
import { PropertyService } from '@shared/services/property.service';
import { ContactService } from '@shared/services/contact.service';
import type { Property } from '@shared/models/property/property.model';
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

interface ExistingAttachment {
  id: string;
  url: string;
  fileName: string;
  size: number;
  createdAt: string;
}

@Component({
  selector: 'app-edit-leasing',
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
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardCheckboxComponent,
    ZardCardComponent,
    ZardImageHoverPreviewDirective,
    ZardComboboxComponent,
    ZardDatePickerComponent,
    ZardFileViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-leasing.component.html',
})
export class EditLeasingComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly leaseService = inject(LeaseService);
  private readonly userService = inject(UserService);
  private readonly propertyService = inject(PropertyService);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly leaseId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.leaseId() !== null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly formSubmitted = signal(false);

  // Lease data
  readonly lease = signal<Lease | null>(null);
  readonly property = signal<Property | null>(null);
  readonly tenant = signal<Contact | null>(null);

  // Form data
  readonly formData = signal({
    propertyId: '',
    contactId: '',
    tenancyStart: null as Date | null,
    tenancyEnd: null as Date | null,
    paymentType: TypePaimentLease.Monthly,
    paymentMethod: PaymentMethod.Cash,
    paymentDate: 1,
    rentPrice: 0,
    enableReceipts: false,
    notificationWhatsapp: false,
    notificationEmail: false,
    specialTerms: '',
    privateNote: '',
  });

  // Files
  readonly uploadedFiles = signal<UploadedFile[]>([]);
  readonly existingAttachments = signal<ExistingAttachment[]>([]);
  readonly filesToDelete = signal<Set<string>>(new Set());
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  // Properties and Tenants (for add mode only)
  readonly properties = signal<Property[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingProperties = signal(false);

  readonly tenants = signal<Contact[]>([]);
  readonly tenantOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingTenants = signal(false);

  // Icon templates
  readonly calendarIconTemplate = viewChild.required<TemplateRef<void>>('calendarIconTemplate');
  readonly banknoteIconTemplate = viewChild.required<TemplateRef<void>>('banknoteIconTemplate');
  readonly creditCardIconTemplate = viewChild.required<TemplateRef<void>>('creditCardIconTemplate');
  readonly fileTextIconTemplate = viewChild.required<TemplateRef<void>>('fileTextIconTemplate');

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.propertyId !== '' &&
      data.contactId !== '' &&
      data.tenancyStart !== null &&
      data.tenancyEnd !== null &&
      data.rentPrice > 0 &&
      data.paymentDate >= 1 &&
      data.paymentDate <= 31
    );
  });

  // Error messages
  readonly propertyIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    if (this.isEditMode()) return ''; // Read-only in edit mode
    const value = this.formData().propertyId;
    if (!value || value === '') {
      return 'Property is required';
    }
    return '';
  });

  readonly contactIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    if (this.isEditMode()) return ''; // Read-only in edit mode
    const value = this.formData().contactId;
    if (!value || value === '') {
      return 'Tenant is required';
    }
    return '';
  });

  readonly tenancyStartError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().tenancyStart;
    if (!value) {
      return 'Tenancy start date is required';
    }
    return '';
  });

  readonly tenancyEndError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().tenancyEnd;
    if (!value) {
      return 'Tenancy end date is required';
    }
    return '';
  });

  readonly rentPriceError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().rentPrice;
    if (value <= 0) {
      return 'Rent price must be greater than 0';
    }
    return '';
  });

  readonly paymentDateError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().paymentDate;
    if (value < 1 || value > 31) {
      return 'Payment date must be between 1 and 31';
    }
    return '';
  });

  // Error state for styling
  readonly propertyIdHasError = computed(() => {
    return !this.isEditMode() && this.formSubmitted() && (!this.formData().propertyId || this.formData().propertyId === '');
  });

  readonly contactIdHasError = computed(() => {
    return !this.isEditMode() && this.formSubmitted() && (!this.formData().contactId || this.formData().contactId === '');
  });

  readonly tenancyStartHasError = computed(() => {
    return this.formSubmitted() && !this.formData().tenancyStart;
  });

  readonly tenancyEndHasError = computed(() => {
    const value = this.formData().tenancyEnd;
    return this.formSubmitted() && !value;
  });

  readonly rentPriceHasError = computed(() => {
    return this.formSubmitted() && this.formData().rentPrice <= 0;
  });

  readonly paymentDateHasError = computed(() => {
    const value = this.formData().paymentDate;
    return this.formSubmitted() && (value < 1 || value > 31);
  });

  // Payment type options
  readonly paymentTypeOptions = [
    { value: TypePaimentLease.Monthly, label: 'Monthly' },
    { value: TypePaimentLease.Quarterly, label: 'Quarterly' },
    { value: TypePaimentLease.SemiAnnually, label: 'Semi-Annually' },
    { value: TypePaimentLease.Fully, label: 'Full Payment' },
  ];

  // Payment method options
  readonly paymentMethodOptions = [
    { value: PaymentMethod.Cash, label: 'Cash' },
    { value: PaymentMethod.BankTransfer, label: 'Bank Transfer' },
    { value: PaymentMethod.Check, label: 'Check' },
  ];

  // Payment date options (1-31)
  readonly paymentDateOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.leaseId.set(id);
      this.loadLease(id);
    } else {
      this.loadProperties();
      this.loadTenants();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLease(id: string): void {
    this.isLoading.set(true);
    this.leaseService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (lease) => {
        this.lease.set(lease);
        this.formData.set({
          propertyId: lease.propertyId,
          contactId: lease.contactId,
          tenancyStart: lease.tenancyStart ? new Date(lease.tenancyStart) : null,
          tenancyEnd: lease.tenancyEnd ? new Date(lease.tenancyEnd) : null,
          paymentType: lease.paymentType,
          paymentMethod: lease.paymentMethod,
          paymentDate: lease.paymentDate,
          rentPrice: lease.rentPrice,
          enableReceipts: lease.enableReceipts,
          notificationWhatsapp: lease.notificationWhatsapp,
          notificationEmail: lease.notificationEmail,
          specialTerms: lease.specialTerms || '',
          privateNote: lease.privateNote || '',
        });

        // Load property and tenant details
        this.loadProperty(lease.propertyId);
        this.loadTenant(lease.contactId);

        // Load attachments
        if (lease.attachments && lease.attachments.length > 0) {
          this.existingAttachments.set(
            lease.attachments.map((att) => ({
              id: att.id,
              url: att.url,
              fileName: att.fileName || att.originalFileName || 'Unknown',
              size: att.fileSize || 0,
              createdAt: att.createdAt || '',
            }))
          );
        }

        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading lease:', error);
        this.toastService.error('Failed to load lease');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadProperty(id: string): void {
    this.propertyService.getById(id, false).pipe(takeUntil(this.destroy$)).subscribe({
      next: (property) => {
        this.property.set(property);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading property:', error);
      },
    });
  }

  loadTenant(id: string): void {
    this.contactService.getById(id, false).pipe(takeUntil(this.destroy$)).subscribe({
      next: (contact) => {
        this.tenant.set(contact);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading tenant:', error);
      },
    });
  }

  loadProperties(): void {
    this.isLoadingProperties.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: false,
      companyId: companyId,
    };

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
  }

  loadTenants(): void {
    this.isLoadingTenants.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: false,
      type: ContactType.Tenant,
      companyId: companyId,
    };

    this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.tenants.set(response.result);
        const options: ZardComboboxOption[] = response.result.map((contact) => {
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
        this.tenantOptions.set(options);
        this.isLoadingTenants.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
        this.isLoadingTenants.set(false);
        this.cdr.markForCheck();
      },
    });
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
      }
    }

    // Reset input
    input.value = '';
  }

  onUploadClick(): void {
    const input = this.fileInput();
    if (input) {
      input.nativeElement.click();
    }
  }

  onRemoveFile(fileId: string): void {
    this.uploadedFiles.update(files => files.filter(f => f.id !== fileId));
  }

  onDeleteAttachment(attachmentId: string): void {
    this.filesToDelete.update(set => {
      const newSet = new Set(set);
      newSet.add(attachmentId);
      return newSet;
    });
  }

  onRestoreAttachment(attachmentId: string): void {
    this.filesToDelete.update(set => {
      const newSet = new Set(set);
      newSet.delete(attachmentId);
      return newSet;
    });
  }

  isAttachmentMarkedForDeletion(attachmentId: string): boolean {
    return this.filesToDelete().has(attachmentId);
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

  openFile(url: string, name: string, size: number): void {
    // Check if this is an uploaded file (no URL yet)
    const uploadedFile = this.uploadedFiles().find(f => f.name === name);
    
    if (uploadedFile && uploadedFile.type.startsWith('image/')) {
      // Create data URL for uploaded image
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.fileViewerUrl.set(dataUrl);
        this.fileViewerName.set(name);
        this.fileViewerSize.set(size);
        
        // Set up image navigation
        const allImages = this.allImages();
        const uploadedImages = this.uploadedFiles()
          .filter(f => f.type.startsWith('image/'))
          .map(f => {
            if (f.id === uploadedFile.id) {
              return { url: dataUrl, name: f.name, size: f.size };
            }
            // For other uploaded images, we'd need to read them too, but for now just include this one
            return null;
          })
          .filter((img): img is ImageItem => img !== null);
        
        const combinedImages = [...allImages, ...uploadedImages];
        const currentIndex = combinedImages.findIndex(img => img.url === dataUrl || img.name === name);
        this.fileViewerCurrentIndex.set(currentIndex >= 0 ? currentIndex : 0);
        this.fileViewerImages.set(combinedImages);
        this.fileViewerOpen.set(true);
      };
      reader.readAsDataURL(uploadedFile.file);
      return;
    }
    
    // For existing files with URLs
    this.fileViewerUrl.set(url);
    this.fileViewerName.set(name);
    this.fileViewerSize.set(size);
    
    // If it's an image, set up image navigation
    if (getFileViewerType(url) === 'image') {
      const allImages = this.allImages();
      const currentIndex = allImages.findIndex(img => img.url === url || img.name === name);
      this.fileViewerCurrentIndex.set(currentIndex >= 0 ? currentIndex : 0);
      this.fileViewerImages.set(allImages);
    } else {
      this.fileViewerImages.set([]);
      this.fileViewerCurrentIndex.set(0);
    }
    
    this.fileViewerOpen.set(true);
  }

  onImageChanged(index: number): void {
    this.fileViewerCurrentIndex.set(index);
    const images = this.fileViewerImages();
    if (images && images.length > 0 && index >= 0 && index < images.length) {
      const image = images[index];
      this.fileViewerUrl.set(image.url);
      this.fileViewerName.set(image.name);
      this.fileViewerSize.set(image.size);
    }
  }

  isFileFormatSupported(url: string): boolean {
    const viewerType = getFileViewerType(url);
    return viewerType !== 'unknown';
  }

  getFileViewerType(url: string): ReturnType<typeof getFileViewerType> {
    return getFileViewerType(url);
  }

  downloadFile(url: string, name: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  readonly allImages = computed(() => {
    const images: ImageItem[] = [];
    
    // Add existing attachments (not marked for deletion) that are images
    const toDelete = this.filesToDelete();
    this.existingAttachments().forEach(att => {
      if (!toDelete.has(att.id) && getFileViewerType(att.url) === 'image') {
        images.push({
          url: att.url,
          name: att.fileName,
          size: att.size || 0,
        });
      }
    });
    
    // Note: Uploaded files that are images will be processed when opening the file viewer
    // We can't use FileReader in a computed signal as it's async
    
    return images;
  });

  readonly hasExistingAttachments = computed(() => {
    return this.existingAttachments().length > 0;
  });

  readonly existingAttachmentsCount = computed(() => {
    const toDelete = this.filesToDelete();
    return this.existingAttachments().filter(att => !toDelete.has(att.id)).length;
  });

  readonly hasUploadedFiles = computed(() => {
    return this.uploadedFiles().length > 0;
  });

  readonly uploadedFilesSize = computed(() => {
    return this.uploadedFiles().reduce((total, file) => total + file.size, 0);
  });

  readonly hasAnyAttachments = computed(() => {
    return this.hasExistingAttachments() || this.hasUploadedFiles();
  });

  readonly totalFileSize = computed(() => {
    const existingSize = this.existingAttachments()
      .filter(att => !this.filesToDelete().has(att.id))
      .reduce((total, att) => total + (att.size || 0), 0);
    return existingSize + this.uploadedFilesSize();
  });

  // File viewer state
  readonly fileViewerOpen = signal(false);
  readonly fileViewerUrl = signal<string>('');
  readonly fileViewerName = signal<string>('');
  readonly fileViewerSize = signal<number>(0);
  readonly fileViewerImages = signal<ImageItem[]>([]);
  readonly fileViewerCurrentIndex = signal<number>(0);

  async onSubmit(): Promise<void> {
    this.formSubmitted.set(true);

    if (!this.isFormValid()) {
      return;
    }

    this.isSaving.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;

    // Convert uploaded files to AttachmentInput (async)
    const filePromises = this.uploadedFiles().map((file) => {
      return new Promise<AttachmentInput>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || '';
          resolve({
            fileName: file.name,
            base64Content: base64,
          });
        };
        reader.onerror = () => {
          resolve({
            fileName: file.name,
            base64Content: '',
          });
        };
        reader.readAsDataURL(file.file);
      });
    });

    const attachments = await Promise.all(filePromises);

    if (this.isEditMode()) {
      const leaseId = this.leaseId()!;
      const request: UpdateLeaseRequest = {
        id: leaseId,
        propertyId: this.formData().propertyId,
        contactId: this.formData().contactId,
        tenancyStart: this.formData().tenancyStart!.toISOString(),
        tenancyEnd: this.formData().tenancyEnd!.toISOString(),
        paymentType: this.formData().paymentType,
        paymentMethod: this.formData().paymentMethod,
        paymentDate: this.formData().paymentDate,
        rentPrice: this.formData().rentPrice,
        enableReceipts: this.formData().enableReceipts,
        notificationWhatsapp: this.formData().notificationWhatsapp,
        notificationEmail: this.formData().notificationEmail,
        specialTerms: this.formData().specialTerms,
        privateNote: this.formData().privateNote,
        companyId: companyId,
        attachmentsToAdd: attachments,
        attachmentsToDelete: Array.from(this.filesToDelete()),
      };

      this.leaseService.update(leaseId, request).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toastService.success('Lease updated successfully');
          this.router.navigate(['/leasing']);
        },
        error: (error) => {
          console.error('Error updating lease:', error);
          this.toastService.error('Failed to update lease');
          this.isSaving.set(false);
          this.cdr.markForCheck();
        },
      });
    } else {
      const request: CreateLeaseRequest = {
        propertyId: this.formData().propertyId,
        contactId: this.formData().contactId,
        tenancyStart: this.formData().tenancyStart!.toISOString(),
        tenancyEnd: this.formData().tenancyEnd!.toISOString(),
        paymentType: this.formData().paymentType,
        paymentMethod: this.formData().paymentMethod,
        paymentDate: this.formData().paymentDate,
        rentPrice: this.formData().rentPrice,
        enableReceipts: this.formData().enableReceipts,
        notificationWhatsapp: this.formData().notificationWhatsapp,
        notificationEmail: this.formData().notificationEmail,
        specialTerms: this.formData().specialTerms,
        privateNote: this.formData().privateNote,
        companyId: companyId,
        attachments: attachments,
      };

      this.leaseService.create(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toastService.success('Lease created successfully');
          this.router.navigate(['/leasing']);
        },
        error: (error) => {
          console.error('Error creating lease:', error);
          this.toastService.error('Failed to create lease');
          this.isSaving.set(false);
          this.cdr.markForCheck();
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/leasing']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  getTenantDisplayName(contact: Contact | null): string {
    if (!contact) return 'N/A';
    if (contact.isACompany) {
      return contact.companyName || contact.identifier || 'N/A';
    }
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.identifier || 'N/A';
  }

  getPropertyDisplayName(property: Property | null): string {
    if (!property) return 'N/A';
    return property.name || property.identifier || 'N/A';
  }

  // Helper methods for form field updates
  updatePropertyId(value: string): void {
    this.formData.update((data) => ({ ...data, propertyId: value }));
  }

  updateContactId(value: string): void {
    this.formData.update((data) => ({ ...data, contactId: value }));
  }

  updateTenancyStart(value: Date | null): void {
    this.formData.update((data) => ({ ...data, tenancyStart: value }));
  }

  updateTenancyEnd(value: Date | null): void {
    this.formData.update((data) => ({ ...data, tenancyEnd: value }));
  }

  updateRentPrice(value: string): void {
    this.formData.update((data) => ({ ...data, rentPrice: +value }));
  }

  updatePaymentType(value: string): void {
    this.formData.update((data) => ({ ...data, paymentType: +value }));
  }

  updatePaymentMethod(value: string): void {
    this.formData.update((data) => ({ ...data, paymentMethod: +value }));
  }

  updatePaymentDate(value: string): void {
    this.formData.update((data) => ({ ...data, paymentDate: +value }));
  }

  updateEnableReceipts(value: boolean): void {
    this.formData.update((data) => ({ ...data, enableReceipts: value }));
  }

  updateNotificationEmail(value: boolean): void {
    this.formData.update((data) => ({ ...data, notificationEmail: value }));
  }

  updateNotificationWhatsapp(value: boolean): void {
    this.formData.update((data) => ({ ...data, notificationWhatsapp: value }));
  }

  updateSpecialTerms(value: string): void {
    this.formData.update((data) => ({ ...data, specialTerms: value }));
  }

  updatePrivateNote(value: string): void {
    this.formData.update((data) => ({ ...data, privateNote: value }));
  }
}

