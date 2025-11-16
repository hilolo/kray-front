import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardPaginationComponent } from '@shared/components/pagination/pagination.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Lease } from '@shared/models/lease/lease.model';
import { LeasingStatus, TypePaimentLease, PaymentMethod } from '@shared/models/lease/lease.model';
import type { LeaseListRequest } from '@shared/models/lease/lease-list-request.model';
import { LeaseService } from '@shared/services/lease.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { ToastService } from '@shared/services/toast.service';
import { UserService } from '@shared/services/user.service';

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
    ZardPaginationComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardImageHoverPreviewDirective,
    ZardSwitchComponent,
    TranslateModule,
    FormsModule,
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
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly selectedStatus = signal<LeasingStatus | null>(null);

  // Template references for custom cells
  readonly propertyCell = viewChild<TemplateRef<any>>('propertyCell');
  readonly tenantCell = viewChild<TemplateRef<any>>('tenantCell');
  readonly datesCell = viewChild<TemplateRef<any>>('datesCell');
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

  readonly statusOptions = [
    { value: null, label: 'All Statuses' },
    { value: LeasingStatus.Active, label: 'Active' },
    { value: LeasingStatus.Expired, label: 'Expired' },
    { value: LeasingStatus.Terminated, label: 'Terminated' },
    { value: LeasingStatus.Pending, label: 'Pending' },
  ];

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
    this.loadLeases();
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
      status: this.selectedStatus() || undefined,
      isArchived: this.showArchived() || undefined,
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

  onStatusChange(status: LeasingStatus | null): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
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

  toggleSelectAll(): void {
    const leases = this.filteredLeases();
    const allSelected = this.allSelected();
    const selected = new Set<string>();
    if (!allSelected) {
      leases.forEach((lease) => selected.add(lease.id));
    }
    this.selectedRows.set(selected);
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

  getTenantInitials(lease: Lease): string {
    if (!lease.tenantName) return '??';
    const parts = lease.tenantName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return lease.tenantName.substring(0, 2).toUpperCase();
  }

  trackByIndex(index: number): number {
    return index;
  }
}

