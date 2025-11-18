import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import type { ZardIcon } from '@shared/components/icon/icons';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Transaction } from '@shared/models/transaction/transaction.model';
import { TransactionType, TransactionStatus, RevenueType, ExpenseType } from '@shared/models/transaction/transaction.model';
import type { TransactionListRequest } from '@shared/models/transaction/transaction-list-request.model';
import { TransactionService } from '@shared/services/transaction.service';
import { PropertyService } from '@shared/services/property.service';
import { ToastService } from '@shared/services/toast.service';
import { UserService } from '@shared/services/user.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { FormsModule } from '@angular/forms';
import type { Property } from '@shared/models/property/property.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ZardPageComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    ZardDatatablePaginationComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardCheckboxComponent,
    ZardComboboxComponent,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-list.component.html',
})
export class TransactionListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private readonly propertyService = inject(PropertyService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly TransactionType = TransactionType;
  readonly TransactionStatus = TransactionStatus;
  readonly RevenueType = RevenueType;
  readonly ExpenseType = ExpenseType;

  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10);
  readonly transactions = signal<Transaction[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly updatingStatus = signal<Set<string>>(new Set());
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly selectedType = signal<TransactionType>(TransactionType.Revenue);
  
  /**
   * Get the route key for preferences storage
   */
  private getRouteKey(): string {
    return 'transaction/list';
  }
  
  // Transaction type filters (multi-select)
  readonly selectedRevenueTypes = signal<RevenueType[]>([]);
  readonly selectedExpenseTypes = signal<ExpenseType[]>([]);
  
  // Revenue type options
  readonly revenueTypeOptions = [
    { value: RevenueType.Loyer, label: 'Loyer' },
    { value: RevenueType.Caution, label: 'Caution' },
    { value: RevenueType.FraisAgence, label: 'Frais d\'agence' },
    { value: RevenueType.ReservationPart, label: 'Reservation Part' },
    { value: RevenueType.ReservationFull, label: 'Reservation Full' },
    { value: RevenueType.Maintenance, label: 'Maintenance' },
    { value: RevenueType.Autre, label: 'Autre' },
  ];
  
  // Expense type options
  readonly expenseTypeOptions = [
    { value: ExpenseType.Loyer, label: 'Loyer' },
    { value: ExpenseType.Maintenance, label: 'Maintenance' },
    { value: ExpenseType.Chargee, label: 'Chargee' },
    { value: ExpenseType.Autre, label: 'Autre' },
  ];
  
  // Display text for selected transaction types
  readonly selectedRevenueTypesDisplay = computed(() => {
    const selected = this.selectedRevenueTypes();
    if (selected.length === 0) return '';
    if (selected.length === 1) {
      const option = this.revenueTypeOptions.find(opt => opt.value === selected[0]);
      return option?.label || '';
    }
    return `${selected.length} types selected`;
  });
  
  readonly selectedExpenseTypesDisplay = computed(() => {
    const selected = this.selectedExpenseTypes();
    if (selected.length === 0) return '';
    if (selected.length === 1) {
      const option = this.expenseTypeOptions.find(opt => opt.value === selected[0]);
      return option?.label || '';
    }
    return `${selected.length} types selected`;
  });

  // Property and Contact filters
  readonly properties = signal<Property[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly selectedPropertyId = signal<string | null>(null);
  readonly isLoadingProperties = signal(false);
  readonly propertyComboboxRef = viewChild<ZardComboboxComponent>('propertyCombobox');


  // Check if any filters are active (excluding the default selectedType)
  readonly hasActiveFilters = computed(() => {
    return this.selectedRevenueTypes().length > 0 ||
           this.selectedExpenseTypes().length > 0 ||
           this.selectedPropertyId() !== null;
  });

  // Template references for custom cells
  readonly propertyCell = viewChild<TemplateRef<any>>('propertyCell');
  readonly contactCell = viewChild<TemplateRef<any>>('contactCell');
  readonly amountCell = viewChild<TemplateRef<any>>('amountCell');
  readonly dateCell = viewChild<TemplateRef<any>>('dateCell');
  readonly transactionTypeCell = viewChild<TemplateRef<any>>('transactionTypeCell');
  readonly statusCell = viewChild<TemplateRef<any>>('statusCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Transaction>[]>(() => {
    const propertyCell = this.propertyCell();
    const contactCell = this.contactCell();
    const amountCell = this.amountCell();
    const dateCell = this.dateCell();
    const transactionTypeCell = this.transactionTypeCell();
    const statusCell = this.statusCell();
    const actionsCell = this.actionsCell();
    
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
        key: 'From/To',
        label: 'From/To',
        cellTemplate: contactCell || undefined,
      },
      {
        key: 'transactionType',
        label: 'Type of Transaction',
        cellTemplate: transactionTypeCell || undefined,
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
      {
        key: 'actions',
        label: '',
        width: '50px',
        cellTemplate: actionsCell || undefined,
      },
    ];
  });

  readonly emptyMessage = computed(() => {
    if (this.hasActiveFilters()) {
      return 'No transactions found matching your filters';
    }
    return 'No transactions found';
  });

  readonly hasData = computed(() => {
    const transactions = this.transactions();
    return transactions && transactions.length > 0;
  });

  readonly filteredTransactions = computed(() => {
    const transactions = this.transactions();
    return transactions || [];
  });

  ngOnInit(): void {
    // Get route key for preferences
    const routeKey = this.getRouteKey();
    
    // Load page size preference
    const savedPageSize = this.preferencesService.getPageSize(routeKey);
    this.pageSize.set(savedPageSize);
    
    // Load current page preference
    const savedCurrentPage = this.preferencesService.getPreference<number>(routeKey, 'currentPage', 1) ?? 1;
    this.currentPage.set(savedCurrentPage);
    
    // Load selected type preference
    const savedSelectedType = this.preferencesService.getPreference<TransactionType>(routeKey, 'selectedType', TransactionType.Revenue) ?? TransactionType.Revenue;
    this.selectedType.set(savedSelectedType);
    
    // Debug: Log revenue and expense type options
    console.log('Revenue Type Options:', this.revenueTypeOptions);
    console.log('Revenue Type Options Length:', this.revenueTypeOptions.length);
    console.log('Expense Type Options:', this.expenseTypeOptions);
    console.log('Expense Type Options Length:', this.expenseTypeOptions.length);
    console.log('Selected Type:', this.selectedType());
    
    this.loadTransactions();
    this.loadProperties();
  }

  ngAfterViewInit(): void {
    // Debug: Log after view init
    console.log('[ngAfterViewInit] Revenue Type Options:', this.revenueTypeOptions);
    console.log('[ngAfterViewInit] Expense Type Options:', this.expenseTypeOptions);
    console.log('[ngAfterViewInit] RevenueType enum:', RevenueType);
    console.log('[ngAfterViewInit] ExpenseType enum:', ExpenseType);
    
    // Trigger change detection after view init to ensure templates are available
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    
    const request: TransactionListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      companyId: companyId,
      type: this.selectedType(),
      revenueTypes: this.selectedRevenueTypes().length > 0 ? this.selectedRevenueTypes() : undefined,
      expenseTypes: this.selectedExpenseTypes().length > 0 ? this.selectedExpenseTypes() : undefined,
      propertyId: this.selectedPropertyId() || undefined,
    };

    this.transactionService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Transactions loaded:', response);
        this.transactions.set(response.result || []);
        this.totalPages.set(response.totalPages || 1);
        this.totalItems.set(response.totalItems || 0);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.toastService.error('Failed to load transactions');
        this.transactions.set([]);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadProperties(): void {
    this.isLoadingProperties.set(true);
    const request = {
      currentPage: 1,
      pageSize: 1000, // Large page size to get all properties
      ignore: false,
    };
    
    this.propertyService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.properties.set(response.result);
        // Convert properties to combobox options
        const options: ZardComboboxOption[] = response.result.map(property => ({
          value: property.id,
          label: property.name || property.identifier || 'Unnamed Property',
        }));
        this.propertyOptions.set(options);
        this.isLoadingProperties.set(false);
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.isLoadingProperties.set(false);
      },
    });
  }


  onPropertyChange(propertyId: string | null): void {
    this.selectedPropertyId.set(propertyId);
    this.currentPage.set(1);
    this.loadTransactions();
  }


  onTypeChange(type: TransactionType): void {
    console.log('[onTypeChange]', {
      newType: type,
      currentType: this.selectedType(),
      revenueOptions: this.revenueTypeOptions,
      expenseOptions: this.expenseTypeOptions,
    });
    this.selectedType.set(type);
    // Save selected type to localStorage
    this.preferencesService.setPreference(this.getRouteKey(), 'selectedType', type);
    
    // Clear transaction type selections when changing main type
    if (type === TransactionType.Revenue) {
      this.selectedExpenseTypes.set([]);
      console.log('[onTypeChange] Revenue selected, revenue options:', this.revenueTypeOptions);
    } else if (type === TransactionType.Expense) {
      this.selectedRevenueTypes.set([]);
      console.log('[onTypeChange] Expense selected, expense options:', this.expenseTypeOptions);
    }
    this.currentPage.set(1);
    // Save current page to localStorage
    this.preferencesService.setPreference(this.getRouteKey(), 'currentPage', 1);
    this.loadTransactions();
  }

  toggleRevenueType(revenueType: RevenueType): void {
    const current = this.selectedRevenueTypes();
    if (current.includes(revenueType)) {
      this.selectedRevenueTypes.set(current.filter(t => t !== revenueType));
    } else {
      this.selectedRevenueTypes.set([...current, revenueType]);
    }
    this.currentPage.set(1);
    this.loadTransactions();
  }

  toggleExpenseType(expenseType: ExpenseType): void {
    const current = this.selectedExpenseTypes();
    if (current.includes(expenseType)) {
      this.selectedExpenseTypes.set(current.filter(t => t !== expenseType));
    } else {
      this.selectedExpenseTypes.set([...current, expenseType]);
    }
    this.currentPage.set(1);
    this.loadTransactions();
  }

  onRevenueSelectChange(value: string): void {
    // Prevent the select from changing its value when clicking on items
    // The actual selection is handled by toggleRevenueType via checkbox
    // This is just to prevent the select from closing/changing
  }

  onExpenseSelectChange(value: string): void {
    // Prevent the select from changing its value when clicking on items
    // The actual selection is handled by toggleExpenseType via checkbox
    // This is just to prevent the select from closing/changing
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    // Save current page to localStorage
    this.preferencesService.setPreference(this.getRouteKey(), 'currentPage', page);
    this.loadTransactions();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    // Save page size to localStorage
    this.preferencesService.setPageSize(this.getRouteKey(), size);
    this.currentPage.set(1);
    // Save current page to localStorage
    this.preferencesService.setPreference(this.getRouteKey(), 'currentPage', 1);
    this.loadTransactions();
  }

  onView(transaction: Transaction): void {
    // Navigate to edit page for viewing (can be changed to dedicated view page later)
    this.onEdit(transaction);
  }

  onEdit(transaction: Transaction): void {
    if (transaction.type === TransactionType.Revenue) {
      this.router.navigate(['/transaction/revenue', transaction.id, 'edit']);
    } else {
      this.router.navigate(['/transaction/expense', transaction.id, 'edit']);
    }
  }

  getTransactionTypeLabel(transaction: Transaction): string | null {
    if (transaction.type === TransactionType.Revenue) {
      const revenueType = transaction.revenueType;
      const option = this.revenueTypeOptions.find(opt => opt.value === revenueType);
      return option?.label || null;
    } else if (transaction.type === TransactionType.Expense) {
      const expenseType = transaction.expenseType;
      const option = this.expenseTypeOptions.find(opt => opt.value === expenseType);
      return option?.label || null;
    }
    return null;
  }

  onStatusDropdownChange(transaction: Transaction, newStatusValue: string): void {
    const newStatus = parseInt(newStatusValue) as TransactionStatus;
    this.onStatusChange(transaction, newStatus);
  }

  onStatusChange(transaction: Transaction, newStatus: TransactionStatus): void {
    if (transaction.status === newStatus) {
      return; // No change
    }

    // Add to updating set
    const updating = new Set(this.updatingStatus());
    updating.add(transaction.id);
    this.updatingStatus.set(updating);

    this.transactionService.updateStatus(transaction.id, newStatus).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // Update local transaction status
        const transactions = this.transactions();
        const updatedTransactions = transactions.map(t => 
          t.id === transaction.id ? { ...t, status: newStatus } : t
        );
        this.transactions.set(updatedTransactions);
        
        // Remove from updating set
        const stillUpdating = new Set(this.updatingStatus());
        stillUpdating.delete(transaction.id);
        this.updatingStatus.set(stillUpdating);
        
        this.toastService.success(`Transaction status updated to ${this.getStatusLabel(newStatus)}`);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating transaction status:', error);
        this.toastService.error('Failed to update transaction status');
        
        // Remove from updating set
        const stillUpdating = new Set(this.updatingStatus());
        stillUpdating.delete(transaction.id);
        this.updatingStatus.set(stillUpdating);
        this.cdr.markForCheck();
      },
    });
  }

  isUpdatingStatus(transactionId: string): boolean {
    return this.updatingStatus().has(transactionId);
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
    // Revenue = green, Expense = red
    // Light mode: very visible colors with opacity, Dark mode: subtle colors
    // Keep same color on hover (override any default hover styles)
    // Use !important to override table's default hover:bg-muted/50
    if (transaction.type === TransactionType.Revenue) {
      return '!bg-green-500/30 dark:!bg-green-950/20 hover:!bg-green-500/30 dark:hover:!bg-green-950/20';
    } else {
      return '!bg-red-500/30 dark:!bg-red-950/20 hover:!bg-red-500/30 dark:hover:!bg-red-950/20';
    }
  }

  onClearFilters(): void {
    // Reset to default Revenue type
    this.selectedType.set(TransactionType.Revenue);
    this.selectedRevenueTypes.set([]);
    this.selectedExpenseTypes.set([]);
    this.selectedPropertyId.set(null);
    
    // Clear combobox internal values using ControlValueAccessor
    setTimeout(() => {
      const propertyCombobox = this.propertyComboboxRef();
      if (propertyCombobox) {
        (propertyCombobox as any).writeValue(null);
      }
    }, 0);
    
    this.currentPage.set(1);
    this.loadTransactions();
  }

  async onDelete(transaction: Transaction): Promise<void> {
    const confirmed = await this.alertDialogService.confirm({
      zTitle: 'Delete Transaction',
      zDescription: `Are you sure you want to delete this transaction? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
    });

    if (!confirmed) return;

    this.isDeleting.set(true);
    this.transactionService.delete(transaction.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastService.success('Transaction deleted successfully');
        this.loadTransactions();
        this.isDeleting.set(false);
      },
      error: (error) => {
        console.error('Error deleting transaction:', error);
        this.toastService.error('Failed to delete transaction');
        this.isDeleting.set(false);
      },
    });
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} MAD`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}

