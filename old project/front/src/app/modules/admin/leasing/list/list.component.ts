import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { LeasingService } from '../leasing.service';
import { GetLeasingsFilter, Leasing, PaginatedResult, getLeasingStatusLabel, getPaymentTypeLabel } from '../leasing.types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfigService } from '@fuse/services/config/app-config.service';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';
import { PropertyService } from '../../property/property.service';
import { Property } from '../../property/property.types';
import { ContactsService } from '../../contacts/contacts.service';
import { Contact } from '../../contacts/contacts.types';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { PermissionService } from 'app/core/auth/permission.service';

@Component({
    selector: 'leasing-list',
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
        MatButtonToggleModule,
        ReactiveFormsModule,
        NoDataComponent
    ]
})
export class LeasingListComponent implements OnInit, OnDestroy {
    leasings: Leasing[] = [];
    isLoading: boolean = false;
    
    // View Mode
    viewMode: 'grid' | 'list' = 'grid';
    
    // Pagination
    currentPage: number = 1;
    pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    totalItems: number = 0;
    totalPages: number = 0;
    pageSizeOptions: number[] = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;

    // Search
    searchControl: FormControl = new FormControl('');
    
    // Archived Filter
    showArchived: boolean = false;
    
    // Property filter
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    selectedPropertyId: string | null = null;
    propertySearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    isEditingProperty: boolean = false;
    
    // Contact/Tenant filter
    tenants: Contact[] = [];
    filteredTenants: Contact[] = [];
    selectedTenantId: string | null = null;
    tenantSearchTerm: string = '';
    showTenantDropdown: boolean = false;
    isEditingTenant: boolean = false;
    
    // Permissions
    canViewLeasing: boolean = false;
    canEditLeasing: boolean = false;
    canDeleteLeasing: boolean = false;
    
    // Footer
    currentYear: number = new Date().getFullYear();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Inject services
    private _leasingService = inject(LeasingService);
    private _propertyService = inject(PropertyService);
    private _contactsService = inject(ContactsService);
    private _router = inject(Router);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _errorHandlerService = inject(ErrorHandlerService);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _appConfigService = inject(AppConfigService);
    private _permissionService = inject(PermissionService);

    ngOnInit(): void {
        // Check permissions
        this.canViewLeasing = this._permissionService.canView('leasing');
        this.canEditLeasing = this._permissionService.canEdit('leasing');
        this.canDeleteLeasing = this._permissionService.canDelete('leasing');
        
        // If user doesn't have view permission, don't load data
        if (!this.canViewLeasing) {
            return;
        }
        
        // Load saved view preference
        this.viewMode = this._appConfigService.getLeasingViewPreference();
        
        // Load properties and tenants for filters
        this.loadProperties();
        this.loadTenants();
        
        // Load leasings
        this.loadLeasings();

        // Subscribe to search input changes
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.currentPage = 1; // Reset to first page on search
                this.loadLeasings();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Load properties (all categories)
     */
    loadProperties(): void {
        this._propertyService.getProperties({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            searchQuery: ''
            // No category filter - load all property categories
        }).subscribe({
            next: (result) => {
                this.properties = result.result || [];
                this.filteredProperties = result.result || [];
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading properties:', error);
                this.properties = [];
                this.filteredProperties = [];
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load properties');
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Load tenants
     */
    loadTenants(): void {
        this._contactsService.getContactsByType('tenant', 1, 1000, true).subscribe({
            next: (contacts) => {
                this.tenants = contacts || [];
                this.filteredTenants = contacts || [];
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading tenants:', error);
                this.tenants = [];
                this.filteredTenants = [];
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load tenants');
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Load leasings with current filters
     */
    loadLeasings(): void {
        this.isLoading = true;

        const filter: GetLeasingsFilter = {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            searchQuery: this.searchControl.value || '',
            ignore: false,
            isArchived: this.showArchived ? true : false,
            propertyId: this.selectedPropertyId || undefined,
            contactId: this.selectedTenantId || undefined
        };

        this._leasingService.getLeasings(filter).subscribe({
            next: (result: PaginatedResult<Leasing>) => {
                this.leasings = result.result;
                this.totalItems = result.totalItems;
                this.totalPages = result.totalPages;
                this.currentPage = result.currentPage;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load leasings');
                console.error('Error loading leasings:', error);
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadLeasings();
    }

    /**
     * Navigate to leasing detail
     */
    viewLeasing(leasingId: string): void {
        this._router.navigate(['/leasing', leasingId]);
    }

    /**
     * Navigate to add leasing
     */
    addLeasing(): void {
        this._router.navigate(['/leasing/add']);
    }

    /**
     * Delete leasing
     */
    deleteLeasing(leasing: Leasing, event: Event): void {
        event.stopPropagation();

        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Leasing',
            message: `Are you sure you want to delete this leasing for "${leasing.propertyName || 'Unknown Property'}"? This action cannot be undone.`,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn'
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Delete',
                    color: 'warn'
                },
                cancel: {
                    show: true,
                    label: 'Cancel'
                }
            },
            dismissible: true
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._leasingService.deleteLeasing(leasing.id).subscribe({
                    next: () => {
                        this._errorHandlerService.showSuccessAlert('Success', 'Leasing deleted successfully');
                        this.loadLeasings();
                    },
                    error: (error) => {
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to delete leasing');
                        console.error('Error deleting leasing:', error);
                    }
                });
            }
        });
    }

    /**
     * Get payment type label
     */
    getPaymentTypeLabel(type: any): string {
        return getPaymentTypeLabel(type);
    }

    /**
     * Get status label
     */
    getStatusLabel(status: any): string {
        return getLeasingStatusLabel(status);
    }

    /**
     * Get status color class
     */
    getStatusColorClass(leasing: Leasing): string {
        const endDate = new Date(leasing.tenancyEnd);
        const today = new Date();
        
        if (endDate < today) {
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        } else if (endDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) {
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
        }
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }

    /**
     * Get status text
     */
    getStatusText(leasing: Leasing): string {
        const endDate = new Date(leasing.tenancyEnd);
        const today = new Date();
        
        if (endDate < today) {
            return 'Expired';
        } else if (endDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) {
            return 'Expiring Soon';
        }
        return 'Active';
    }

    /**
     * Toggle view mode
     */
    toggleViewMode(mode: 'grid' | 'list'): void {
        this.viewMode = mode;
        
        // Save view preference to localStorage
        this._appConfigService.setLeasingViewPreference(mode);
        
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle archived filter
     */
    toggleArchivedFilter(): void {
        this.showArchived = !this.showArchived;
        this.currentPage = 1; // Reset to first page
        this.loadLeasings();
    }

    /**
     * Filter properties
     */
    filterProperties(): void {
        const searchTerm = this.propertySearchTerm.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredProperties = [...this.properties];
        } else {
            this.filteredProperties = this.properties.filter(property => 
                property.name?.toLowerCase().includes(searchTerm) ||
                property.identifier?.toLowerCase().includes(searchTerm) ||
                property.address?.toLowerCase().includes(searchTerm)
            );
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle property input events
     */
    onPropertyInput(event: any): void {
        const value = event.target.value;
        this.propertySearchTerm = value;
        this.isEditingProperty = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            if (this.selectedPropertyId !== null) {
                this.selectedPropertyId = null;
                this.currentPage = 1;
                this.loadLeasings();
            }
        }
        
        this.filterProperties();
    }

    /**
     * Handle property focus
     */
    onPropertyFocus(): void {
        // Clear search term to show all properties
        this.propertySearchTerm = '';
        this.isEditingProperty = true;
        this.showPropertyDropdown = true;
        this.filterProperties();
    }

    /**
     * Handle property blur
     */
    onPropertyBlur(): void {
        setTimeout(() => {
            this.showPropertyDropdown = false;
            this.isEditingProperty = false;
            // Clear search term for next time
            this.propertySearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    /**
     * Select property filter
     */
    selectProperty(propertyId: string | null): void {
        this.selectedPropertyId = propertyId;
        this.propertySearchTerm = ''; // Clear search term to show selected property name
        this.isEditingProperty = false;
        this.showPropertyDropdown = false;
        this.currentPage = 1;
        this.loadLeasings();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get selected property name
     */
    getSelectedPropertyName(): string {
        if (!this.selectedPropertyId) {
            return 'All Properties';
        }
        const property = this.properties.find(p => p.id === this.selectedPropertyId);
        return property ? property.name : 'All Properties';
    }

    /**
     * Clear property filter
     */
    clearPropertyFilter(): void {
        this.selectProperty(null);
    }

    /**
     * Filter tenants
     */
    filterTenants(): void {
        const searchTerm = this.tenantSearchTerm.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredTenants = [...this.tenants];
        } else {
            this.filteredTenants = this.tenants.filter(tenant => 
                tenant.name?.toLowerCase().includes(searchTerm) ||
                tenant.identifier?.toLowerCase().includes(searchTerm) ||
                tenant.email?.toLowerCase().includes(searchTerm) ||
                tenant.firstName?.toLowerCase().includes(searchTerm) ||
                tenant.lastName?.toLowerCase().includes(searchTerm)
            );
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle tenant input events
     */
    onTenantInput(event: any): void {
        const value = event.target.value;
        this.tenantSearchTerm = value;
        this.isEditingTenant = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            if (this.selectedTenantId !== null) {
                this.selectedTenantId = null;
                this.currentPage = 1;
                this.loadLeasings();
            }
        }
        
        this.filterTenants();
    }

    /**
     * Handle tenant focus
     */
    onTenantFocus(): void {
        // Clear search term to show all tenants
        this.tenantSearchTerm = '';
        this.isEditingTenant = true;
        this.showTenantDropdown = true;
        this.filterTenants();
    }

    /**
     * Handle tenant blur
     */
    onTenantBlur(): void {
        setTimeout(() => {
            this.showTenantDropdown = false;
            this.isEditingTenant = false;
            // Clear search term for next time
            this.tenantSearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    /**
     * Select tenant filter
     */
    selectTenant(tenantId: string | null): void {
        this.selectedTenantId = tenantId;
        this.tenantSearchTerm = ''; // Clear search term to show selected tenant name
        this.isEditingTenant = false;
        this.showTenantDropdown = false;
        this.currentPage = 1;
        this.loadLeasings();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get selected tenant name
     */
    getSelectedTenantName(): string {
        if (!this.selectedTenantId) {
            return 'All Tenants';
        }
        const tenant = this.tenants.find(t => t.id === this.selectedTenantId);
        return tenant ? tenant.name : 'All Tenants';
    }

    /**
     * Clear tenant filter
     */
    clearTenantFilter(): void {
        this.selectTenant(null);
    }

    /**
     * Clear all filters
     */
    clearAllFilters(): void {
        this.selectedPropertyId = null;
        this.selectedTenantId = null;
        this.propertySearchTerm = '';
        this.tenantSearchTerm = '';
        this.currentPage = 1;
        this.loadLeasings();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if any filters are active
     */
    hasActiveFilters(): boolean {
        return this.selectedPropertyId !== null || this.selectedTenantId !== null;
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

