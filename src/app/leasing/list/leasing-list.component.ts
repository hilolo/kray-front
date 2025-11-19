import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import type { ZardIcon } from '@shared/components/icon/icons';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Lease } from '@shared/models/lease/lease.model';
import { LeasingStatus, TypePaimentLease, PaymentMethod } from '@shared/models/lease/lease.model';
import type { LeaseListRequest } from '@shared/models/lease/lease-list-request.model';
import { LeaseService } from '@shared/services/lease.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { ToastService } from '@shared/services/toast.service';
import { UserService } from '@shared/services/user.service';
import { ContactService } from '@shared/services/contact.service';
import { PropertyService } from '@shared/services/property.service';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';
import type { Property } from '@shared/models/property/property.model';
import { PropertyCategory } from '@shared/models/property/property.model';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { TransactionService } from '@shared/services/transaction.service';
import { TransactionType, RevenueType, TransactionStatus, type Transaction } from '@shared/models/transaction/transaction.model';
import type { TransactionListRequest } from '@shared/models/transaction/transaction-list-request.model';

@Component({
  selector: 'app-leasing-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardCheckboxComponent,
    ZardIconComponent,
    ZardAvatarComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    ZardDatatablePaginationComponent,
    ZardComboboxComponent,
    ZardImageHoverPreviewDirective,
    ZardSwitchComponent,
    TranslateModule,
    FormsModule,
    PropertyPricePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leasing-list.component.html',
})
export class LeasingListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly leaseService = inject(LeaseService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly contactService = inject(ContactService);
  private readonly propertyService = inject(PropertyService);
  private readonly transactionService = inject(TransactionService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal('');
  readonly searchInput = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10);
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly showArchived = signal(false);
  readonly archivedLeases = signal<Lease[]>([]);
  readonly leases = signal<Lease[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly isArchiving = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly selectedTenant = signal<string | null>(null);
  readonly selectedProperty = signal<string | null>(null);
  
  // Tenants and Properties for filtering
  readonly tenants = signal<Contact[]>([]);
  readonly tenantOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingTenants = signal(false);
  
  readonly properties = signal<Property[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingProperties = signal(false);

  // Deposit transactions cache (leaseId -> Transaction)
  readonly depositTransactions = signal<Map<string, Transaction>>(new Map());
  readonly isLoadingDeposits = signal(false);

  // Rent transactions cache (leaseId -> Transaction[])
  readonly rentTransactions = signal<Map<string, Transaction[]>>(new Map());

  // Template references for comboboxes (to reset internal values)
  readonly tenantComboboxRef = viewChild<ZardComboboxComponent>('tenantCombobox');
  readonly propertyComboboxRef = viewChild<ZardComboboxComponent>('propertyCombobox');

  // Check if any filters are active
  readonly hasActiveFilters = computed(() => {
    return (this.searchQuery() && this.searchQuery().trim() !== '') || 
           this.selectedTenant() !== null || 
           this.selectedProperty() !== null;
  });

  // Template references for custom cells
  readonly propertyCell = viewChild<TemplateRef<any>>('propertyCell');
  readonly tenantCell = viewChild<TemplateRef<any>>('tenantCell');
  readonly datesCell = viewChild<TemplateRef<any>>('datesCell');
  readonly depositCell = viewChild<TemplateRef<any>>('depositCell');
  readonly rentCell = viewChild<TemplateRef<any>>('rentCell');
  readonly paymentCell = viewChild<TemplateRef<any>>('paymentCell');
  readonly statusCell = viewChild<TemplateRef<any>>('statusCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Lease>[]>(() => [
    {
      key: 'property',
      label: 'Property',
      cellTemplate: this.propertyCell(),
    },
    {
      key: 'tenant',
      label: 'Tenant',
      cellTemplate: this.tenantCell(),
    },
    {
      key: 'dates',
      label: 'Tenancy Period',
      sortable: true,
      cellTemplate: this.datesCell(),
    },
    {
      key: 'deposit',
      label: 'Deposit',
      sortable: true,
      cellTemplate: this.depositCell(),
    },
    {
      key: 'rent',
      label: 'Rent',
      sortable: true,
      cellTemplate: this.rentCell(),
    },
    {
      key: 'payment',
      label: 'Payment',
      sortable: true,
      cellTemplate: this.paymentCell(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      cellTemplate: this.statusCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '50px',
      cellTemplate: this.actionsCell(),
    },
  ]);


  readonly emptyMessage = computed(() => {
    if (this.showArchived()) {
      return 'No archived leases found';
    }
    return 'No leases found';
  });

  readonly filteredLeases = computed(() => {
    const leases = this.showArchived() ? this.archivedLeases() : this.leases();
    return leases;
  });

  readonly hasData = computed(() => {
    return this.filteredLeases().length > 0;
  });

  // Effect to load preferences on init
  private readonly preferencesEffect = effect(() => {
    const route = this.route.snapshot.routeConfig?.path || 'leasing';
    const prefs = this.preferencesService.getPreferences(route);
    if (prefs) {
      this.pageSize.set(prefs.pageSize || 10);
      this.viewMode.set((prefs.viewType || 'list') as 'list' | 'card');
    }
  });

  // Effect to debounce search input
  private readonly searchEffect = effect(() => {
    this.searchInputSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.currentPage.set(1);
        this.loadLeases();
      });
  });

  ngOnInit(): void {
    this.loadTenants();
    this.loadProperties();
    this.loadLeases();
  }

  // Load deposit transactions from lease data (transactions are included in lease response)
  loadDepositTransactions(): void {
    const leases = this.filteredLeases();
    const depositMap = new Map<string, Transaction>();
    const rentMap = new Map<string, Transaction[]>();

    // Check transactions that come with each lease
    leases.forEach(lease => {
      if (lease.transactions && lease.transactions.length > 0) {
        // Find deposit transaction: Revenue type (0) with revenueType: 1 (Caution) - any status
        const depositTransaction = lease.transactions.find(t => {
          // Check both 'type' and 'category' fields (backend uses 'category')
          const transactionType = t.type ?? (t as any).category;
          const categoryValue = (t as any).category;
          const isRevenue = transactionType === TransactionType.Revenue || 
                          categoryValue === TransactionType.Revenue;
          const revenueTypeValue = t.revenueType;
          const isCaution = revenueTypeValue === RevenueType.Caution;
          
          return isRevenue && isCaution;
        });
        
        if (depositTransaction) {
          depositMap.set(lease.id, depositTransaction);
        }

        // Find all rent transactions: Revenue type with revenueType: 0 (Loyer)
        // Exclude the deposit transaction (which is Caution, not Loyer)
        const depositId = depositTransaction?.id;
        const rentTransactions = lease.transactions.filter(t => {
          // Exclude deposit transaction
          if (depositId && t.id === depositId) {
            return false;
          }
          
          const transactionType = t.type ?? (t as any).category;
          const categoryValue = (t as any).category;
          const isRevenue = transactionType === TransactionType.Revenue || 
                          categoryValue === TransactionType.Revenue;
          const revenueTypeValue = t.revenueType;
          const isLoyer = revenueTypeValue === RevenueType.Loyer;
          
          return isRevenue && isLoyer;
        });
        
        if (rentTransactions.length > 0) {
          rentMap.set(lease.id, rentTransactions);
        }
      }
    });

    this.depositTransactions.set(depositMap);
    this.rentTransactions.set(rentMap);
    this.isLoadingDeposits.set(false);
  }

  // Get deposit transaction for a lease
  getDepositTransaction(leaseId: string): Transaction | undefined {
    return this.depositTransactions().get(leaseId);
  }

  // Check if deposit exists for a lease
  hasDeposit(leaseId: string): boolean {
    return this.depositTransactions().has(leaseId);
  }

  // Get deposit status icon
  getDepositStatusIcon(status: TransactionStatus): ZardIcon {
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

  // Get deposit status color class
  getDepositStatusColorClass(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.Pending:
        return 'text-yellow-600 dark:text-yellow-500';
      case TransactionStatus.Overdue:
        return 'text-red-600 dark:text-red-500';
      case TransactionStatus.Paid:
        return 'text-green-600 dark:text-green-500';
      default:
        return 'text-muted-foreground';
    }
  }

  // Create deposit transaction
  onCreateDeposit(lease: Lease): void {
    const companyId = this.userService.getCurrentUser()?.companyId;
    if (!companyId) {
      this.toastService.error('Company ID not found');
      return;
    }

    // Navigate to add revenue page with pre-filled data
    // Deposit should use revenueType: 1 (Caution), status: 2 (Paid)
    const queryParams = {
      leaseId: lease.id,
      propertyId: lease.propertyId,
      contactId: lease.contactId,
      revenueType: RevenueType.Caution, // revenueType: 1 (Caution) for deposits
      status: TransactionStatus.Paid, // Status 2 (Paid)
      depositPrice: lease.depositPrice || 0,
    };

    this.router.navigate(['/transaction/add/revenue'], { queryParams });
  }

  // Get rent transactions for a lease
  getRentTransactions(leaseId: string): Transaction[] {
    return this.rentTransactions().get(leaseId) || [];
  }

  // Count paid rent transactions
  getPaidRentCount(leaseId: string): number {
    const transactions = this.getRentTransactions(leaseId);
    return transactions.filter(t => t.status === TransactionStatus.Paid).length;
  }

  // Count overdue rent transactions
  getOverdueRentCount(leaseId: string): number {
    const transactions = this.getRentTransactions(leaseId);
    return transactions.filter(t => t.status === TransactionStatus.Overdue).length;
  }

  // Count pending rent transactions
  getPendingRentCount(leaseId: string): number {
    const transactions = this.getRentTransactions(leaseId);
    return transactions.filter(t => t.status === TransactionStatus.Pending).length;
  }

  // Navigate to transaction list with filters
  onViewRentSituation(lease: Lease): void {
    // Navigate to transaction list with Revenue tab selected and filters applied
    const queryParams: any = {
      type: TransactionType.Revenue, // Set to Revenue tab
      propertyId: lease.propertyId,
      contactId: lease.contactId,
    };

    this.router.navigate(['/transaction'], { queryParams });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchInputSubject.complete();
  }

  loadLeases(): void {
    this.isLoading.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    
    const request: LeaseListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      searchQuery: this.searchQuery() || undefined,
      companyId: companyId,
      propertyId: this.selectedProperty() || undefined,
      contactId: this.selectedTenant() || undefined,
      // Only include isArchived when showing archived (true), otherwise omit it so backend defaults to false
      ...(this.showArchived() ? { isArchived: true } : {}),
    };

    this.leaseService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (this.showArchived()) {
          this.archivedLeases.set(response.result);
        } else {
          this.leases.set(response.result);
        }
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
        // Load deposit transactions after leases are loaded
        this.loadDepositTransactions();
      },
      error: (error) => {
        console.error('Error loading leases:', error);
        this.toastService.error('Failed to load leases');
        this.isLoading.set(false);
      },
    });
  }

  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    this.searchInputSubject.next(value);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadLeases();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.savePreferences();
    this.loadLeases();
  }

  onViewModeChange(mode: 'list' | 'card'): void {
    this.viewMode.set(mode);
    this.savePreferences();
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
        const options: ZardComboboxOption[] = response.result.map(contact => ({
          value: contact.id,
          label: this.getTenantDisplayName(contact),
        }));
        this.tenantOptions.set(options);
        this.isLoadingTenants.set(false);
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
        this.isLoadingTenants.set(false);
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
      category: PropertyCategory.Location, // Only show properties with category "location"
    };
    
    this.propertyService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.properties.set(response.result);
        const options: ZardComboboxOption[] = response.result.map(property => {
          const parts: string[] = [];
          if (property.identifier) parts.push(property.identifier);
          if (property.name) parts.push(property.name);
          if (property.address) parts.push(property.address);
          return {
            value: property.id,
            label: parts.join(' - ') || 'Unnamed Property',
          };
        });
        this.propertyOptions.set(options);
        this.isLoadingProperties.set(false);
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.isLoadingProperties.set(false);
      },
    });
  }

  getTenantDisplayName(contact: Contact): string {
    let name = '';
    if (contact.isACompany) {
      name = contact.companyName || '';
    } else {
      const firstName = contact.firstName || '';
      const lastName = contact.lastName || '';
      name = `${firstName} ${lastName}`.trim();
    }
    
    if (contact.identifier) {
      return name ? `${name} (${contact.identifier})` : contact.identifier;
    }
    return name || 'Unnamed Tenant';
  }

  onTenantChange(tenantId: string | null): void {
    this.selectedTenant.set(tenantId);
    this.currentPage.set(1);
    this.loadLeases();
  }

  onPropertyChange(propertyId: string | null): void {
    this.selectedProperty.set(propertyId);
    this.currentPage.set(1);
    this.loadLeases();
  }

  onResetFilters(): void {
    // Clear search
    this.searchInput.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    
    // Clear tenant selection
    this.selectedTenant.set(null);
    
    // Clear property selection
    this.selectedProperty.set(null);
    
    // Clear combobox internal values using ControlValueAccessor
    setTimeout(() => {
      const tenantCombobox = this.tenantComboboxRef();
      if (tenantCombobox) {
        (tenantCombobox as any).writeValue(null);
      }
      const propertyCombobox = this.propertyComboboxRef();
      if (propertyCombobox) {
        (propertyCombobox as any).writeValue(null);
      }
    }, 0);
    
    // Reload leases
    this.loadLeases();
  }

  onShowArchivedChange(show: boolean): void {
    this.showArchived.set(show);
    this.currentPage.set(1);
    this.loadLeases();
  }

  onEditLease(lease: Lease): void {
    this.router.navigate(['/leasing', lease.id, 'edit']);
  }

  onViewProperty(lease: Lease): void {
    if (lease.propertyId) {
      this.router.navigate(['/property/detail', lease.propertyId]);
    }
  }

  onViewContact(lease: Lease): void {
    if (lease.contactId) {
      // Leases use tenants, so navigate to tenant detail
      this.router.navigate(['/contact/tenants', lease.contactId, 'detail']);
    }
  }

  onDeleteLease(lease: Lease): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Lease',
      zDescription: `Are you sure you want to delete the lease for ${lease.propertyName}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.isDeleting.set(true);
        this.leaseService.delete(lease.id).subscribe({
          next: () => {
            this.toastService.success('Lease deleted successfully');
            this.loadLeases();
            this.isDeleting.set(false);
          },
          error: (error) => {
            console.error('Error deleting lease:', error);
            this.toastService.error('Failed to delete lease');
            this.isDeleting.set(false);
          },
        });
      }
    });
  }

  onToggleArchive(lease: Lease): void {
    const action = lease.isArchived ? 'activate' : 'archive';
    this.leaseService.toggleArchive(lease.id, !lease.isArchived).subscribe({
      next: () => {
        this.toastService.success(`Lease ${action}d successfully`);
        this.loadLeases();
      },
      error: (error) => {
        console.error(`Error ${action}ing lease:`, error);
        this.toastService.error(`Failed to ${action} lease`);
      },
    });
  }

  onSelectionChange(selection: Set<string>): void {
    this.selectedRows.set(selection);
  }

  toggleSelect(id: string): void {
    const selected = new Set(this.selectedRows());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedRows.set(selected);
  }

  isSelected(id: string): boolean {
    return this.selectedRows().has(id);
  }

  allSelected = computed(() => {
    const leases = this.filteredLeases();
    return leases.length > 0 && leases.every((lease) => this.isSelected(lease.id));
  });

  readonly hasSelectedItems = computed(() => {
    return this.selectedRows().size > 0;
  });

  readonly selectedLeases = computed(() => {
    const selectedIds = this.selectedRows();
    return this.filteredLeases().filter(lease => selectedIds.has(lease.id));
  });

  readonly canArchiveSelected = computed(() => {
    return this.selectedLeases().some(lease => !lease.isArchived);
  });

  readonly canUnarchiveSelected = computed(() => {
    return this.selectedLeases().some(lease => lease.isArchived);
  });

  readonly archiveableCount = computed(() => {
    return this.selectedLeases().filter(lease => !lease.isArchived).length;
  });

  readonly unarchiveableCount = computed(() => {
    return this.selectedLeases().filter(lease => lease.isArchived).length;
  });

  toggleSelectAll(): void {
    const leases = this.filteredLeases();
    const allSelected = this.allSelected();
    const selected = new Set<string>();
    if (!allSelected) {
      leases.forEach((lease) => selected.add(lease.id));
    }
    this.selectedRows.set(selected);
  }

  showArchiveConfirmation(): void {
    const selectedCount = this.selectedRows().size;
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Archive Leases',
      zDescription: `Are you sure you want to archive ${selectedCount} lease${selectedCount > 1 ? 's' : ''}?`,
      zOkText: 'Archive',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.onBulkArchive();
      }
    });
  }

  showUnarchiveConfirmation(): void {
    const selectedCount = this.selectedRows().size;
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Unarchive Leases',
      zDescription: `Are you sure you want to unarchive ${selectedCount} lease${selectedCount > 1 ? 's' : ''}?`,
      zOkText: 'Unarchive',
      zCancelText: 'Cancel',
      zOkDestructive: false,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.onBulkUnarchive();
      }
    });
  }

  onBulkArchive(): void {
    const selectedLeases = this.selectedLeases().filter(lease => !lease.isArchived);
    if (selectedLeases.length === 0) {
      return;
    }

    this.isArchiving.set(true);
    const archivePromises = selectedLeases.map(lease =>
      this.leaseService.toggleArchive(lease.id, true).toPromise()
    );

    Promise.all(archivePromises).then(() => {
      this.toastService.success(`${selectedLeases.length} lease(s) archived successfully`);
      this.selectedRows.set(new Set());
      this.loadLeases();
      this.isArchiving.set(false);
    }).catch((error) => {
      console.error('Error archiving leases:', error);
      this.toastService.error('Failed to archive some leases');
      this.isArchiving.set(false);
    });
  }

  onBulkUnarchive(): void {
    const selectedLeases = this.selectedLeases().filter(lease => lease.isArchived);
    if (selectedLeases.length === 0) {
      return;
    }

    this.isArchiving.set(true);
    const unarchivePromises = selectedLeases.map(lease =>
      this.leaseService.toggleArchive(lease.id, false).toPromise()
    );

    Promise.all(unarchivePromises).then(() => {
      this.toastService.success(`${selectedLeases.length} lease(s) activated successfully`);
      this.selectedRows.set(new Set());
      this.loadLeases();
      this.isArchiving.set(false);
    }).catch((error) => {
      console.error('Error activating leases:', error);
      this.toastService.error('Failed to activate some leases');
      this.isArchiving.set(false);
    });
  }

  savePreferences(): void {
    const route = this.route.snapshot.routeConfig?.path || 'leasing';
    this.preferencesService.setPreferences(route, {
      pageSize: this.pageSize(),
      viewType: this.viewMode(),
    });
  }

  // Helper methods
  getStatusLabel(status: LeasingStatus): string {
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

  getStatusColor(status: LeasingStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case LeasingStatus.Active:
        return 'default';
      case LeasingStatus.Expired:
        return 'destructive';
      case LeasingStatus.Terminated:
        return 'secondary';
      case LeasingStatus.Pending:
        return 'outline';
      default:
        return 'secondary';
    }
  }

  getPaymentTypeLabel(type: TypePaimentLease): string {
    switch (type) {
      case TypePaimentLease.Monthly:
        return 'Monthly';
      case TypePaimentLease.Quarterly:
        return 'Quarterly';
      case TypePaimentLease.SemiAnnually:
        return 'Semi-Annually';
      case TypePaimentLease.Fully:
        return 'Full Payment';
      default:
        return 'Unknown';
    }
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.Cash:
        return 'Cash';
      case PaymentMethod.BankTransfer:
        return 'Bank Transfer';
      case PaymentMethod.Check:
        return 'Check';
      default:
        return 'Unknown';
    }
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

  getTenancyDuration(lease: Lease): number | null {
    // If tenancyDuration is already provided, use it
    if (lease.tenancyDuration !== null && lease.tenancyDuration !== undefined) {
      return lease.tenancyDuration;
    }
    
    // Otherwise, calculate from dates
    if (!lease.tenancyStart || !lease.tenancyEnd) {
      return null;
    }
    
    try {
      const startDate = new Date(lease.tenancyStart);
      const endDate = new Date(lease.tenancyEnd);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return null;
      }
      
      // Calculate difference in months
      const years = endDate.getFullYear() - startDate.getFullYear();
      const months = endDate.getMonth() - startDate.getMonth();
      const totalMonths = years * 12 + months;
      
      // Adjust for days - if end date is later in the month, count as full month
      if (endDate.getDate() >= startDate.getDate()) {
        return totalMonths;
      } else {
        return Math.max(0, totalMonths - 1);
      }
    } catch (error) {
      console.error('Error calculating tenancy duration:', error);
      return null;
    }
  }

  getTenantInitials(lease: Lease): string {
    if (!lease.tenantName) return '??';
    const parts = lease.tenantName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return lease.tenantName.substring(0, 2).toUpperCase();
  }

  getTenantIdentifier(lease: Lease): string | null {
    const tenant = this.tenants().find(t => t.id === lease.contactId);
    return tenant?.identifier || null;
  }

  getTenantAvatarUrl(lease: Lease): string | null {
    // Check if tenantAvatarUrl exists and is not empty
    if (lease.tenantAvatarUrl && lease.tenantAvatarUrl.trim() !== '') {
      return lease.tenantAvatarUrl;
    }
    
    // Fallback: try to get avatar from tenants list
    const tenant = this.tenants().find(t => t.id === lease.contactId);
    if (tenant?.avatar && tenant.avatar.trim() !== '') {
      return tenant.avatar;
    }
    
    return null;
  }

  trackByIndex(index: number): number {
    return index;
  }
}

