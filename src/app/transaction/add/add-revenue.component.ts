import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardFileViewerComponent } from '@shared/components/file-viewer/file-viewer.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ImageItem } from '@shared/image-viewer/image-viewer.component';
import { getFileViewerType } from '@shared/utils/file-type.util';
import { AttachmentInput } from '@shared/models/contact/create-contact-request.model';
import type { Attachment } from '@shared/models/transaction/transaction.model';
import { TransactionService } from '@shared/services/transaction.service';
import { PropertyService } from '@shared/services/property.service';
import { LeaseService } from '@shared/services/lease.service';
import { ReservationService } from '@shared/services/reservation.service';
import { ContactService } from '@shared/services/contact.service';
import { ToastService } from '@shared/services/toast.service';
import { UserService } from '@shared/services/user.service';
import { TransactionType, RevenueType, TransactionStatus, Payment, type Transaction } from '@shared/models/transaction/transaction.model';
import { CreateTransactionRequest } from '@shared/models/transaction/create-transaction-request.model';
import { UpdateTransactionRequest } from '@shared/models/transaction/update-transaction-request.model';
import { normalizeDateToUTCMidnight } from '@shared/utils/date.util';
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

interface ExistingAttachment {
  id: string;
  url: string;
  fileName: string;
  size: number;
  createdAt: string;
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
    ZardCheckboxComponent,
    ZardFileViewerComponent,
    ZardImageHoverPreviewDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-revenue.component.html',
})
export class AddRevenueComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly transactionService = inject(TransactionService);
  private readonly propertyService = inject(PropertyService);
  private readonly leaseService = inject(LeaseService);
  private readonly reservationService = inject(ReservationService);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly TransactionType = TransactionType;
  readonly RevenueType = RevenueType;
  readonly TransactionStatus = TransactionStatus;

  // Status from query params (for deposit transactions)
  readonly initialStatus = signal<TransactionStatus | null>(null);

  // Edit mode
  readonly transactionId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.transactionId() !== null);
  readonly isLoading = signal(false);

  // Form data
  readonly payments = signal<Payment[]>([
    { amount: 0, vatPercent: 0, description: '' }
  ]);

  readonly formData = signal({
    propertyId: '',
    leaseId: '',
    revenueType: RevenueType.Loyer,
    contactId: '',
    isOtherContact: false,
    otherContactName: '',
    reservationId: '',
    date: new Date(),
    description: '',
  });

  readonly formSubmitted = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingProperties = signal(false);
  readonly isLoadingLeases = signal(false);
  readonly isLoadingReservations = signal(false);
  readonly isLoadingContacts = signal(false);

  readonly properties = signal<Property[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly leases = signal<Lease[]>([]);
  readonly leaseOptions = signal<ZardComboboxOption[]>([]);
  readonly reservations = signal<any[]>([]);
  readonly reservationOptions = signal<ZardComboboxOption[]>([]);
  readonly contacts = signal<Contact[]>([]);
  readonly contactOptions = signal<ZardComboboxOption[]>([]);

  readonly selectedProperty = signal<Property | null>(null);

  // File upload
  readonly uploadedFiles = signal<UploadedFile[]>([]);
  readonly existingAttachments = signal<ExistingAttachment[]>([]);
  readonly filesToDelete = signal<Set<string>>(new Set());
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

  // Check if revenue type is reservation-related
  readonly isReservationType = computed(() => {
    const type = this.formData().revenueType;
    return type === RevenueType.ReservationFull || type === RevenueType.ReservationPart;
  });

  // Form validation - contact not required for type "Autre", reservation required for reservation types
  readonly isFormValid = computed(() => {
    const data = this.formData();
    const payments = this.payments();
    const isAutreType = data.revenueType === RevenueType.Autre;
    const hasValidContact = isAutreType
      ? true // Contact not required for "Autre" type
      : (data.isOtherContact
        ? (data.otherContactName && data.otherContactName.trim() !== '')
        : (data.contactId !== ''));
    const hasValidReservation = this.isReservationType()
      ? (data.reservationId && data.reservationId !== '')
      : true;
    return (
      hasValidContact &&
      hasValidReservation &&
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
    const data = this.formData();
    const isAutreType = data.revenueType === RevenueType.Autre;
    if (isAutreType) return ''; // No error for "Autre" type - contact is optional
    if (data.isOtherContact) {
      if (!data.otherContactName || data.otherContactName.trim() === '') {
        return 'Other contact name is required';
      }
    } else {
      if (!data.contactId || data.contactId === '') {
        return 'From (contact) is required';
      }
    }
    return '';
  });

  readonly propertyIdHasError = computed(() => {
    // Property is optional, no error
    return false;
  });

  readonly contactIdHasError = computed(() => {
    if (!this.formSubmitted()) return false;
    const data = this.formData();
    const isAutreType = data.revenueType === RevenueType.Autre;
    if (isAutreType) return false; // No error for "Autre" type - contact is optional
    if (data.isOtherContact) {
      return !data.otherContactName || data.otherContactName.trim() === '';
    } else {
      return !data.contactId || data.contactId === '';
    }
  });

  readonly reservationIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    const data = this.formData();
    if (this.isReservationType() && (!data.reservationId || data.reservationId === '')) {
      return 'Reservation is required for this revenue type';
    }
    return '';
  });

  readonly reservationIdHasError = computed(() => {
    if (!this.formSubmitted()) return false;
    return this.isReservationType() && (!this.formData().reservationId || this.formData().reservationId === '');
  });

  // Check if contact field should be disabled (for reservation types, contact auto-fills from reservation)
  readonly isContactDisabled = computed(() => {
    return this.isReservationType();
  });

  readonly totalAmount = computed(() => {
    return this.payments().reduce((sum, payment) => {
      const amountWithVat = payment.amount * (1 + payment.vatPercent / 100);
      return sum + amountWithVat;
    }, 0);
  });

  ngOnInit(): void {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.transactionId.set(id);
      this.loadTransaction(id);
    } else {
      // Check for query parameters to pre-fill form (e.g., from leasing list)
      const queryParams = this.route.snapshot.queryParams;
      console.log('[AddRevenue] Query params received:', queryParams);

      if (queryParams['leaseId'] || queryParams['propertyId'] || queryParams['contactId']) {
        // Load properties and contacts first, then pre-fill
        requestAnimationFrame(() => {
          this.loadPropertiesAndContacts(() => {
            console.log('[AddRevenue] Properties and contacts loaded, now pre-filling form');
            this.preFillFromQueryParams(queryParams);
          });
        });
      } else {
        requestAnimationFrame(() => {
          this.loadProperties();
          this.loadContacts();
        });
      }
    }
  }

  // Load properties and contacts together, then call callback
  loadPropertiesAndContacts(callback?: () => void): void {
    this.isLoadingProperties.set(true);
    this.isLoadingContacts.set(true);

    const companyId = this.userService.getCurrentUser()?.companyId;

    const propertiesRequest = {
      currentPage: 1,
      pageSize: 1000,
      ignore: true,
      companyId: companyId,
      isArchived: false,
    };

    const contactsRequest = {
      currentPage: 1,
      pageSize: 10000,
      ignore: true,
      type: ContactType.Tenant,
      isArchived: false,
    };

    forkJoin({
      properties: this.propertyService.list(propertiesRequest),
      contacts: this.contactService.list(contactsRequest),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ properties, contacts }) => {
        console.log('[AddRevenue] Properties loaded:', properties.result.length);
        console.log('[AddRevenue] Contacts loaded:', contacts.result.length);

        // Set properties
        this.properties.set(properties.result);
        const propertyOptions: ZardComboboxOption[] = properties.result.map((property) => {
          const parts: string[] = [];
          if (property.identifier) parts.push(property.identifier);
          if (property.name) parts.push(property.name);
          if (property.address) parts.push(property.address);
          return {
            value: property.id,
            label: parts.join(' - '),
          };
        });
        this.propertyOptions.set(propertyOptions);
        this.isLoadingProperties.set(false);

        // Filter contacts by companyId if available
        const filteredContacts = companyId
          ? (contacts.result || []).filter(contact => contact.companyId === companyId)
          : (contacts.result || []);

        this.contacts.set(filteredContacts);
        const contactOptions: ZardComboboxOption[] = filteredContacts.map((contact) => {
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
        this.contactOptions.set(contactOptions);
        this.isLoadingContacts.set(false);

        this.cdr.markForCheck();

        // Call callback after data is loaded
        if (callback) {
          setTimeout(() => callback(), 100);
        }
      },
      error: (error) => {
        console.error('[AddRevenue] Error loading properties/contacts:', error);
        this.isLoadingProperties.set(false);
        this.isLoadingContacts.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  preFillFromQueryParams(queryParams: any): void {
    console.log('[AddRevenue] Pre-filling form with query params:', queryParams);

    // Build updated form data object
    let updatedFormData = { ...this.formData() };

    // Pre-fill property if provided
    if (queryParams['propertyId']) {
      console.log('[AddRevenue] Setting propertyId:', queryParams['propertyId']);
      const property = this.properties().find(p => p.id === queryParams['propertyId']);
      console.log('[AddRevenue] Found property:', property);
      if (property) {
        this.selectedProperty.set(property);
      }
      updatedFormData.propertyId = queryParams['propertyId'];
    }

    // Pre-fill contact if provided
    if (queryParams['contactId']) {
      console.log('[AddRevenue] Setting contactId:', queryParams['contactId']);
      updatedFormData.contactId = queryParams['contactId'];
      updatedFormData.isOtherContact = false;
    }

    // Pre-fill revenue type if provided
    if (queryParams['revenueType'] !== undefined) {
      const revenueType = parseInt(queryParams['revenueType'], 10);
      console.log('[AddRevenue] Setting revenueType:', revenueType);
      updatedFormData.revenueType = revenueType as RevenueType;
    }

    // Set all form data at once
    this.formData.set(updatedFormData);
    console.log('[AddRevenue] Form data after initial set:', this.formData());

    // Load leases if propertyId was set
    if (queryParams['propertyId']) {
      console.log('[AddRevenue] Loading leases for property:', queryParams['propertyId']);
      this.loadLeases();

      // Pre-fill lease after leases are loaded
      if (queryParams['leaseId']) {
        console.log('[AddRevenue] Will set leaseId after leases load:', queryParams['leaseId']);
        // Wait for leases to load, then set leaseId
        const checkLeases = setInterval(() => {
          if (this.leases().length > 0 && !this.isLoadingLeases()) {
            clearInterval(checkLeases);
            console.log('[AddRevenue] Leases loaded, setting leaseId:', queryParams['leaseId']);
            this.formData.update(data => ({
              ...data,
              leaseId: queryParams['leaseId'],
            }));
            console.log('[AddRevenue] LeaseId set:', this.formData().leaseId);
            this.cdr.markForCheck();
          }
        }, 100);

        // Timeout after 3 seconds
        setTimeout(() => {
          clearInterval(checkLeases);
        }, 3000);
      }
    } else if (queryParams['leaseId']) {
      // If no propertyId, set leaseId immediately
      console.log('[AddRevenue] Setting leaseId (no property):', queryParams['leaseId']);
      this.formData.update(data => ({
        ...data,
        leaseId: queryParams['leaseId'],
      }));
    }

    // Pre-fill deposit price if provided
    if (queryParams['depositPrice'] !== undefined) {
      const depositPrice = parseFloat(queryParams['depositPrice']);
      console.log('[AddRevenue] Setting depositPrice:', depositPrice);
      if (depositPrice > 0) {
        this.payments.set([
          { amount: depositPrice, vatPercent: 0, description: 'Deposit' }
        ]);
      }
    }

    // Pre-fill status if provided (will be set after transaction creation)
    if (queryParams['status'] !== undefined) {
      const status = parseInt(queryParams['status'], 10);
      console.log('[AddRevenue] Setting initialStatus:', status);
      this.initialStatus.set(status as TransactionStatus);
    }

    console.log('[AddRevenue] Final form data:', this.formData());
    console.log('[AddRevenue] Final payments:', this.payments());
    console.log('[AddRevenue] Property options count:', this.propertyOptions().length);
    console.log('[AddRevenue] Contact options count:', this.contactOptions().length);
    console.log('[AddRevenue] Lease options count:', this.leaseOptions().length);
    this.cdr.markForCheck();
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

  loadContacts(type?: ContactType): void {
    this.isLoadingContacts.set(true);

    const request: any = {
      currentPage: 1,
      pageSize: 1000,
      ignore: true,
      isArchived: false,
    };

    if (type !== undefined) {
      request.type = type;
    }

    setTimeout(() => {
      this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.contacts.set(response.result);
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
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
          this.isLoadingContacts.set(false);
          this.cdr.markForCheck();
        },
      });
    }, 0);
  }

  loadReservations(): void {
    this.isLoadingReservations.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: true,
      companyId: companyId,
      isArchived: false,
    };

    setTimeout(() => {
      this.reservationService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.reservations.set(response.result);
          const options: ZardComboboxOption[] = response.result.map((reservation) => {
            // Format: {tenant name} - {property ref} - {start date} to {end date} - {price} MAD
            const tenantName = reservation.contactName || 'Unknown';
            const propertyRef = reservation.propertyIdentifier || reservation.propertyName || 'Unknown Property';
            const startDate = new Date(reservation.startDate).toLocaleDateString();
            const endDate = new Date(reservation.endDate).toLocaleDateString();
            const price = reservation.totalAmount.toFixed(2);
            return {
              value: reservation.id,
              label: `${tenantName} - ${propertyRef} - ${startDate} to ${endDate} - ${price} MAD`,
            };
          });
          this.reservationOptions.set(options);
          this.isLoadingReservations.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading reservations:', error);
          this.isLoadingReservations.set(false);
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

  updateIsOtherContact(value: boolean): void {
    this.formData.update(data => ({
      ...data,
      isOtherContact: value,
      contactId: value ? '' : data.contactId,
      otherContactName: value ? data.otherContactName : '',
    }));
    this.cdr.markForCheck();
  }

  updateOtherContactName(value: string): void {
    this.formData.update(data => ({ ...data, otherContactName: value || '' }));
    this.cdr.markForCheck();
  }

  updateReservationId(value: string): void {
    this.formData.update(data => ({ ...data, reservationId: value || '' }));

    // Auto-fill contact from reservation
    if (value) {
      const reservation = this.reservations().find(r => r.id === value);
      if (reservation && reservation.contactId) {
        // Set the contact to the reservation's tenant
        this.formData.update(data => ({
          ...data,
          contactId: reservation.contactId,
          isOtherContact: false,
          otherContactName: ''
        }));
      }
    }

    this.cdr.markForCheck();
  }

  loadTransaction(id: string): void {
    this.isLoading.set(true);
    this.transactionService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (transaction: Transaction) => {
        // Populate form data
        const hasOtherContact = !transaction.contactId && !!transaction.otherContactName;
        this.formData.set({
          propertyId: transaction.propertyId || '',
          leaseId: transaction.leaseId || '',
          revenueType: transaction.revenueType || RevenueType.Loyer,
          contactId: transaction.contactId || '',
          isOtherContact: hasOtherContact,
          otherContactName: transaction.otherContactName || '',
          reservationId: transaction.reservationId || '',
          date: transaction.date ? new Date(transaction.date) : new Date(),
          description: transaction.description || '',
        });

        // Populate payments
        if (transaction.payments && transaction.payments.length > 0) {
          this.payments.set(transaction.payments);
        }

        // Load attachments
        if (transaction.attachments && transaction.attachments.length > 0) {
          this.existingAttachments.set(
            transaction.attachments.map((att) => ({
              id: att.id,
              url: att.url,
              fileName: att.fileName || att.originalFileName || 'Unknown',
              size: att.fileSize || 0,
              createdAt: att.createdAt || '',
            }))
          );
        } else {
          this.existingAttachments.set([]);
        }

        // Reset files to delete
        this.filesToDelete.set(new Set());

        // Load properties and contacts first, then set selected values

        const contactRequest: any = {
          currentPage: 1,
          pageSize: 1000,
          ignore: true,
          isArchived: false,
        };

        if (transaction.revenueType === RevenueType.Maintenance) {
          contactRequest.type = ContactType.Service;
        }

        forkJoin({
          properties: this.propertyService.list({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            companyId: this.userService.getCurrentUser()?.companyId,
            isArchived: false,
          }),
          contacts: this.contactService.list(contactRequest),
        }).pipe(takeUntil(this.destroy$)).subscribe({
          next: ({ properties, contacts }) => {
            // Set properties
            this.properties.set(properties.result);
            const propertyOptions: ZardComboboxOption[] = properties.result.map((property) => {
              const parts: string[] = [];
              if (property.identifier) parts.push(property.identifier);
              if (property.name) parts.push(property.name);
              if (property.address) parts.push(property.address);
              return {
                value: property.id,
                label: parts.join(' - '),
              };
            });
            this.propertyOptions.set(propertyOptions);

            // Set selected property
            if (transaction.propertyId) {
              const property = properties.result.find(p => p.id === transaction.propertyId);
              this.selectedProperty.set(property || null);
              if (property) {
                this.loadLeases();
              }
            }

            // Filter contacts by companyId if available (contacts that belong to current company, not shared)
            const companyId = this.userService.getCurrentUser()?.companyId;
            const filteredContacts = companyId
              ? (contacts.result || []).filter(contact => contact.companyId === companyId)
              : (contacts.result || []);

            this.contacts.set(filteredContacts);
            const contactOptions: ZardComboboxOption[] = filteredContacts.map((contact) => {
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
            this.contactOptions.set(contactOptions);

            this.isLoading.set(false);
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error loading properties/contacts:', error);
            this.isLoading.set(false);
            this.cdr.markForCheck();
          },
        });
      },
      error: (error) => {
        console.error('Error loading transaction:', error);
        this.toastService.error('Failed to load transaction');
        this.isLoading.set(false);
        this.router.navigate(['/transaction']);
        this.cdr.markForCheck();
      },
    });
  }

  updateRevenueType(value: string): void {
    const type = parseInt(value) as RevenueType;

    // Reset contact fields when revenue type changes
    this.formData.update(data => ({
      ...data,
      revenueType: type,
      contactId: '',
      isOtherContact: false,
      otherContactName: ''
    }));

    // Load reservations if reservation type is selected
    if (type === RevenueType.ReservationFull || type === RevenueType.ReservationPart) {
      this.loadReservations();
    }

    // Load appropriate contacts based on revenue type
    if (type === RevenueType.Maintenance) {
      this.loadContacts(ContactType.Service);
    } else {
      this.loadContacts();
    }

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

      const transactionId = this.transactionId();

      if (transactionId) {
        // Update existing transaction
        // Normalize date to UTC midnight to avoid timezone shifts
        const normalizedDate = normalizeDateToUTCMidnight(data.date);
        const isAutreType = data.revenueType === RevenueType.Autre;
        const useOtherContact = data.isOtherContact || isAutreType;
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
                root: 'transaction',
              });
            };
            reader.onerror = () => {
              resolve({
                fileName: file.name,
                base64Content: '',
                root: 'transaction',
              });
            };
            reader.readAsDataURL(file.file);
          });
        });

        const attachmentsToAdd = await Promise.all(filePromises);

        const updateRequest: UpdateTransactionRequest = {
          category: TransactionType.Revenue, // Ensure category is set to Revenue
          revenueType: data.revenueType,
          leaseId: data.leaseId && data.leaseId.trim() !== '' ? data.leaseId : null,
          contactId: useOtherContact ? null : (data.contactId || null),
          otherContactName: useOtherContact ? (data.otherContactName && data.otherContactName.trim() !== '' ? data.otherContactName : null) : null,
          reservationId: data.reservationId && data.reservationId.trim() !== '' ? data.reservationId : null,
          date: normalizedDate || data.date,
          payments: this.payments(),
          description: data.description,
          attachmentsToAdd: attachmentsToAdd.length > 0 ? attachmentsToAdd : undefined,
          attachmentsToDelete: Array.from(this.filesToDelete()).length > 0 ? Array.from(this.filesToDelete()) : undefined,
        };

        console.log('[Frontend] Update Request:', {
          transactionId,
          updateRequest: JSON.stringify(updateRequest, null, 2),
          revenueType: updateRequest.revenueType,
          category: updateRequest.category,
          date: updateRequest.date,
          dateType: typeof updateRequest.date,
        });

        this.transactionService.update(transactionId, updateRequest).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            console.log('[Frontend] Update Response:', response);
            this.toastService.success('Revenue transaction updated successfully');
            this.router.navigate(['/transaction']);
            this.isSaving.set(false);
          },
          error: (error) => {
            console.error('[Frontend] Error updating transaction:', error);
            this.toastService.error('Failed to update transaction');
            this.isSaving.set(false);
            this.cdr.markForCheck();
          },
        });
      } else {
        // Create new transaction
        // Normalize date to UTC midnight to avoid timezone shifts
        const normalizedDate = normalizeDateToUTCMidnight(data.date);
        const isAutreType = data.revenueType === RevenueType.Autre;
        const useOtherContact = data.isOtherContact || isAutreType;
        const createRequest: CreateTransactionRequest = {
          category: TransactionType.Revenue, // Maps to TransactionCategory.Revenue (0) in backend
          revenueType: data.revenueType,
          propertyId: data.propertyId && data.propertyId.trim() !== '' ? data.propertyId : null,
          leaseId: data.leaseId && data.leaseId.trim() !== '' ? data.leaseId : null,
          contactId: useOtherContact ? null : (data.contactId || null),
          otherContactName: useOtherContact ? (data.otherContactName && data.otherContactName.trim() !== '' ? data.otherContactName : null) : null,
          reservationId: data.reservationId && data.reservationId.trim() !== '' ? data.reservationId : null,
          date: normalizedDate || data.date,
          payments: this.payments(),
          description: data.description,
          attachments: attachments,
        };

        this.transactionService.create(createRequest).pipe(takeUntil(this.destroy$)).subscribe({
          next: (createdTransaction) => {
            // If initial status is provided (e.g., Paid for deposits), update it
            const statusToSet = this.initialStatus();
            if (statusToSet !== null && createdTransaction.id) {
              this.transactionService.updateStatus(createdTransaction.id, statusToSet).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                  this.toastService.success('Revenue transaction created successfully');
                  this.router.navigate(['/transaction']);
                  this.isSaving.set(false);
                },
                error: (error) => {
                  console.error('Error updating transaction status:', error);
                  // Still show success since transaction was created
                  this.toastService.success('Revenue transaction created successfully');
                  this.router.navigate(['/transaction']);
                  this.isSaving.set(false);
                },
              });
            } else {
              this.toastService.success('Revenue transaction created successfully');
              this.router.navigate(['/transaction']);
              this.isSaving.set(false);
            }
          },
          error: (error) => {
            console.error('Error creating transaction:', error);
            this.toastService.error('Failed to create transaction');
            this.isSaving.set(false);
            this.cdr.markForCheck();
          },
        });
      }
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

  readonly hasExistingAttachments = computed(() => {
    return this.existingAttachments().length > 0;
  });

  readonly existingAttachmentsCount = computed(() => {
    const toDelete = this.filesToDelete();
    return this.existingAttachments().filter(att => !toDelete.has(att.id)).length;
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

    return images;
  });

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

