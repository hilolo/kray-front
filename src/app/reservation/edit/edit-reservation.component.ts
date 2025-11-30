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
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { ZardFileViewerComponent } from '@shared/components/file-viewer/file-viewer.component';
import { ImageItem } from '@shared/image-viewer/image-viewer.component';
import { getFileViewerType } from '@shared/utils/file-type.util';
import { ReservationService } from '@shared/services/reservation.service';
import { UserService } from '@shared/services/user.service';
import { ToastService } from '@shared/services/toast.service';
import type { Reservation } from '@shared/models/reservation/reservation.model';
import { ReservationStatus } from '@shared/models/reservation/reservation.model';
import type { CreateReservationRequest } from '@shared/models/reservation/create-reservation-request.model';
import type { UpdateReservationRequest } from '@shared/models/reservation/update-reservation-request.model';
import type { AttachmentInput } from '@shared/models/contact/create-contact-request.model';
import { PropertyService } from '@shared/services/property.service';
import { ContactService } from '@shared/services/contact.service';
import type { Property } from '@shared/models/property/property.model';
import { PropertyCategory } from '@shared/models/property/property.model';
import type { Lease } from '@shared/models/property/property.model';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';
import { LeasingStatus } from '@shared/models/lease/lease.model';

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
  selector: 'app-edit-reservation',
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
    ZardCardComponent,
    ZardBadgeComponent,
    ZardImageHoverPreviewDirective,
    ZardComboboxComponent,
    ZardDatePickerComponent,
    ZardFileViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-reservation.component.html',
})
export class EditReservationComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly reservationService = inject(ReservationService);
  private readonly userService = inject(UserService);
  private readonly propertyService = inject(PropertyService);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly reservationId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.reservationId() !== null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly formSubmitted = signal(false);
  readonly checkingOverlaps = signal(false);
  readonly overlappingReservations = signal<Reservation[]>([]);

  // Reservation data
  readonly reservation = signal<Reservation | null>(null);
  readonly property = signal<Property | null>(null);
  readonly contact = signal<Contact | null>(null);
  
  // Leases from property
  readonly leases = computed(() => {
    return this.property()?.leases || [];
  });

  // Form data
  readonly formData = signal({
    propertyId: '',
    contactId: '',
    startDate: (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    })() as Date | null,
    endDate: null as Date | null,
    totalAmount: 0,
    description: '',
    privateNote: '',
    status: ReservationStatus.Approved,
  });

  // Files
  readonly uploadedFiles = signal<UploadedFile[]>([]);
  readonly existingAttachments = signal<ExistingAttachment[]>([]);
  readonly filesToDelete = signal<Set<string>>(new Set());
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  // Properties and Contacts (for add mode only)
  readonly properties = signal<Property[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingProperties = signal(false);

  readonly contacts = signal<Contact[]>([]);
  readonly contactOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingContacts = signal(false);

  // Icon templates
  readonly calendarIconTemplate = viewChild.required<TemplateRef<void>>('calendarIconTemplate');
  readonly banknoteIconTemplate = viewChild.required<TemplateRef<void>>('banknoteIconTemplate');

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    const hasValidDates = data.startDate !== null && 
      data.endDate !== null && 
      data.endDate > data.startDate;
    return (
      data.propertyId !== '' &&
      data.contactId !== '' &&
      data.startDate !== null &&
      data.endDate !== null &&
      hasValidDates &&
      data.totalAmount >= 0 &&
      !this.hasDateConflict()
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
      return 'Contact is required';
    }
    return '';
  });

  readonly startDateError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().startDate;
    if (!value) {
      return 'Start date is required';
    }
    // Check for date conflicts
    if (this.hasDateConflict()) {
      return 'These dates conflict with an existing reservation';
    }
    return '';
  });

  readonly endDateError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().endDate;
    if (!value) {
      return 'End date is required';
    }
    const startDate = this.formData().startDate;
    if (startDate && value <= startDate) {
      return 'End date must be after start date';
    }
    // Check for date conflicts
    if (this.hasDateConflict()) {
      return 'These dates conflict with an existing reservation';
    }
    return '';
  });

  // Check if there are overlapping reservations
  readonly hasDateConflict = computed(() => {
    return this.overlappingReservations().length > 0;
  });

  // Conflict error message with details
  readonly dateConflictError = computed(() => {
    const overlapping = this.overlappingReservations();
    if (overlapping.length === 0) {
      return '';
    }
    
    if (overlapping.length === 1) {
      const res = overlapping[0];
      return `These dates conflict with an existing reservation: ${res.contactName} (${this.formatDate(res.startDate)} - ${this.formatDate(res.endDate)})`;
    }
    
    const conflicts = overlapping.map(r => 
      `${r.contactName} (${this.formatDate(r.startDate)} - ${this.formatDate(r.endDate)})`
    ).join(', ');
    return `These dates conflict with ${overlapping.length} existing reservations: ${conflicts}`;
  });

  readonly totalAmountError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().totalAmount;
    if (value < 0) {
      return 'Total amount must be greater than or equal to 0';
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

  readonly startDateHasError = computed(() => {
    if (!this.formSubmitted()) return false;
    const value = this.formData().startDate;
    if (!value) return true;
    return this.hasDateConflict();
  });

  readonly endDateHasError = computed(() => {
    if (!this.formSubmitted()) return false;
    const value = this.formData().endDate;
    if (!value) return true;
    const startDate = this.formData().startDate;
    if (startDate && value <= startDate) return true;
    return this.hasDateConflict();
  });

  readonly totalAmountHasError = computed(() => {
    return this.formSubmitted() && this.formData().totalAmount < 0;
  });

  // Minimum date for end date picker (start date + 1 day)
  readonly endDateMinDate = computed(() => {
    const startDate = this.formData().startDate;
    if (!startDate) return null;
    const minDate = new Date(startDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate;
  });

  // Reservation duration calculation
  readonly reservationDuration = computed(() => {
    const start = this.formData().startDate;
    const end = this.formData().endDate;

    if (!start || !end) {
      return null;
    }

    if (end <= start) {
      return null;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds, then convert to days
    // End date is checkout day (not included), so nights = days between start and end
    const diffTime = endDate.getTime() - startDate.getTime();
    const nights = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return `${nights} night${nights !== 1 ? 's' : ''}`;
  });

  // Status options - all statuses available in both add and edit mode
  readonly statusOptions = [
    { value: ReservationStatus.Pending, label: 'Pending' },
    { value: ReservationStatus.Approved, label: 'Approved' },
    { value: ReservationStatus.Cancelled, label: 'Cancelled' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reservationId.set(id);
      this.loadReservation(id);
    } else {
      requestAnimationFrame(() => {
        this.loadProperties();
        this.loadContacts();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReservation(id: string): void {
    this.isLoading.set(true);
    this.reservationService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (reservation) => {
        this.reservation.set(reservation);
        
        // Normalize dates to midnight (00:00:00) when loading
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        
        if (reservation.startDate) {
          startDate = new Date(reservation.startDate);
          startDate.setHours(0, 0, 0, 0);
        }
        
        if (reservation.endDate) {
          endDate = new Date(reservation.endDate);
          endDate.setHours(0, 0, 0, 0);
        }
        
        this.formData.set({
          propertyId: reservation.propertyId,
          contactId: reservation.contactId,
          startDate: startDate,
          endDate: endDate,
          totalAmount: reservation.totalAmount,
          description: reservation.description || '',
          privateNote: reservation.privateNote || '',
          status: reservation.status,
        });

        // Load property and contact details
        this.loadProperty(reservation.propertyId);
        this.loadContact(reservation.contactId);

        // Load attachments
        if (reservation.attachments && reservation.attachments.length > 0) {
          this.existingAttachments.set(
            reservation.attachments.map((att) => ({
              id: att.id,
              url: att.url,
              fileName: att.fileName || att.originalFileName || 'Unknown',
              size: att.fileSize || 0,
              createdAt: att.createdAt || '',
            }))
          );
        }

        // Check for overlaps after loading reservation data
        setTimeout(() => {
          this.checkForOverlaps();
        }, 100);

        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading reservation:', error);
        this.toastService.error('Failed to load reservation');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadProperty(id: string): void {
    this.propertyService.getById(id, true).pipe(takeUntil(this.destroy$)).subscribe({
      next: (property) => {
        this.property.set(property);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading property:', error);
      },
    });
  }

  loadContact(id: string): void {
    this.contactService.getById(id, false).pipe(takeUntil(this.destroy$)).subscribe({
      next: (contact) => {
        this.contact.set(contact);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading contact:', error);
      },
    });
  }

  loadProperties(): void {
    // Don't load properties in edit mode - property is read-only
    if (this.isEditMode()) {
      return;
    }

    this.isLoadingProperties.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    
    // Only fetch properties with category "location vacances"
    const request = {
      currentPage: 1,
      pageSize: 500,
      ignore: false,
      companyId: companyId,
      category: PropertyCategory.LocationVacances,
    };

    setTimeout(() => {
      this.propertyService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.properties.set(response.result);
          requestAnimationFrame(() => {
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
          });
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.isLoadingProperties.set(false);
          this.cdr.markForCheck();
        },
      });
    }, 0);
  }

  loadContacts(): void {
    this.isLoadingContacts.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    const request = {
      currentPage: 1,
      pageSize: 500,
      ignore: false,
      type: ContactType.Tenant, // Using Tenant as default, but will get all contacts
      companyId: companyId,
    };

    setTimeout(() => {
      this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.contacts.set(response.result);
          requestAnimationFrame(() => {
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
            this.contactOptions.set(options);
            this.isLoadingContacts.set(false);
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
          this.isLoadingContacts.set(false);
          this.cdr.markForCheck();
        },
      });
    }, 0);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
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
    const uploadedFile = this.uploadedFiles().find(f => f.name === name);
    
    if (uploadedFile && uploadedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.fileViewerUrl.set(dataUrl);
        this.fileViewerName.set(name);
        this.fileViewerSize.set(size);
        
        const allImages = this.allImages();
        const uploadedImages = this.uploadedFiles()
          .filter(f => f.type.startsWith('image/'))
          .map(f => {
            if (f.id === uploadedFile.id) {
              return { url: dataUrl, name: f.name, size: f.size };
            }
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
    
    this.fileViewerUrl.set(url);
    this.fileViewerName.set(name);
    this.fileViewerSize.set(size);
    
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

    // Final check for overlaps before submission
    if (this.hasDateConflict()) {
      this.toastService.error('Cannot save: The selected dates conflict with an existing reservation');
      return;
    }

    if (!this.isFormValid()) {
      return;
    }

    this.isSaving.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;

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

    // Validate dates before normalizing
    const startDate = this.formData().startDate;
    const endDate = this.formData().endDate;

    if (!startDate || !endDate) {
      this.toastService.error('Start date and end date are required');
      this.isSaving.set(false);
      this.cdr.markForCheck();
      return;
    }

    // Normalize dates to midnight (00:00:00) in UTC to avoid timezone shifts
    // Helper function to format date as ISO string at midnight UTC
    const formatDateAsUTCMidnight = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00.000Z`;
    };

    const normalizedStartDate = new Date(startDate);
    if (isNaN(normalizedStartDate.getTime())) {
      this.toastService.error('Invalid start date');
      this.isSaving.set(false);
      this.cdr.markForCheck();
      return;
    }
    
    const normalizedEndDate = new Date(endDate);
    if (isNaN(normalizedEndDate.getTime())) {
      this.toastService.error('Invalid end date');
      this.isSaving.set(false);
      this.cdr.markForCheck();
      return;
    }

    if (this.isEditMode()) {
      const reservationId = this.reservationId()!;
      const request: UpdateReservationRequest = {
        contactId: this.formData().contactId,
        propertyId: this.formData().propertyId,
        startDate: formatDateAsUTCMidnight(normalizedStartDate),
        endDate: formatDateAsUTCMidnight(normalizedEndDate),
        totalAmount: this.formData().totalAmount,
        description: this.formData().description,
        privateNote: this.formData().privateNote,
        status: this.formData().status,
        attachmentsToAdd: attachments,
        attachmentsToDelete: Array.from(this.filesToDelete()),
      };

      this.reservationService.update(reservationId, request).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toastService.success('Reservation updated successfully');
          this.router.navigate(['/reservation']);
        },
        error: (error) => {
          console.error('Error updating reservation:', error);
          this.toastService.error('Failed to update reservation');
          this.isSaving.set(false);
          this.cdr.markForCheck();
        },
      });
    } else {
      const request: CreateReservationRequest = {
        contactId: this.formData().contactId,
        propertyId: this.formData().propertyId,
        startDate: formatDateAsUTCMidnight(normalizedStartDate),
        endDate: formatDateAsUTCMidnight(normalizedEndDate),
        totalAmount: this.formData().totalAmount,
        description: this.formData().description,
        privateNote: this.formData().privateNote,
        companyId: companyId,
        attachments: attachments,
      };

      this.reservationService.create(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toastService.success('Reservation created successfully');
          this.router.navigate(['/reservation']);
        },
        error: (error) => {
          console.error('Error creating reservation:', error);
          this.toastService.error('Failed to create reservation');
          this.isSaving.set(false);
          this.cdr.markForCheck();
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/reservation']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount);
  }

  getContactDisplayName(contact: Contact | null): string {
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

  getStatusLabel(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.Pending:
        return 'Pending';
      case ReservationStatus.Approved:
        return 'Approved';
      case ReservationStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getStatusIcon(status: ReservationStatus): 'clock' | 'circle-check' | 'x' {
    switch (status) {
      case ReservationStatus.Pending:
        return 'clock';
      case ReservationStatus.Approved:
        return 'circle-check';
      case ReservationStatus.Cancelled:
        return 'x';
      default:
        return 'clock';
    }
  }

  // Helper methods for form field updates
  updatePropertyId(value: string): void {
    this.formData.update((data) => ({ ...data, propertyId: value }));
    // Load property details when property changes
    if (value) {
      this.loadProperty(value);
    } else {
      this.property.set(null);
    }
    // Check for overlaps when property changes
    this.checkForOverlaps();
  }

  updateContactId(value: string): void {
    this.formData.update((data) => ({ ...data, contactId: value }));
  }

  updateStartDate(value: Date | null): void {
    this.formData.update((data) => ({ ...data, startDate: value }));
    // Check for overlaps when start date changes
    this.checkForOverlaps();
  }

  updateEndDate(value: Date | null): void {
    this.formData.update((data) => ({ ...data, endDate: value }));
    // Check for overlaps when end date changes
    this.checkForOverlaps();
  }

  checkForOverlaps(): void {
    const data = this.formData();
    const propertyId = data.propertyId;
    const startDate = data.startDate;
    const endDate = data.endDate;

    // Clear existing overlaps
    this.overlappingReservations.set([]);

    // Only check if we have all required data
    if (!propertyId || !startDate || !endDate || endDate <= startDate) {
      return;
    }

    this.checkingOverlaps.set(true);
    const excludeId = this.isEditMode() ? this.reservationId() : undefined;

    // Normalize dates to midnight (00:00:00) in UTC for overlap checking
    // Create Date objects representing UTC midnight to avoid timezone shifts
    const normalizedStartDate = new Date(Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0, 0, 0, 0
    ));
    
    const normalizedEndDate = new Date(Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      0, 0, 0, 0
    ));

    this.reservationService
      .getOverlappingReservations(propertyId, normalizedStartDate, normalizedEndDate, excludeId || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (overlapping) => {
          this.overlappingReservations.set(overlapping);
          this.checkingOverlaps.set(false);
          this.cdr.markForCheck();
          
          if (overlapping.length > 0) {
            const conflictInfo = overlapping.map(r => 
              `${r.contactName} (${this.formatDate(r.startDate)} - ${this.formatDate(r.endDate)})`
            ).join(', ');
            this.toastService.warning(`Date conflict detected: ${conflictInfo}`);
          }
        },
        error: (error) => {
          console.error('Error checking for overlapping reservations:', error);
          this.checkingOverlaps.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  updateTotalAmount(value: string): void {
    this.formData.update((data) => ({ ...data, totalAmount: +value }));
  }

  updatePrivateNote(value: string): void {
    this.formData.update((data) => ({ ...data, privateNote: value }));
  }

  updateStatus(value: string): void {
    this.formData.update((data) => ({ ...data, status: +value }));
  }

  // Lease status helpers
  getLeaseStatusLabel(status: number): string {
    switch (status) {
      case LeasingStatus.Active:
        return 'Active';
      case LeasingStatus.Expired:
        return 'Expired';
      case LeasingStatus.Terminated:
        return 'Terminated';
      case LeasingStatus.Pending:
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  getLeaseStatusBadgeType(status: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case LeasingStatus.Active:
        return 'default';
      case LeasingStatus.Expired:
        return 'secondary';
      case LeasingStatus.Terminated:
        return 'destructive';
      case LeasingStatus.Pending:
        return 'outline';
      default:
        return 'outline';
    }
  }

  formatLeaseDate(date: Date | string): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  }
}

