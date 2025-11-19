import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardTabGroupComponent, ZardTabComponent } from '@shared/components/tabs/tabs.component';
import { ZardAccordionComponent } from '@shared/components/accordion/accordion.component';
import { ZardAccordionItemComponent } from '@shared/components/accordion/accordion-item.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardFileViewerComponent } from '@shared/components/file-viewer/file-viewer.component';
import { getFileViewerType } from '@shared/utils/file-type.util';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ContactService } from '@shared/services/contact.service';
import { ReservationService } from '@shared/services/reservation.service';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType, contactTypeToString } from '@shared/models/contact/contact.model';
import type { Property } from '@shared/models/property/property.model';
import type { Lease } from '@shared/models/lease/lease.model';
import type { Reservation } from '@shared/models/reservation/reservation.model';
import type { Maintenance } from '@shared/models/maintenance/maintenance.model';
import type { Bank } from '@shared/models/bank/bank.model';
import { catchError, of } from 'rxjs';
import { LeasingStatus } from '@shared/models/lease/lease.model';
import { ReservationStatus } from '@shared/models/reservation/reservation.model';
import { MaintenanceStatus, MaintenancePriority } from '@shared/models/maintenance/maintenance.model';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import type { Transaction } from '@shared/models/transaction/transaction.model';
import { TransactionType, TransactionStatus, RevenueType, ExpenseType } from '@shared/models/transaction/transaction.model';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import type { ZardIcon } from '@shared/components/icon/icons';
import { TemplateRef, viewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardTabGroupComponent,
    ZardTabComponent,
    ZardAccordionComponent,
    ZardAccordionItemComponent,
    ZardAvatarComponent,
    ZardFileViewerComponent,
    ZardImageHoverPreviewDirective,
    PropertyPricePipe,
    ZardDatatableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-detail.component.html',
})
export class ContactDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly contactService = inject(ContactService);
  private readonly reservationService = inject(ReservationService);
  private readonly translateService = inject(TranslateService);

  // Contact data
  readonly contact = signal<Contact | null>(null);
  readonly isLoading = signal(false);
  readonly reservations = signal<Reservation[]>([]);
  readonly isLoadingReservations = signal(false);
  readonly maintenances = computed(() => {
    const contact = this.contact();
    if (!contact) return [];
    // Ensure maintenances array exists and is not null/undefined
    return Array.isArray(contact.maintenances) ? contact.maintenances : [];
  });

  // Computed values
  readonly contactName = computed(() => {
    const c = this.contact();
    if (!c) return '';
    if (c.isACompany && c.companyName) {
      return c.companyName;
    }
    return `${c.firstName} ${c.lastName}`.trim();
  });

  readonly contactInitials = computed(() => {
    const c = this.contact();
    if (!c) return 'CN';
    if (c.isACompany && c.companyName) {
      return c.companyName.substring(0, 2).toUpperCase();
    }
    const firstInitial = (c.firstName || '').charAt(0).toUpperCase();
    const lastInitial = (c.lastName || '').charAt(0).toUpperCase();
    return (firstInitial + lastInitial) || 'CN';
  });

  readonly contactType = computed(() => {
    const contact = this.contact();
    const type = contact?.type;
    console.log('[contactType computed] Contact:', contact);
    console.log('[contactType computed] Raw type:', type, 'Type of:', typeof type);
    
    if (!contact || type === undefined || type === null) {
      console.log('[contactType computed] Returning empty string - missing contact or type');
      return '';
    }
    
    // Handle numeric type (enum from backend)
    if (typeof type === 'number') {
      const typeString = contactTypeToString(type as ContactType);
      console.log('[contactType computed] Converted number', type, 'to string:', typeString);
      return typeString;
    }
    
    // Handle string type
    if (typeof type === 'string') {
      console.log('[contactType computed] Returning string type:', type);
      return type;
    }
    
    console.log('[contactType computed] Returning empty string - invalid type format');
    return '';
  });

  readonly isOwner = computed(() => {
    return this.contactType() === 'Owner';
  });

  readonly isTenant = computed(() => {
    return this.contactType() === 'Tenant';
  });

  readonly isService = computed(() => {
    return this.contactType() === 'Service';
  });

  readonly properties = computed(() => {
    const contact = this.contact();
    if (!contact) return [];
    // Ensure properties array exists and is not null/undefined
    return Array.isArray(contact.properties) ? contact.properties : [];
  });

  readonly leases = computed(() => {
    const contact = this.contact();
    if (!contact) return [];
    // Ensure leases array exists and is not null/undefined
    return Array.isArray(contact.leases) ? contact.leases : [];
  });

  readonly banks = computed(() => {
    const contact = this.contact();
    if (!contact) return [];
    // Ensure banks array exists and is not null/undefined
    return Array.isArray(contact.banks) ? contact.banks : [];
  });

  readonly hasBanks = computed(() => {
    return this.banks().length > 0;
  });

  readonly attachments = computed(() => {
    const contact = this.contact();
    if (!contact) return [];
    // Ensure attachments array exists and is not null/undefined
    // Also check attachmentCount to handle cases where array might be missing
    if (contact.attachmentCount === 0) return [];
    return Array.isArray(contact.attachments) ? contact.attachments : [];
  });

  readonly hasAttachments = computed(() => {
    const contact = this.contact();
    if (!contact) return false;
    // Check both attachmentCount and attachments array
    if (contact.attachmentCount > 0) {
      return Array.isArray(contact.attachments) && contact.attachments.length > 0;
    }
    return false;
  });

  // Transaction-related computed values
  readonly transactions = computed(() => {
    const contact = this.contact();
    if (!contact) return [];
    return Array.isArray(contact.transactions) ? contact.transactions : [];
  });

  readonly revenueTransactions = computed(() => {
    return this.transactions().filter(t => {
      const type = t.type ?? t.category;
      return type === TransactionType.Revenue;
    });
  });

  readonly expenseTransactions = computed(() => {
    return this.transactions().filter(t => {
      const type = t.type ?? t.category;
      return type === TransactionType.Expense;
    });
  });

  readonly hasTransactions = computed(() => {
    return this.transactions().length > 0;
  });

  readonly hasRevenueTransactions = computed(() => {
    return this.revenueTransactions().length > 0;
  });

  readonly hasExpenseTransactions = computed(() => {
    return this.expenseTransactions().length > 0;
  });

  // Transaction type options (same as transaction list)
  readonly revenueTypeOptions = [
    { value: RevenueType.Loyer, label: 'Loyer' },
    { value: RevenueType.Caution, label: 'Caution' },
    { value: RevenueType.FraisAgence, label: 'Frais d\'agence' },
    { value: RevenueType.ReservationPart, label: 'Reservation Part' },
    { value: RevenueType.ReservationFull, label: 'Reservation Full' },
    { value: RevenueType.Maintenance, label: 'Maintenance' },
    { value: RevenueType.Autre, label: 'Autre' },
  ];

  readonly expenseTypeOptions = [
    { value: ExpenseType.Loyer, label: 'Loyer' },
    { value: ExpenseType.Maintenance, label: 'Maintenance' },
    { value: ExpenseType.Chargee, label: 'Chargee' },
    { value: ExpenseType.Autre, label: 'Autre' },
  ];

  // Group revenue transactions by type
  readonly groupedRevenueTransactions = computed(() => {
    const revenue = this.revenueTransactions();
    const groups: Map<number, Transaction[]> = new Map();
    
    revenue.forEach(transaction => {
      const revenueType = transaction.revenueType;
      if (revenueType === undefined || revenueType === null) return;
      const key = revenueType as number;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(transaction);
    });
    
    // Convert to array of { type, label, transactions }
    return Array.from(groups.entries())
      .map(([key, transactions]) => {
        const type = key as RevenueType;
        const option = this.revenueTypeOptions.find(opt => opt.value === type);
        return {
          type,
          label: option?.label || 'Unknown',
          transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      })
      .sort((a, b) => {
        // Sort by type order in revenueTypeOptions
        const aIndex = this.revenueTypeOptions.findIndex(opt => opt.value === a.type);
        const bIndex = this.revenueTypeOptions.findIndex(opt => opt.value === b.type);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
  });

  // Group expense transactions by type
  readonly groupedExpenseTransactions = computed(() => {
    const expense = this.expenseTransactions();
    const groups: Map<number, Transaction[]> = new Map();
    
    expense.forEach(transaction => {
      const expenseType = transaction.expenseType;
      if (expenseType === undefined || expenseType === null) return;
      const key = expenseType as number;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(transaction);
    });
    
    // Convert to array of { type, label, transactions }
    return Array.from(groups.entries())
      .map(([key, transactions]) => {
        const type = key as ExpenseType;
        const option = this.expenseTypeOptions.find(opt => opt.value === type);
        return {
          type,
          label: option?.label || 'Unknown',
          transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      })
      .sort((a, b) => {
        // Sort by type order in expenseTypeOptions
        const aIndex = this.expenseTypeOptions.findIndex(opt => opt.value === a.type);
        const bIndex = this.expenseTypeOptions.findIndex(opt => opt.value === b.type);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
  });

  // Default values for accordion (all revenue groups open)
  readonly revenueAccordionDefaultValues = computed(() => {
    return this.groupedRevenueTransactions().map(g => `revenue-${g.type}`);
  });

  // Default values for accordion (all expense groups open)
  readonly expenseAccordionDefaultValues = computed(() => {
    return this.groupedExpenseTransactions().map(g => `expense-${g.type}`);
  });

  // Transaction table template references
  readonly revenueDateCell = viewChild<TemplateRef<any>>('revenueDateCell');
  readonly revenuePropertyCell = viewChild<TemplateRef<any>>('revenuePropertyCell');
  readonly revenueTypeCell = viewChild<TemplateRef<any>>('revenueTypeCell');
  readonly revenueAmountCell = viewChild<TemplateRef<any>>('revenueAmountCell');
  readonly revenueStatusCell = viewChild<TemplateRef<any>>('revenueStatusCell');

  readonly expenseDateCell = viewChild<TemplateRef<any>>('expenseDateCell');
  readonly expensePropertyCell = viewChild<TemplateRef<any>>('expensePropertyCell');
  readonly expenseTypeCell = viewChild<TemplateRef<any>>('expenseTypeCell');
  readonly expenseAmountCell = viewChild<TemplateRef<any>>('expenseAmountCell');
  readonly expenseStatusCell = viewChild<TemplateRef<any>>('expenseStatusCell');

  // Revenue columns
  readonly revenueColumns = computed<DatatableColumn<Transaction>[]>(() => {
    const dateCell = this.revenueDateCell();
    const propertyCell = this.revenuePropertyCell();
    const typeCell = this.revenueTypeCell();
    const amountCell = this.revenueAmountCell();
    const statusCell = this.revenueStatusCell();

    return [
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        cellTemplate: dateCell || undefined,
      },
      {
        key: 'property',
        label: 'Property',
        cellTemplate: propertyCell || undefined,
      },
      {
        key: 'type',
        label: 'Type',
        cellTemplate: typeCell || undefined,
      },
      {
        key: 'amount',
        label: 'Amount',
        sortable: true,
        cellTemplate: amountCell || undefined,
      },
      {
        key: 'status',
        label: 'Status',
        cellTemplate: statusCell || undefined,
      },
    ];
  });

  // Expense columns
  readonly expenseColumns = computed<DatatableColumn<Transaction>[]>(() => {
    const dateCell = this.expenseDateCell();
    const propertyCell = this.expensePropertyCell();
    const typeCell = this.expenseTypeCell();
    const amountCell = this.expenseAmountCell();
    const statusCell = this.expenseStatusCell();

    return [
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        cellTemplate: dateCell || undefined,
      },
      {
        key: 'property',
        label: 'Property',
        cellTemplate: propertyCell || undefined,
      },
      {
        key: 'type',
        label: 'Type',
        cellTemplate: typeCell || undefined,
      },
      {
        key: 'amount',
        label: 'Amount',
        sortable: true,
        cellTemplate: amountCell || undefined,
      },
      {
        key: 'status',
        label: 'Status',
        cellTemplate: statusCell || undefined,
      },
    ];
  });

  // File viewer state
  readonly fileViewerOpen = signal(false);
  readonly fileViewerUrl = signal('');
  readonly fileViewerName = signal('');
  readonly fileViewerSize = signal(0);
  readonly fileViewerImages = signal<Array<{ url: string; name: string; size: number }>>([]);
  readonly fileViewerCurrentIndex = signal(0);

  readonly editContactRoute = computed(() => {
    const contact = this.contact();
    const type = this.contactType();
    console.log('[editContactRoute computed] Contact:', contact);
    console.log('[editContactRoute computed] Type:', type);
    if (!contact || !type) {
      console.log('[editContactRoute computed] Returning empty array - missing contact or type');
      return [];
    }
    const route = ['/contact', type.toLowerCase() + 's', contact.id];
    console.log('[editContactRoute computed] Generated route:', route);
    return route;
  });

  onEditContact(): void {
    console.log('onEditContact() called');
    const contact = this.contact();
    const type = this.contactType();
    console.log('Contact:', contact);
    console.log('Contact Type:', type);
    
    const route = this.editContactRoute();
    console.log('Edit Contact Route:', route);
    
    if (route.length > 0) {
      console.log('Navigating to:', route);
      this.router.navigate(route).then(
        (success) => {
          console.log('Navigation successful:', success);
        },
        (error) => {
          console.error('Navigation error:', error);
        }
      );
    } else {
      console.warn('Route is empty, cannot navigate');
    }
  }

  ngOnInit(): void {
    const contactId = this.route.snapshot.paramMap.get('id');
    if (!contactId) {
      this.router.navigate(['/contact']);
      return;
    }

    this.loadContact(contactId);
  }

  private loadContact(id: string): void {
    this.isLoading.set(true);
    this.contactService
      .getById(id, true)
      .pipe(
        catchError((error) => {
          console.error('Error loading contact:', error);
          this.router.navigate(['/contact']);
          return of(null);
        }),
      )
      .subscribe((contact) => {
        this.isLoading.set(false);
        if (contact) {
          console.log('[loadContact] Contact loaded:', contact);
          console.log('[loadContact] Contact type:', contact.type);
          this.contact.set(contact);
          
          // Always load reservations for all contact types
          this.loadReservations(contact.id);
          
          // Maintenances are now included in the contact response when includeRelated=true
          // No need to make a separate call
        }
      });
  }

  private loadReservations(contactId: string): void {
    this.isLoadingReservations.set(true);
    this.reservationService
      .list({
        currentPage: 1,
        pageSize: 1000,
        ignore: false,
        contactId: contactId,
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading reservations:', error);
          this.isLoadingReservations.set(false);
          return of({ result: [], totalPages: 0, totalItems: 0 });
        }),
      )
      .subscribe((response) => {
        this.reservations.set(response.result);
        this.isLoadingReservations.set(false);
      });
  }


  // Helper methods
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  }

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

  getReservationStatusLabel(status: number): string {
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

  getReservationStatusBadgeType(status: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case ReservationStatus.Pending:
        return 'outline';
      case ReservationStatus.Approved:
        return 'default';
      case ReservationStatus.Cancelled:
        return 'destructive';
      default:
        return 'outline';
    }
  }

  getMaintenanceStatusLabel(status: number | string): string {
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    switch (statusNum) {
      case MaintenanceStatus.Waiting:
        return 'Waiting';
      case MaintenanceStatus.InProgress:
        return 'In Progress';
      case MaintenanceStatus.Done:
        return 'Done';
      case MaintenanceStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getMaintenanceStatusBadgeType(status: number | string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    switch (statusNum) {
      case MaintenanceStatus.Waiting:
        return 'outline';
      case MaintenanceStatus.InProgress:
        return 'default';
      case MaintenanceStatus.Done:
        return 'secondary';
      case MaintenanceStatus.Cancelled:
        return 'destructive';
      default:
        return 'outline';
    }
  }

  getMaintenancePriorityLabel(priority: number | string): string {
    const priorityNum = typeof priority === 'string' ? parseInt(priority, 10) : priority;
    switch (priorityNum) {
      case MaintenancePriority.Low:
        return 'Low';
      case MaintenancePriority.Medium:
        return 'Medium';
      case MaintenancePriority.Urgent:
        return 'Urgent';
      default:
        return 'Unknown';
    }
  }

  getMaintenancePriorityBadgeType(priority: number | string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const priorityNum = typeof priority === 'string' ? parseInt(priority, 10) : priority;
    switch (priorityNum) {
      case MaintenancePriority.Low:
        return 'secondary';
      case MaintenancePriority.Medium:
        return 'default';
      case MaintenancePriority.Urgent:
        return 'destructive';
      default:
        return 'outline';
    }
  }

  viewProperty(propertyId: string): void {
    this.router.navigate(['/property/detail', propertyId]);
  }

  viewLease(leaseId: string): void {
    // Navigate to lease detail if route exists, otherwise to property detail
    // For now, navigate to property list
    this.router.navigate(['/leasing']);
  }

  viewReservation(reservationId: string): void {
    this.router.navigate(['/reservation', reservationId, 'edit']);
  }

  viewMaintenance(maintenanceId: string): void {
    // Maintenance uses dialog, so navigate to maintenance page
    // The maintenance page will handle opening the dialog if needed
    this.router.navigate(['/maintenance']);
  }

  // File handling methods
  isFileFormatSupported(url: string): boolean {
    const type = getFileViewerType(url);
    return type === 'image' || type === 'pdf' || type === 'document' || type === 'video';
  }

  openFile(url: string, name: string, size: number): void {
    this.fileViewerUrl.set(url);
    this.fileViewerName.set(name);
    this.fileViewerSize.set(size);
    
    // If it's an image, set up image navigation
    if (getFileViewerType(url) === 'image') {
      const allImages = this.attachments()
        .filter(att => getFileViewerType(att.url) === 'image')
        .map(att => ({ url: att.url, name: att.fileName || att.originalFileName || 'Image', size: att.fileSize || 0 }));
      const currentIndex = allImages.findIndex(img => img.url === url);
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
    if (images[index]) {
      this.fileViewerUrl.set(images[index].url);
      this.fileViewerName.set(images[index].name);
      this.fileViewerSize.set(images[index].size);
    }
  }

  closeFileViewer(): void {
    this.fileViewerOpen.set(false);
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Expose getFileViewerType to template
  getFileViewerType = getFileViewerType;

  // Expose console to template for debugging
  readonly console = console;

  // Transaction helper methods (same as transaction list)
  getTransactionTypeLabel(transaction: Transaction): string | null {
    const transactionType = transaction.type ?? transaction.category;
    if (transactionType === TransactionType.Revenue) {
      const revenueType = transaction.revenueType;
      const option = this.revenueTypeOptions.find(opt => opt.value === revenueType);
      return option?.label || null;
    } else if (transactionType === TransactionType.Expense) {
      const expenseType = transaction.expenseType;
      const option = this.expenseTypeOptions.find(opt => opt.value === expenseType);
      return option?.label || null;
    }
    return null;
  }

  getStatusLabel(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.Pending:
        return 'Pending';
      case TransactionStatus.Overdue:
        return 'Overdue';
      case TransactionStatus.Paid:
        return 'Paid';
      default:
        return 'Unknown';
    }
  }

  getStatusBadge(status: TransactionStatus): 'default' | 'destructive' {
    switch (status) {
      case TransactionStatus.Pending:
        return 'default';
      case TransactionStatus.Overdue:
        return 'destructive';
      case TransactionStatus.Paid:
        return 'default';
      default:
        return 'default';
    }
  }

  getStatusIcon(status: TransactionStatus): ZardIcon {
    switch (status) {
      case TransactionStatus.Pending:
        return 'clock';
      case TransactionStatus.Overdue:
        return 'triangle-alert';
      case TransactionStatus.Paid:
        return 'circle-check';
      default:
        return 'circle';
    }
  }

  getStatusIconColorClass(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.Pending:
        return 'text-yellow-600 dark:text-yellow-500';
      case TransactionStatus.Overdue:
        return 'text-red-600 dark:text-red-500';
      case TransactionStatus.Paid:
        return 'text-green-600 dark:text-green-500';
      default:
        return '';
    }
  }

  getRowClass(transaction: Transaction): string {
    // Same color logic as transaction list
    if (transaction.status === TransactionStatus.Pending) {
      return '!bg-yellow-500/30 dark:!bg-yellow-600/40 hover:!bg-yellow-500/30 dark:hover:!bg-yellow-600/40';
    }
    
    if (transaction.status === TransactionStatus.Paid) {
      const transactionType = transaction.type ?? transaction.category;
      if (transactionType === TransactionType.Revenue) {
        return '!bg-green-500/30 dark:!bg-green-600/40 hover:!bg-green-500/30 dark:hover:!bg-green-600/40';
      } else {
        return '!bg-red-500/30 dark:!bg-red-600/40 hover:!bg-red-500/30 dark:hover:!bg-red-600/40';
      }
    }
    
    return '';
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} MAD`;
  }

  formatTransactionDate(transaction: Transaction): string {
    const date = new Date(transaction.date);
    
    const transactionType = transaction.type ?? transaction.category;
    const isLoyer = (transactionType === TransactionType.Revenue && transaction.revenueType === RevenueType.Loyer) ||
                    (transactionType === TransactionType.Expense && transaction.expenseType === ExpenseType.Loyer);
    
    if (isLoyer) {
      const monthKeys = [
        'date.months.january',
        'date.months.february',
        'date.months.march',
        'date.months.april',
        'date.months.may',
        'date.months.june',
        'date.months.july',
        'date.months.august',
        'date.months.september',
        'date.months.october',
        'date.months.november',
        'date.months.december'
      ];
      
      const monthIndex = date.getMonth();
      const monthKey = monthKeys[monthIndex];
      const translatedMonth = this.translateService.instant(monthKey);
      const year = date.getFullYear();
      
      return `${translatedMonth} ${year}`;
    }
    
    const englishDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    
    return englishDate;
  }

  viewTransaction(transaction: Transaction): void {
    const transactionType = transaction.type ?? transaction.category;
    if (transactionType === TransactionType.Revenue) {
      this.router.navigate(['/transaction/revenue', transaction.id, 'edit']);
    } else {
      this.router.navigate(['/transaction/expense', transaction.id, 'edit']);
    }
  }

  // Expose enums to template
  readonly TransactionType = TransactionType;
  readonly TransactionStatus = TransactionStatus;
  readonly RevenueType = RevenueType;
  readonly ExpenseType = ExpenseType;
}

