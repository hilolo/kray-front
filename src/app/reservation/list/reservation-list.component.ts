import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardCalendarYearViewComponent, CalendarYearViewReservation } from '@shared/components/calendar-year-view/calendar-year-view.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import type { Reservation } from '@shared/models/reservation/reservation.model';
import { ReservationStatus } from '@shared/models/reservation/reservation.model';
import type { ReservationListRequest } from '@shared/models/reservation/reservation-list-request.model';
import { ReservationService } from '@shared/services/reservation.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { ToastService } from '@shared/services/toast.service';
import { UserService } from '@shared/services/user.service';
import { ContactService } from '@shared/services/contact.service';
import { PropertyService } from '@shared/services/property.service';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';
import type { Property } from '@shared/models/property/property.model';
import { PropertyCategory } from '@shared/models/property/property.model';
import { TransactionType, RevenueType, TransactionStatus, type Transaction } from '@shared/models/transaction/transaction.model';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardAvatarComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    ZardDatatablePaginationComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardComboboxComponent,
    ZardImageHoverPreviewDirective,
    ZardSwitchComponent,
    ZardCalendarYearViewComponent,
    PropertyPricePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reservation-list.component.html',
})
export class ReservationListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservationService = inject(ReservationService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly contactService = inject(ContactService);
  private readonly propertyService = inject(PropertyService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal('');
  readonly searchInput = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10);
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly showCalendarView = signal(false);
  readonly reservations = signal<Reservation[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly updatingStatus = signal<Set<string>>(new Set());
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

  // Template references for comboboxes
  readonly tenantComboboxRef = viewChild<ZardComboboxComponent>('tenantCombobox');
  readonly propertyComboboxRef = viewChild<ZardComboboxComponent>('propertyCombobox');
  readonly propertyComboboxCalendarRef = viewChild<ZardComboboxComponent>('propertyComboboxCalendar');

  // Check if any filters are active
  readonly hasActiveFilters = computed(() => {
    return (this.searchQuery() && this.searchQuery().trim() !== '') || 
           this.selectedTenant() !== null || 
           this.selectedProperty() !== null;
  });

  // Check if calendar has active filters (only property for calendar view)
  readonly hasCalendarFilters = computed(() => {
    return this.selectedProperty() !== null;
  });

  // Template references for custom cells
  readonly propertyCell = viewChild<TemplateRef<any>>('propertyCell');
  readonly contactCell = viewChild<TemplateRef<any>>('contactCell');
  readonly datesCell = viewChild<TemplateRef<any>>('datesCell');
  readonly amountCell = viewChild<TemplateRef<any>>('amountCell');
  readonly transactionCell = viewChild<TemplateRef<any>>('transactionCell');
  readonly statusCell = viewChild<TemplateRef<any>>('statusCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Reservation>[]>(() => [
    {
      key: 'property',
      label: 'Property',
      cellTemplate: this.propertyCell(),
    },
    {
      key: 'contact',
      label: 'Contact',
      cellTemplate: this.contactCell(),
    },
    {
      key: 'dates',
      label: 'Reservation Period',
      sortable: true,
      cellTemplate: this.datesCell(),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      cellTemplate: this.amountCell(),
    },
    {
      key: 'transaction',
      label: 'Transaction',
      sortable: true,
      cellTemplate: this.transactionCell(),
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
    return 'No reservations found';
  });

  readonly filteredReservations = computed(() => {
    return this.reservations();
  });

  readonly hasData = computed(() => {
    return this.filteredReservations().length > 0;
  });

  // Calendar reservations (only pending and active)
  readonly calendarReservations = signal<CalendarYearViewReservation[]>([]);

  // Load all reservations for calendar view (only when property is selected)
  loadCalendarReservations(): void {
    // Only load if a property is selected
    if (!this.selectedProperty()) {
      this.calendarReservations.set([]);
      return;
    }

    const companyId = this.userService.getCurrentUser()?.companyId;
    
    const request: ReservationListRequest = {
      currentPage: 1,
      pageSize: 10000, // Load all reservations for calendar
      ignore: true, // Ignore pagination
      companyId: companyId,
      propertyId: this.selectedProperty() || undefined,
    };

    this.reservationService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const calendarReservations: CalendarYearViewReservation[] = response.result
          .filter(res => res.status === ReservationStatus.Pending || res.status === ReservationStatus.Approved)
          .map(res => {
            // Normalize dates to midnight (00:00:00) for consistency
            const startDate = new Date(res.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(res.endDate);
            endDate.setHours(0, 0, 0, 0);
            
            return {
              id: res.id,
              startDate: startDate,
              endDate: endDate,
              status: res.status === ReservationStatus.Pending ? 'pending' as const : 'active' as const,
              title: res.propertyIdentifier || res.propertyName || '',
              propertyId: res.propertyId,
              propertyIdentifier: res.propertyIdentifier,
              contactName: res.contactName,
            };
          });
        this.calendarReservations.set(calendarReservations);
      },
      error: (error) => {
        console.error('Error loading calendar reservations:', error);
        this.calendarReservations.set([]);
      },
    });
  }

  // Effect to load preferences on init
  private readonly preferencesEffect = effect(() => {
    const route = this.route.snapshot.routeConfig?.path || 'reservation';
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
        this.loadReservations();
      });
  });

  ngOnInit(): void {
    this.loadTenants();
    this.loadProperties();
    this.loadReservations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchInputSubject.complete();
  }

  loadReservations(): void {
    this.isLoading.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    
    const request: ReservationListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      searchQuery: this.searchQuery() || undefined,
      companyId: companyId,
      propertyId: this.selectedProperty() || undefined,
      contactId: this.selectedTenant() || undefined,
    };

    this.reservationService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.reservations.set(response.result);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.toastService.error('Failed to load reservations');
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
    this.loadReservations();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.savePreferences();
    this.loadReservations();
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
    
    // Only fetch properties with category "location vacances"
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: false,
      companyId: companyId,
      category: PropertyCategory.LocationVacances,
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
    if (this.showCalendarView()) {
      this.loadCalendarReservations();
    } else {
      this.loadReservations();
    }
  }

  onPropertyChange(propertyId: string | null): void {
    this.selectedProperty.set(propertyId);
    this.currentPage.set(1);
    if (this.showCalendarView()) {
      // Only load calendar reservations when property is selected
      this.loadCalendarReservations();
    } else {
      this.loadReservations();
    }
  }

  onResetFilters(): void {
    this.searchInput.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.selectedTenant.set(null);
    this.selectedProperty.set(null);
    
    setTimeout(() => {
      const tenantCombobox = this.tenantComboboxRef();
      if (tenantCombobox) {
        (tenantCombobox as any).writeValue(null);
      }
      const propertyCombobox = this.propertyComboboxRef();
      if (propertyCombobox) {
        (propertyCombobox as any).writeValue(null);
      }
      const propertyComboboxCalendar = this.propertyComboboxCalendarRef();
      if (propertyComboboxCalendar) {
        (propertyComboboxCalendar as any).writeValue(null);
      }
    }, 0);
    
    if (this.showCalendarView()) {
      // Clear calendar when filters are reset
      this.loadCalendarReservations();
    } else {
      this.loadReservations();
    }
  }

  onCalendarViewToggle(show: boolean): void {
    this.showCalendarView.set(show);
    
    // Reset all filters when switching views
    this.searchInput.set('');
    this.searchQuery.set('');
    this.selectedTenant.set(null);
    this.selectedProperty.set(null);
    this.currentPage.set(1);
    
    // Clear combobox values
    setTimeout(() => {
      const tenantCombobox = this.tenantComboboxRef();
      if (tenantCombobox) {
        (tenantCombobox as any).writeValue(null);
      }
      const propertyCombobox = this.propertyComboboxRef();
      if (propertyCombobox) {
        (propertyCombobox as any).writeValue(null);
      }
      const propertyComboboxCalendar = this.propertyComboboxCalendarRef();
      if (propertyComboboxCalendar) {
        (propertyComboboxCalendar as any).writeValue(null);
      }
    }, 0);
    
    if (show) {
      // Load all reservations for calendar view (only if property is selected)
      this.loadCalendarReservations();
    } else {
      // Load list view reservations
      this.loadReservations();
    }
  }

  onCalendarReservationClick(reservationId: string): void {
    // Find the reservation in the loaded reservations
    const reservation = this.reservations().find(r => r.id === reservationId);
    if (!reservation) {
      // If not found, fetch it
      this.reservationService.getById(reservationId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          this.showReservationDialog(res);
        },
        error: (error) => {
          console.error('Error loading reservation:', error);
          this.toastService.error('Failed to load reservation details');
        },
      });
    } else {
      this.showReservationDialog(reservation);
    }
  }

  showReservationDialog(reservation: Reservation): void {
    const statusLabel = this.getStatusLabel(reservation.status);
    const statusColorClass = reservation.status === ReservationStatus.Pending 
      ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/50'
      : reservation.status === ReservationStatus.Approved
      ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50'
      : 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/50';
    
    const dialogRef = this.dialogService.create({
      zTitle: 'Reservation Details',
      zContent: `
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground mb-1">Property</p>
              <p class="text-sm font-semibold">${this.escapeHtml(reservation.propertyIdentifier || reservation.propertyName || 'N/A')}</p>
              ${reservation.propertyAddress ? `<p class="text-xs text-muted-foreground mt-1">${this.escapeHtml(reservation.propertyAddress)}</p>` : ''}
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground mb-1">Tenant</p>
              <p class="text-sm font-semibold">${this.escapeHtml(reservation.contactName || 'N/A')}</p>
              ${reservation.contactEmail ? `<p class="text-xs text-muted-foreground mt-1">${this.escapeHtml(reservation.contactEmail)}</p>` : ''}
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-medium text-muted-foreground mb-1 uppercase">START DATE</p>
              <p class="text-sm font-medium">${this.formatDate(reservation.startDate)}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-muted-foreground mb-1 uppercase">AMOUNT</p>
              <p class="text-sm font-medium">${this.formatCurrencyMAD(reservation.totalAmount)}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-muted-foreground mb-1 uppercase">END DATE</p>
              <p class="text-sm font-medium">${this.formatDate(reservation.endDate)}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-muted-foreground mb-1 uppercase">DURATION</p>
              <p class="text-sm font-medium">${this.getNights(reservation)} night${this.getNights(reservation) !== 1 ? 's' : ''}</p>
            </div>
            ${reservation.contactPhone ? `
            <div class="col-span-2">
              <p class="text-xs font-medium text-muted-foreground mb-1 uppercase">PHONE</p>
              <p class="text-sm font-medium">${this.escapeHtml(reservation.contactPhone)}</p>
            </div>
            ` : ''}
          </div>
          
          <div>
            <p class="text-sm font-medium text-muted-foreground mb-1">Status</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColorClass}">
              ${statusLabel}
            </span>
          </div>
          
          ${reservation.description ? `
            <div>
              <p class="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p class="text-sm">${this.escapeHtml(reservation.description)}</p>
            </div>
          ` : ''}
        </div>
      `,
      zViewContainerRef: this.viewContainerRef,
      zWidth: '500px',
      zOkText: 'Edit',
      zCancelText: 'Close',
      zOkIcon: 'pencil',
      zOnOk: () => {
        // Return an object to indicate OK was clicked
        return { edit: true };
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.router.navigate(['/reservation', reservation.id, 'edit']);
      }
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  onEditReservation(reservation: Reservation): void {
    this.router.navigate(['/reservation', reservation.id, 'edit']);
  }

  onViewProperty(reservation: Reservation): void {
    if (reservation.propertyId) {
      this.router.navigate(['/property/detail', reservation.propertyId]);
    }
  }

  onViewContact(reservation: Reservation): void {
    if (reservation.contactId) {
      // Reservations use tenants, so navigate to tenant detail
      this.router.navigate(['/contact/tenants', reservation.contactId, 'detail']);
    }
  }

  onDeleteReservation(reservation: Reservation): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Reservation',
      zDescription: `Are you sure you want to delete the reservation for ${reservation.propertyName}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.isDeleting.set(true);
        this.reservationService.delete(reservation.id).subscribe({
          next: () => {
            this.toastService.success('Reservation deleted successfully');
            this.loadReservations();
            this.isDeleting.set(false);
          },
          error: (error) => {
            console.error('Error deleting reservation:', error);
            this.toastService.error('Failed to delete reservation');
            this.isDeleting.set(false);
          },
        });
      }
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
    const reservations = this.filteredReservations();
    return reservations.length > 0 && reservations.every((reservation) => this.isSelected(reservation.id));
  });

  readonly hasSelectedItems = computed(() => {
    return this.selectedRows().size > 0;
  });

  readonly selectedReservations = computed(() => {
    const selectedIds = this.selectedRows();
    return this.filteredReservations().filter(reservation => selectedIds.has(reservation.id));
  });

  toggleSelectAll(): void {
    const reservations = this.filteredReservations();
    const allSelected = this.allSelected();
    const selected = new Set<string>();
    if (!allSelected) {
      reservations.forEach((reservation) => selected.add(reservation.id));
    }
    this.selectedRows.set(selected);
  }


  savePreferences(): void {
    const route = this.route.snapshot.routeConfig?.path || 'reservation';
    this.preferencesService.setPreferences(route, {
      pageSize: this.pageSize(),
      viewType: this.viewMode(),
    });
  }

  // Helper methods
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

  getStatusColor(status: ReservationStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case ReservationStatus.Pending:
        return 'outline';
      case ReservationStatus.Approved:
        return 'default';
      case ReservationStatus.Cancelled:
        return 'secondary';
      default:
        return 'secondary';
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

  formatCurrencyMAD(amount: number): string {
    const formattedPrice = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${formattedPrice} MAD`;
  }

  getContactInitials(reservation: Reservation): string {
    if (!reservation.contactName) return '??';
    const parts = reservation.contactName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return reservation.contactName.substring(0, 2).toUpperCase();
  }

  // Calculate duration correctly (matching edit component logic)
  // Backend sends DurationDays = (EndDate - StartDate).Days + 1, which is incorrect
  // We recalculate here to show the correct duration
  getDurationDays(reservation: Reservation): number {
    if (!reservation.startDate || !reservation.endDate) {
      return reservation.durationDays || 0;
    }

    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Get number of nights for reservation
  // Nights = difference between end date and start date (not including the end date as a night)
  // Example: Nov 15 to Nov 20 = 5 nights (Nov 15-16, 16-17, 17-18, 18-19, 19-20)
  getNights(reservation: Reservation): number {
    // Use numberOfNights if available from backend
    if (reservation.numberOfNights !== undefined && reservation.numberOfNights !== null) {
      return reservation.numberOfNights;
    }
    
    // Otherwise calculate from dates
    if (!reservation.startDate || !reservation.endDate) {
      return 0;
    }

    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds
    const diffTime = endDate.getTime() - startDate.getTime();
    // Convert to days (not using Math.ceil to avoid rounding up)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Status update handler
  onStatusChange(reservation: Reservation, newStatus: ReservationStatus): void {
    if (reservation.status === newStatus) {
      return; // No change
    }

    // Add to updating set
    const updating = new Set(this.updatingStatus());
    updating.add(reservation.id);
    this.updatingStatus.set(updating);

    this.reservationService.updateStatus(reservation.id, newStatus).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // Update local reservation status
        const reservations = this.reservations();
        const updatedReservations = reservations.map(r => 
          r.id === reservation.id ? { ...r, status: newStatus } : r
        );
        this.reservations.set(updatedReservations);
        
        // Remove from updating set
        const stillUpdating = new Set(this.updatingStatus());
        stillUpdating.delete(reservation.id);
        this.updatingStatus.set(stillUpdating);
        
        this.toastService.success(`Reservation status updated to ${this.getStatusLabel(newStatus)}`);
      },
      error: (error) => {
        console.error('Error updating reservation status:', error);
        this.toastService.error('Failed to update reservation status');
        
        // Remove from updating set
        const stillUpdating = new Set(this.updatingStatus());
        stillUpdating.delete(reservation.id);
        this.updatingStatus.set(stillUpdating);
      },
    });
  }

  isUpdatingStatus(reservationId: string): boolean {
    return this.updatingStatus().has(reservationId);
  }

  // Expose ReservationStatus enum to template
  readonly ReservationStatus = ReservationStatus;

  // Status options for select dropdown
  readonly statusOptions = [
    { value: ReservationStatus.Pending, label: 'Pending' },
    { value: ReservationStatus.Approved, label: 'Approved' },
    { value: ReservationStatus.Cancelled, label: 'Cancelled' },
  ];

  // Transaction methods
  hasTransaction(reservationId: string): boolean {
    const reservation = this.reservations().find(r => r.id === reservationId);
    return !!(reservation?.transactions && reservation.transactions.length > 0);
  }

  getTransaction(reservationId: string): Transaction | undefined {
    const reservation = this.reservations().find(r => r.id === reservationId);
    if (reservation?.transactions && reservation.transactions.length > 0) {
      // Return the first transaction (reservations typically have one transaction)
      return reservation.transactions[0];
    }
    return undefined;
  }

  getTransactionStatusIcon(status: TransactionStatus): 'clock' | 'circle-check' | 'triangle-alert' {
    switch (status) {
      case TransactionStatus.Pending:
        return 'clock';
      case TransactionStatus.Overdue:
        return 'triangle-alert';
      case TransactionStatus.Paid:
        return 'circle-check';
      default:
        return 'clock';
    }
  }

  getTransactionStatusColorClass(status: TransactionStatus): string {
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

  onCreateTransaction(reservation: Reservation): void {
    // Navigate to add revenue page with pre-filled data for reservation
    // Use ReservationFull (4) as the revenue type for reservation transactions
    const queryParams: any = {
      reservationId: reservation.id,
      propertyId: reservation.propertyId,
      contactId: reservation.contactId,
      revenueType: RevenueType.ReservationFull, // Revenue type for full reservation payment
      status: TransactionStatus.Pending,
      totalAmount: reservation.totalAmount, // Pass reservation amount to pre-fill payment
    };

    this.router.navigate(['/transaction/add/revenue'], { queryParams });
  }
}

