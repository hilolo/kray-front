import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Transaction } from '@shared/models/transaction/transaction.model';
import { TransactionType } from '@shared/models/transaction/transaction.model';
import type { TransactionListRequest } from '@shared/models/transaction/transaction-list-request.model';
import { TransactionService } from '@shared/services/transaction.service';
import { ToastService } from '@shared/services/toast.service';
import { UserService } from '@shared/services/user.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { ContentComponent } from '@shared/components/layout/content.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardIconComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownMenuContentComponent,
    ZardDatatablePaginationComponent,
    FormsModule,
    LayoutComponent,
    ContentComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-list.component.html',
})
export class TransactionListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly TransactionType = TransactionType;

  readonly searchQuery = signal('');
  readonly searchInput = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10);
  readonly transactions = signal<Transaction[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly selectedType = signal<TransactionType | null>(null);

  // Check if any filters are active
  readonly hasActiveFilters = computed(() => {
    return (this.searchQuery() && this.searchQuery().trim() !== '') || 
           this.selectedType() !== null;
  });

  // Template references for custom cells
  readonly typeCell = viewChild<TemplateRef<any>>('typeCell');
  readonly propertyCell = viewChild<TemplateRef<any>>('propertyCell');
  readonly contactCell = viewChild<TemplateRef<any>>('contactCell');
  readonly amountCell = viewChild<TemplateRef<any>>('amountCell');
  readonly dateCell = viewChild<TemplateRef<any>>('dateCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Transaction>[]>(() => [
    {
      key: 'type',
      label: 'Type',
      cellTemplate: this.typeCell(),
    },
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
      key: 'amount',
      label: 'Amount',
      sortable: true,
      cellTemplate: this.amountCell(),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      cellTemplate: this.dateCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '50px',
      cellTemplate: this.actionsCell(),
    },
  ]);

  readonly emptyMessage = computed(() => {
    if (this.hasActiveFilters()) {
      return 'No transactions found matching your filters';
    }
    return 'No transactions found';
  });

  readonly hasData = computed(() => {
    return this.transactions().length > 0;
  });

  readonly filteredTransactions = computed(() => {
    return this.transactions();
  });

  ngOnInit(): void {
    // Setup search debounce
    this.searchInputSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.currentPage.set(1);
        this.loadTransactions();
      });

    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchInputSubject.complete();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    
    const request: TransactionListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      searchQuery: this.searchQuery() || undefined,
      companyId: companyId,
      type: this.selectedType() || undefined,
    };

    this.transactionService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.transactions.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.toastService.error('Failed to load transactions');
        this.isLoading.set(false);
      },
    });
  }

  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    this.searchInputSubject.next(value);
  }

  onTypeChange(type: TransactionType | null): void {
    this.selectedType.set(type);
    this.currentPage.set(1);
    this.loadTransactions();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTransactions();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadTransactions();
  }

  onSelectionChange(selected: Set<string>): void {
    this.selectedRows.set(selected);
  }

  onClearFilters(): void {
    this.searchQuery.set('');
    this.searchInput.set('');
    this.selectedType.set(null);
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

  getTransactionTypeLabel(type: TransactionType): string {
    return type === TransactionType.Revenue ? 'Revenue' : 'Expense';
  }

  getTransactionTypeBadge(type: TransactionType): 'default' | 'destructive' {
    return type === TransactionType.Revenue ? 'default' : 'destructive';
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

