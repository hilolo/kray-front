import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PaymentsService } from '../payments.service';
import { GetPaymentsFilter, Payment, PaginatedResult, PaymentType, PaymentStatus, getPaymentTypeLabel, getPaymentStatusLabel, getRevenueCategoryLabel, getExpenseCategoryLabel } from '../payments.types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { AppConfigService } from '@fuse/services/config/app-config.service';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { PermissionService } from 'app/core/auth/permission.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
    selector: 'payments-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatSelectModule,
        MatOptionModule,
        ReactiveFormsModule,
        NoDataComponent
    ]
})
export class PaymentsListComponent implements OnInit, OnDestroy {
    payments: Payment[] = [];
    isLoading: boolean = false;
    
    // Pagination
    currentPage: number = 1;
    pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    totalItems: number = 0;
    totalPages: number = 0;
    pageSizeOptions: number[] = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;

    // Search
    searchControl: FormControl = new FormControl('');
    
    // Filters
    selectedType: PaymentType | null = null;
    selectedStatus: PaymentStatus | null = null;
    
    // Permissions
    canViewPayments: boolean = false;
    canEditPayments: boolean = false;
    canDeletePayments: boolean = false;
    
    // Payment types and statuses for filters
    paymentTypes = [
        { value: PaymentType.Revenue, label: 'Revenue' },
        { value: PaymentType.Expense, label: 'Expense' }
    ];
    
    paymentStatuses = [
        { value: PaymentStatus.Paid, label: 'Paid' },
        { value: PaymentStatus.Overdue, label: 'Overdue' },
        { value: PaymentStatus.Waiting, label: 'Waiting' }
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Inject services
    private _paymentsService = inject(PaymentsService);
    private _router = inject(Router);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _errorHandlerService = inject(ErrorHandlerService);
    private _appConfigService = inject(AppConfigService);
    private _permissionService = inject(PermissionService);

    // Expose helper functions to template
    getPaymentTypeLabel = getPaymentTypeLabel;
    getPaymentStatusLabel = getPaymentStatusLabel;
    getRevenueCategoryLabel = getRevenueCategoryLabel;
    getExpenseCategoryLabel = getExpenseCategoryLabel;

    ngOnInit(): void {
        // Check permissions
        this.canViewPayments = this._permissionService.canView('payments') ?? true;
        this.canEditPayments = this._permissionService.canEdit('payments') ?? true;
        this.canDeletePayments = this._permissionService.canDelete('payments') ?? true;
        
        // If user doesn't have view permission, don't load data
        if (!this.canViewPayments) {
            return;
        }
        
        // Load payments
        this.loadPayments();

        // Subscribe to search input changes
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.currentPage = 1; // Reset to first page on search
                this.loadPayments();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Load payments
     */
    loadPayments(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const filter: GetPaymentsFilter = {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            searchQuery: this.searchControl.value || undefined,
            type: this.selectedType ?? undefined,
            status: this.selectedStatus ?? undefined
        };

        this._paymentsService.getPayments(filter)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (result: PaginatedResult<Payment>) => {
                    this.payments = result.result;
                    this.totalItems = result.totalItems;
                    this.totalPages = result.totalPages;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex + 1;
        this.loadPayments();
    }

    /**
     * Navigate to add revenue payment
     */
    addRevenuePayment(): void {
        this._router.navigate(['payments', 'revenue', 'add']);
    }

    /**
     * Navigate to add expense payment
     */
    addExpensePayment(): void {
        this._router.navigate(['payments', 'expense', 'add']);
    }

    /**
     * Navigate to payment details
     */
    viewPayment(payment: Payment): void {
        const type = payment.type === PaymentType.Revenue ? 'revenue' : 'expense';
        this._router.navigate(['payments', type, payment.id]);
    }

    /**
     * Delete payment
     */
    deletePayment(payment: Payment, event: Event): void {
        event.stopPropagation();
        
        if (!this.canDeletePayments) {
            this._errorHandlerService.showErrorAlert('Access Denied', 'You do not have permission to delete payments');
            return;
        }

        if (confirm(`Are you sure you want to delete this payment?`)) {
            this._paymentsService.deletePayment(payment.id)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: () => {
                        this.loadPayments();
                    },
                    error: () => {
                        // Error already handled in service
                    }
                });
        }
    }

    /**
     * Clear all filters
     */
    clearFilters(): void {
        this.searchControl.setValue('');
        this.selectedType = null;
        this.selectedStatus = null;
        this.currentPage = 1;
        this.loadPayments();
    }

    /**
     * Check if any filters are active
     */
    hasActiveFilters(): boolean {
        return this.selectedType !== null || this.selectedStatus !== null;
    }

    /**
     * Get status color class
     */
    getStatusColorClass(status: PaymentStatus): string {
        switch (status) {
            case PaymentStatus.Paid:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case PaymentStatus.Overdue:
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case PaymentStatus.Waiting:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }

    /**
     * Get type color class
     */
    getTypeColorClass(type: PaymentType): string {
        switch (type) {
            case PaymentType.Revenue:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case PaymentType.Expense:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }
}

