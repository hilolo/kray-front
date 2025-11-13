import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BanksService } from '../banks.service';
import { Bank, GetBanksFilter, BankDialogMode } from '../banks.types';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { BankDialogComponent } from '../dialog/bank-dialog.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';
import { PermissionService } from 'app/core/auth/permission.service';

@Component({
    selector: 'banks-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatDialogModule,
        NoDataComponent
    ],
})
export class BanksListComponent implements OnInit, OnDestroy {
    banks$: Observable<Bank[]>;
    banksCount: number = 0;
    
    // Pagination
    pagination: { currentPage: number, totalPages: number, totalItems: number } = { currentPage: 1, totalPages: 1, totalItems: 0 };
    pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    pageSizeOptions: number[] = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;
    
    // Search
    searchControl: FormControl = new FormControl('');
    
    // Permissions
    canViewBanks: boolean = false;
    canEditBanks: boolean = false;
    canDeleteBanks: boolean = false;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _banksService: BanksService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _errorHandlerService: ErrorHandlerService,
        private _matDialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _permissionService: PermissionService
    ) {}

    ngOnInit(): void {
        // Check permissions
        this.canViewBanks = this._permissionService.canView('banks');
        this.canEditBanks = this._permissionService.canEdit('banks');
        this.canDeleteBanks = this._permissionService.canDelete('banks');
        
        // If user doesn't have view permission, show error and don't load data
        if (!this.canViewBanks) {
            this._errorHandlerService.showErrorAlert(
                'Permission Denied',
                'You do not have permission to view bank accounts. Please contact your administrator.'
            );
            return;
        }
        
        // Get banks
        this.banks$ = this._banksService.banks$;

        // Subscribe to banks count
        this._banksService.banks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((banks: Bank[]) => {
                this.banksCount = banks.length;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to pagination changes
        this._banksService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search field value changes
        this.searchControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe((searchTerm) => {
                // Reset to first page when searching
                this.pagination.currentPage = 1;
                this.loadBanks();
            });

        // Load initial data
        this.loadBanks();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Load banks
     */
    loadBanks(): void {
        const filter: GetBanksFilter = {
            currentPage: this.pagination.currentPage,
            pageSize: this.pageSize,
            searchQuery: this.searchControl.value || '',
            ignore: false
        };

        this._banksService.getBanks(filter).subscribe({
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load bank accounts');
                console.error('Error loading banks:', error);
            }
        });
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void {
        this.pagination.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadBanks();
    }

    /**
     * Open add bank dialog
     */
    openAddDialog(): void {
        // Check permission
        if (!this.canEditBanks) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to add bank accounts');
            return;
        }
        
        const dialogRef = this._matDialog.open(BankDialogComponent, {
            width: '600px',
            data: {
                mode: BankDialogMode.ADD
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadBanks();
            }
        });
    }

    /**
     * Open view bank dialog
     */
    openViewDialog(bank: Bank): void {
        // Check permission
        if (!this.canViewBanks) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to view bank accounts');
            return;
        }
        
        const dialogRef = this._matDialog.open(BankDialogComponent, {
            width: '600px',
            data: {
                mode: BankDialogMode.VIEW,
                bank: bank
            }
        });
    }

    /**
     * Open edit bank dialog
     */
    openEditDialog(bank: Bank, event: Event): void {
        event.stopPropagation();
        
        // Check permission
        if (!this.canEditBanks) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to edit bank accounts');
            return;
        }
        
        const dialogRef = this._matDialog.open(BankDialogComponent, {
            width: '600px',
            data: {
                mode: BankDialogMode.EDIT,
                bank: bank
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadBanks();
            }
        });
    }

    /**
     * Delete bank
     */
    deleteBank(bank: Bank, event: Event): void {
        event.stopPropagation();
        
        // Check permission
        if (!this.canDeleteBanks) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to delete bank accounts');
            return;
        }
        
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete bank account',
            message: `Are you sure you want to delete this bank account? This action cannot be undone.`,
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._banksService.deleteBank(bank.id).subscribe({
                    next: (success) => {
                        if (success) {
                            this._errorHandlerService.showSuccessAlert('Success', 'Bank account deleted successfully');
                            this.loadBanks();
                        } else {
                            this._errorHandlerService.showErrorAlert('Error', 'Failed to delete bank account');
                        }
                    },
                    error: (error) => {
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to delete bank account');
                        console.error('Error deleting bank:', error);
                    }
                });
            }
        });
    }

    /**
     * Get contact display name
     */
    getContactDisplayName(bank: Bank): string {
        if (!bank.contact) return 'N/A';
        if (bank.contact.isACompany) return bank.contact.companyName || 'N/A';
        return `${bank.contact.firstName} ${bank.contact.lastName}`.trim() || 'N/A';
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

