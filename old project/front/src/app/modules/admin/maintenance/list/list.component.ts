import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MaintenanceService } from '../maintenance.service';
import { 
    GetMaintenancesFilter, 
    Maintenance, 
    PaginatedResult, 
    getMaintenanceStatusLabel,
    getMaintenanceStatusColor,
    getMaintenancePriorityLabel,
    getMaintenancePriorityColor,
    MaintenanceStatus
} from '../maintenance.types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { MaintenanceDialogComponent } from '../dialog/dialog.component';
import { ContactsService } from '../../contacts/contacts.service';
import { Contact, ContactTypeEnum } from '../../contacts/contacts.types';
import { AppConfigService } from '@fuse/services/config/app-config.service';
import { PropertyService } from '../../property/property.service';
import { Property } from '../../property/property.types';

@Component({
    selector: 'maintenance-list',
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
        MatMenuModule,
        MatDialogModule,
        ReactiveFormsModule,
        NoDataComponent
    ]
})
export class MaintenanceListComponent implements OnInit, OnDestroy {
    maintenances: Maintenance[] = [];
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
    
    // Property filter
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    selectedPropertyId: string | null = null;
    propertySearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    isEditingProperty: boolean = false;
    
    // Service Contacts filter
    serviceContacts: Contact[] = [];
    filteredServiceContacts: Contact[] = [];
    selectedContactId: string | null = null;
    contactSearchTerm: string = '';
    showContactDropdown: boolean = false;
    isEditingContact: boolean = false;
    
    // Status filter
    selectedStatus: MaintenanceStatus | null = null;
    showStatusDropdown: boolean = false;
    statusOptions = [
        { value: MaintenanceStatus.Waiting, label: 'Waiting', color: 'amber' },
        { value: MaintenanceStatus.InProgress, label: 'In Progress', color: 'blue' },
        { value: MaintenanceStatus.Done, label: 'Done', color: 'green' },
        { value: MaintenanceStatus.Cancelled, label: 'Cancelled', color: 'gray' }
    ];
    
    // Footer
    currentYear: number = new Date().getFullYear();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Inject services
    private _maintenanceService = inject(MaintenanceService);
    private _contactsService = inject(ContactsService);
    private _propertyService = inject(PropertyService);
    private _dialog = inject(MatDialog);
    private _router = inject(Router);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _errorHandlerService = inject(ErrorHandlerService);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _appConfigService = inject(AppConfigService);

    // Expose helper functions for template
    getMaintenanceStatusLabel = getMaintenanceStatusLabel;
    getMaintenanceStatusColor = getMaintenanceStatusColor;
    getMaintenancePriorityLabel = getMaintenancePriorityLabel;
    getMaintenancePriorityColor = getMaintenancePriorityColor;

    ngOnInit(): void {
        // Load view mode from localStorage
        this.viewMode = this._appConfigService.getMaintenanceViewPreference();
        
        // Load properties and service contacts for filters
        this.loadProperties();
        this.loadServiceContacts();
        
        // Load maintenances
        this.loadMaintenances();

        // Subscribe to search input changes
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.currentPage = 1;
                this.loadMaintenances();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Load properties
     */
    loadProperties(): void {
        this._propertyService.getProperties({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            searchQuery: ''
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
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Load service type contacts
     */
    loadServiceContacts(): void {
        this._contactsService.getContacts({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            searchQuery: '',
            type: ContactTypeEnum.Service
        }).subscribe({
            next: (result) => {
                this.serviceContacts = result.result || [];
                this.filteredServiceContacts = result.result || [];
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading service contacts:', error);
                this.serviceContacts = [];
                this.filteredServiceContacts = [];
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Load maintenances
     */
    loadMaintenances(): void {
        this.isLoading = true;

        const filter: GetMaintenancesFilter = {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            searchQuery: this.searchControl.value || '',
            ignore: false,
            propertyId: this.selectedPropertyId || undefined,
            contactId: this.selectedContactId || undefined,
            status: this.selectedStatus !== null ? this.selectedStatus : undefined
        };

        this._maintenanceService.getMaintenances(filter).subscribe({
            next: (result: PaginatedResult<Maintenance>) => {
                this.maintenances = result.result || [];
                this.totalItems = result.totalItems || 0;
                this.totalPages = result.totalPages || 0;
                this.currentPage = result.currentPage || 1;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading maintenances:', error);
                this.isLoading = false;
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load maintenances');
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Toggle view mode
     */
    toggleViewMode(mode: 'grid' | 'list'): void {
        this.viewMode = mode;
        // Save view mode to localStorage
        this._appConfigService.setMaintenanceViewPreference(mode);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadMaintenances();
    }

    /**
     * Property filter methods
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

    onPropertyInput(event: any): void {
        const value = event.target.value;
        this.propertySearchTerm = value;
        this.isEditingProperty = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            if (this.selectedPropertyId !== null) {
                this.selectedPropertyId = null;
                this.currentPage = 1;
                this.loadMaintenances();
            }
        }
        
        this.filterProperties();
    }

    onPropertyFocus(): void {
        // Clear search term to show all properties
        this.propertySearchTerm = '';
        this.isEditingProperty = true;
        this.showPropertyDropdown = true;
        this.filterProperties();
    }

    onPropertyBlur(): void {
        setTimeout(() => {
            this.showPropertyDropdown = false;
            this.isEditingProperty = false;
            // Clear search term for next time
            this.propertySearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    selectProperty(propertyId: string | null): void {
        this.selectedPropertyId = propertyId;
        this.propertySearchTerm = '';
        this.isEditingProperty = false;
        this.showPropertyDropdown = false;
        this.currentPage = 1;
        this.loadMaintenances();
        this._changeDetectorRef.markForCheck();
    }

    getSelectedPropertyName(): string {
        if (!this.selectedPropertyId) {
            return 'All Properties';
        }
        const property = this.properties.find(p => p.id === this.selectedPropertyId);
        return property ? (property.name || property.identifier || 'Unnamed Property') : 'All Properties';
    }

    clearPropertyFilter(): void {
        this.selectProperty(null);
    }

    /**
     * Contact filter methods
     */
    onContactInput(event: any): void {
        this.isEditingContact = true;
        this.contactSearchTerm = event.target.value.toLowerCase();
        this.filteredServiceContacts = this.serviceContacts.filter(contact => {
            const name = contact.isACompany ? contact.companyName : `${contact.firstName} ${contact.lastName}`;
            return name.toLowerCase().includes(this.contactSearchTerm);
        });
        this.showContactDropdown = true;
    }

    onContactFocus(): void {
        this.isEditingContact = true;
        this.showContactDropdown = true;
        this.filteredServiceContacts = this.serviceContacts;
    }

    onContactBlur(): void {
        setTimeout(() => {
            this.showContactDropdown = false;
            this.isEditingContact = false;
        }, 200);
    }

    selectContact(contactId: string | null): void {
        this.selectedContactId = contactId;
        this.showContactDropdown = false;
        this.isEditingContact = false;
        this.contactSearchTerm = '';
        this.currentPage = 1;
        this.loadMaintenances();
    }

    clearContactFilter(): void {
        this.selectedContactId = null;
        this.contactSearchTerm = '';
        this.currentPage = 1;
        this.loadMaintenances();
    }

    getSelectedContactName(): string {
        if (!this.selectedContactId) return '';
        const contact = this.serviceContacts.find(c => c.id === this.selectedContactId);
        if (!contact) return '';
        return contact.isACompany ? contact.companyName : `${contact.firstName} ${contact.lastName}`;
    }

    /**
     * Status filter methods
     */
    toggleStatusDropdown(): void {
        this.showStatusDropdown = !this.showStatusDropdown;
    }

    selectStatus(status: MaintenanceStatus | null): void {
        this.selectedStatus = status;
        this.showStatusDropdown = false;
        this.currentPage = 1;
        this.loadMaintenances();
    }

    getSelectedStatusLabel(): string {
        if (this.selectedStatus === null) return 'All Statuses';
        return this.statusOptions.find(s => s.value === this.selectedStatus)?.label || 'All Statuses';
    }

    /**
     * Check if any filters are active
     */
    hasActiveFilters(): boolean {
        return this.selectedPropertyId !== null || this.selectedContactId !== null || this.selectedStatus !== null;
    }

    /**
     * Clear all filters
     */
    clearAllFilters(): void {
        this.selectedPropertyId = null;
        this.selectedContactId = null;
        this.selectedStatus = null;
        this.propertySearchTerm = '';
        this.contactSearchTerm = '';
        this.currentPage = 1;
        this.loadMaintenances();
    }

    /**
     * Add maintenance
     */
    addMaintenance(): void {
        const dialogRef = this._dialog.open(MaintenanceDialogComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: { mode: 'create' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadMaintenances();
            }
        });
    }

    /**
     * Edit maintenance
     */
    editMaintenance(maintenance: Maintenance): void {
        const dialogRef = this._dialog.open(MaintenanceDialogComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: { mode: 'edit', maintenanceId: maintenance.id }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadMaintenances();
            }
        });
    }

    /**
     * Delete maintenance
     */
    deleteMaintenance(maintenance: Maintenance): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Maintenance',
            message: `Are you sure you want to delete this maintenance request "${maintenance.subject}"? This action cannot be undone.`,
            actions: {
                confirm: {
                    label: 'Delete',
                    color: 'warn'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._maintenanceService.deleteMaintenance(maintenance.id).subscribe({
                    next: () => {
                        this._errorHandlerService.showSuccessAlert('Success', 'Maintenance deleted successfully');
                        this.loadMaintenances();
                    },
                    error: (error) => {
                        console.error('Error deleting maintenance:', error);
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to delete maintenance');
                    }
                });
            }
        });
    }

    /**
     * Update maintenance status
     */
    updateStatus(maintenance: Maintenance, status: MaintenanceStatus): void {
        this._maintenanceService.updateMaintenanceStatus(maintenance.id, status).subscribe({
            next: () => {
                this._errorHandlerService.showSuccessAlert('Success', 'Status updated successfully');
                this.loadMaintenances();
            },
            error: (error) => {
                console.error('Error updating status:', error);
                this._errorHandlerService.showErrorAlert('Error', 'Failed to update status');
            }
        });
    }

    /**
     * Check if maintenance status is Done (handles both number and string)
     */
    isStatusDone(status: MaintenanceStatus | string | number): boolean {
        if (typeof status === 'string') {
            return status === 'Done' || status === 'done';
        }
        return status === MaintenanceStatus.Done || status === 3;
    }

    /**
     * Check if maintenance status is Cancelled (handles both number and string)
     */
    isStatusCancelled(status: MaintenanceStatus | string | number): boolean {
        if (typeof status === 'string') {
            return status === 'Cancelled' || status === 'cancelled';
        }
        return status === MaintenanceStatus.Cancelled || status === 4;
    }

    /**
     * Track by function for ngFor
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

