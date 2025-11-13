import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { KeysService } from '../keys.service';
import { Key, GetKeysFilter, KeyDialogMode } from '../keys.types';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { KeyDialogComponent } from '../dialog/key-dialog.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';
import { PermissionService } from 'app/core/auth/permission.service';

@Component({
    selector: 'keys-list',
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
export class KeysListComponent implements OnInit, OnDestroy {
    keys$: Observable<Key[]>;
    keysCount: number = 0;
    
    // Pagination
    pagination: { currentPage: number, totalPages: number, totalItems: number } = { currentPage: 1, totalPages: 1, totalItems: 0 };
    pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    pageSizeOptions: number[] = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;
    
    // Search
    searchControl: FormControl = new FormControl('');
    
    // Permissions
    canViewKeys: boolean = false;
    canEditKeys: boolean = false;
    canDeleteKeys: boolean = false;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _keysService: KeysService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _errorHandlerService: ErrorHandlerService,
        private _matDialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _permissionService: PermissionService
    ) {}

    ngOnInit(): void {
        // Check permissions
        this.canViewKeys = this._permissionService.canView('keys');
        this.canEditKeys = this._permissionService.canEdit('keys');
        this.canDeleteKeys = this._permissionService.canDelete('keys');
        
        // If user doesn't have view permission, don't load data
        if (!this.canViewKeys) {
            return;
        }
        
        // Get keys
        this.keys$ = this._keysService.keys$;

        // Subscribe to keys count
        this._keysService.keys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((keys: Key[]) => {
                this.keysCount = keys.length;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to pagination changes
        this._keysService.pagination$
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
                this.loadKeys();
            });

        // Load initial data
        this.loadKeys();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Load keys
     */
    loadKeys(): void {
        const filter: GetKeysFilter = {
            currentPage: this.pagination.currentPage,
            pageSize: this.pageSize,
            searchQuery: this.searchControl.value || '',
            ignore: false
        };

        this._keysService.getKeys(filter).subscribe({
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load keys');
                console.error('Error loading keys:', error);
            }
        });
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void {
        this.pagination.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadKeys();
    }

    /**
     * Open add key dialog
     */
    openAddDialog(): void {
        // Check permission
        if (!this.canEditKeys) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to add keys');
            return;
        }
        
        const dialogRef = this._matDialog.open(KeyDialogComponent, {
            width: '600px',
            data: {
                mode: KeyDialogMode.ADD
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadKeys();
            }
        });
    }

    /**
     * Open view key dialog
     */
    openViewDialog(key: Key): void {
        const dialogRef = this._matDialog.open(KeyDialogComponent, {
            width: '600px',
            data: {
                mode: KeyDialogMode.VIEW,
                key: key
            }
        });
    }

    /**
     * Open edit key dialog
     */
    openEditDialog(key: Key, event: Event): void {
        event.stopPropagation();
        
        // Check permission
        if (!this.canEditKeys) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to edit keys');
            return;
        }
        
        const dialogRef = this._matDialog.open(KeyDialogComponent, {
            width: '600px',
            data: {
                mode: KeyDialogMode.EDIT,
                key: key
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadKeys();
            }
        });
    }

    /**
     * Delete key
     */
    deleteKey(key: Key, event: Event): void {
        event.stopPropagation();
        
        // Check permission
        if (!this.canDeleteKeys) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to delete keys');
            return;
        }
        
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete key',
            message: `Are you sure you want to delete the key "${key.name}"? This action cannot be undone.`,
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._keysService.deleteKey(key.id).subscribe({
                    next: (success) => {
                        if (success) {
                            this._errorHandlerService.showSuccessAlert('Success', 'Key deleted successfully');
                            this.loadKeys();
                        } else {
                            this._errorHandlerService.showErrorAlert('Error', 'Failed to delete key');
                        }
                    },
                    error: (error) => {
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to delete key');
                        console.error('Error deleting key:', error);
                    }
                });
            }
        });
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

