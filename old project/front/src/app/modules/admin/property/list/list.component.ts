import { AsyncPipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from 'app/modules/admin/property/property.service';
import { Property, PropertyCategory, getPropertyCategoryLabel as getCategoryLabel, GetPropertiesFilter } from 'app/modules/admin/property/property.types';
import { Observable, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { AuthService } from 'app/core/auth/auth.service';
import { ContactsService } from 'app/modules/admin/contacts/contacts.service';
import { Contact } from 'app/modules/admin/contacts/contacts.types';
import { FuseViewToggleComponent } from '@fuse/components/view-toggle/view-toggle.component';
import { AppConfigService } from '@fuse/services/config/app-config.service';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';
import { PermissionService } from 'app/core/auth/permission.service';
import { PricePaymentTypePipe } from '@fuse/pipes/price-payment-type/price-payment-type.pipe';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

@Component({
    selector       : 'property-list',
    templateUrl    : './list.component.html',
    styleUrls      : ['./list.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [NgIf, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, NgFor, NgClass, RouterLink, AsyncPipe, MatTooltipModule, MatPaginatorModule, MatSelectModule, MatOptionModule, NoDataComponent, FuseViewToggleComponent, PricePaymentTypePipe],
})
export class PropertyListComponent implements OnInit, OnDestroy
{
    properties$: Observable<Property[]>
    showFrenchLabels: boolean = true; // Set to true to show French labels by default;

    propertiesCount: number = 0;
    selectedProperty: Property;
    
    // Pagination
    pagination: { currentPage: number, totalPages: number, totalItems: number } = { currentPage: 1, totalPages: 1, totalItems: 0 };
    pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    pageSizeOptions: number[] = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;
    
    // Filters
    searchControl: FormControl = new FormControl('');
    selectedPropertyType: string | null = null;
    selectedCategory: PropertyCategory | null = null;
    selectedOwnerId: string | null = null;
    
    // Search terms for custom dropdowns
    typeSearchTerm: string = '';
    categorySearchTerm: string = '';
    ownerSearchTerm: string = '';
    
    // Dropdown visibility flags
    showTypeDropdown: boolean = false;
    showCategoryDropdown: boolean = false;
    showOwnerDropdown: boolean = false;
    
    // Track if user is actively editing
    isEditingType: boolean = false;
    isEditingCategory: boolean = false;
    isEditingOwner: boolean = false;
    
    // Filtered lists
    filteredPropertyTypes: any[] = [];
    filteredPropertyCategories: PropertyCategory[] = [];
    filteredOwners: Contact[] = [];
    
    // View mode
    viewMode: 'list' | 'cards' = 'list';
    
    // Property types from localStorage
    propertyTypes: any[] = [];
    
    // Property categories
    propertyCategories: PropertyCategory[] = [PropertyCategory.Location, PropertyCategory.Vente, PropertyCategory.LocationVacances];
    
    // Owners list
    owners: Contact[] = [];
    
    // Permissions
    canViewProperties: boolean = false;
    canEditProperties: boolean = false;
    canDeleteProperties: boolean = false;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Expose changeDetectorRef for template access
    get changeDetectorRef(): ChangeDetectorRef
    {
        return this._changeDetectorRef;
    }

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _propertyService: PropertyService,
        private _router: Router,
        private _authService: AuthService,
        private _contactsService: ContactsService,
        private _appConfigService: AppConfigService,
        private _permissionService: PermissionService,
        private _errorHandlerService: ErrorHandlerService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Check permissions
        this.canViewProperties = this._permissionService.canView('properties');
        this.canEditProperties = this._permissionService.canEdit('properties');
        this.canDeleteProperties = this._permissionService.canDelete('properties');
        
        // If user doesn't have view permission, don't load data
        if (!this.canViewProperties) {
            return;
        }
        
        // Load view mode from app config
        this.viewMode = this._appConfigService.getContactViewPreference('property');
        
        // Load property types and categories from localStorage
        this.loadPropertyTypesFromSettings();
        this.loadPropertyCategoriesFromSettings();
        
        // Initialize filtered lists
        this.filteredPropertyTypes = [...this.propertyTypes];
        this.filteredPropertyCategories = [...this.propertyCategories];
        
        // Load owners/contacts
        this.loadOwners();
        
        // Initialize filter values as undefined to show placeholders
        this.selectedPropertyType = null;
        this.selectedCategory = null;
        this.selectedOwnerId = null;
        
        // Get the properties
        this.properties$ = this._propertyService.properties$;
        
        // Get pagination
        this._propertyService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) =>
            {
                this.pagination = pagination;
                // Update total count from pagination
                this.propertiesCount = pagination.totalItems;
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        this._propertyService.properties$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((properties: Property[]) =>
            {
                // Force change detection
                this._changeDetectorRef.detectChanges();
            });

        // Get the property
        this._propertyService.property$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((property: Property) =>
            {
                // Update the selected property
                this.selectedProperty = property;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Setup search with debounce - only search after 3 characters or when empty
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((value) => {
                // Only trigger search if 3+ characters or empty (to reset)
                if (!value || value.length >= 3) {
                    this.loadProperties();
                }
            });

        // Load properties with pagination
        this.loadProperties();
        
        // Mark for check to ensure dropdowns display properly
        this._changeDetectorRef.markForCheck();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create property
     */
    createProperty(): void
    {
        // Navigate to the property wizard
        this._router.navigate(['add'], {relativeTo: this._activatedRoute.parent});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void
    {
        this.pageSize = event.pageSize;
        this.pagination.currentPage = event.pageIndex + 1; // Material paginator is 0-indexed, our API is 1-indexed
        
        // Load properties for the new page
        this.loadProperties();
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Load property types from localStorage settings
     */
    loadPropertyTypesFromSettings(): void {
        const settings = this._authService.getSettings();
        
        // Load property types from localStorage settings
        if (settings && settings.propertyTypes && settings.propertyTypes.length > 0) {
            this.propertyTypes = settings.propertyTypes.map((type: string) => ({
                value: type,
                label: type,
                labelFr: type
            }));
        } else {
            this.propertyTypes = [];
        }
    }

    /**
     * Load property categories from localStorage settings
     */
    loadPropertyCategoriesFromSettings(): void {
        // Categories are now static enum values
        this.propertyCategories = [PropertyCategory.Location, PropertyCategory.Vente, PropertyCategory.LocationVacances];
    }

    /**
     * Load owners (contacts)
     */
    loadOwners(): void {
        // Load all contacts as potential owners (ignore pagination to get all)
        this._contactsService.getContactsByType('owner', 1, 1000, true)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (contacts) => {
                    this.owners = contacts || [];
                    this.filteredOwners = [...this.owners];
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    // If owner type fails, try with all contacts
                    this._contactsService.getContactsByType('tenant', 1, 1000, true)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe({
                            next: (contacts) => {
                                this.owners = contacts || [];
                                this.filteredOwners = [...this.owners];
                                this._changeDetectorRef.markForCheck();
                            }
                        });
                }
            });
    }

    /**
     * Load properties with current filters
     */
    loadProperties(): void {
        const filter: GetPropertiesFilter = {
            currentPage: this.pagination.currentPage,
            pageSize: this.pageSize,
            ignore: false,
            searchQuery: this.searchControl.value || ''
        };

        // Apply filters
        if (this.selectedPropertyType !== null) {
            filter.typeProperty = this.selectedPropertyType;
        }

        if (this.selectedCategory !== null) {
            filter.category = this.selectedCategory;
        }

        if (this.selectedOwnerId) {
            filter.contactId = this.selectedOwnerId;
        }

        this._propertyService.getProperties(filter)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (result) => {
                    // Force change detection after data loads
                    this._changeDetectorRef.detectChanges();
                },
                error: (error) => {
                    // Error loading properties
                }
            });
    }

    /**
     * Clear all filters
     */
    clearFilters(): void {
        this.searchControl.setValue('');
        this.selectedPropertyType = null;
        this.selectedCategory = null;
        this.selectedOwnerId = null;
        this.typeSearchTerm = '';
        this.categorySearchTerm = '';
        this.ownerSearchTerm = '';
        this.pagination.currentPage = 1;
        this.loadProperties();
    }
    
    /**
     * Filter property types based on search term
     */
    filterPropertyTypes(): void {
        if (!this.typeSearchTerm) {
            this.filteredPropertyTypes = [...this.propertyTypes];
        } else {
            const lowerSearchTerm = this.typeSearchTerm.toLowerCase();
            this.filteredPropertyTypes = this.propertyTypes.filter(type => 
                this.getPropertyTypeDisplayLabel(type).toLowerCase().includes(lowerSearchTerm)
            );
        }
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Filter categories based on search term
     */
    filterCategories(): void {
        if (!this.categorySearchTerm) {
            this.filteredPropertyCategories = [...this.propertyCategories];
        } else {
            const lowerSearchTerm = this.categorySearchTerm.toLowerCase();
            this.filteredPropertyCategories = this.propertyCategories.filter(category => 
                getCategoryLabel(category).toLowerCase().includes(lowerSearchTerm)
            );
        }
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Filter owners based on search term
     */
    filterOwners(): void {
        if (!this.ownerSearchTerm) {
            this.filteredOwners = [...this.owners];
        } else {
            const lowerSearchTerm = this.ownerSearchTerm.toLowerCase();
            this.filteredOwners = this.owners.filter(owner => {
                const ownerName = owner.isACompany ? owner.companyName : `${owner.firstName} ${owner.lastName}`;
                return ownerName.toLowerCase().includes(lowerSearchTerm);
            });
        }
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Select property type
     */
    selectPropertyType(type: string | null): void {
        this.selectedPropertyType = type;
        this.typeSearchTerm = '';
        this.isEditingType = false;
        this.showTypeDropdown = false;
        this.onFilterChange();
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Clear property type selection
     */
    clearPropertyTypeSelection(): void {
        this.selectedPropertyType = null;
        this.typeSearchTerm = '';
        this.isEditingType = false;
        this.onFilterChange();
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Select category
     */
    selectCategory(category: PropertyCategory | null): void {
        this.selectedCategory = category;
        this.categorySearchTerm = '';
        this.isEditingCategory = false;
        this.showCategoryDropdown = false;
        this.onFilterChange();
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Clear category selection
     */
    clearCategorySelection(): void {
        this.selectedCategory = null;
        this.categorySearchTerm = '';
        this.isEditingCategory = false;
        this.onFilterChange();
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Select owner
     */
    selectOwner(ownerId: string | null): void {
        this.selectedOwnerId = ownerId;
        this.ownerSearchTerm = '';
        this.isEditingOwner = false;
        this.showOwnerDropdown = false;
        this.onFilterChange();
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Clear owner selection
     */
    clearOwnerSelection(): void {
        this.selectedOwnerId = null;
        this.ownerSearchTerm = '';
        this.isEditingOwner = false;
        this.onFilterChange();
        this._changeDetectorRef.markForCheck();
    }
    
    /**
     * Handle type input events
     */
    onTypeInput(event: any): void {
        const value = event.target.value;
        this.typeSearchTerm = value;
        this.isEditingType = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            if (this.selectedPropertyType !== null) {
                this.selectedPropertyType = null;
                this.onFilterChange();
            }
        }
        
        this.filterPropertyTypes();
    }
    
    onTypeFocus(): void {
        // Clear search term to allow editing
        this.typeSearchTerm = '';
        this.isEditingType = true;
        this.showTypeDropdown = true;
        this.filterPropertyTypes();
    }
    
    onTypeBlur(): void {
        setTimeout(() => {
            this.showTypeDropdown = false;
            this.isEditingType = false;
            // Clear search term for next time
            this.typeSearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }
    
    /**
     * Handle category input events
     */
    onCategoryInput(event: any): void {
        const value = event.target.value;
        this.categorySearchTerm = value;
        this.isEditingCategory = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            if (this.selectedCategory !== null) {
                this.selectedCategory = null;
                this.onFilterChange();
            }
        }
        
        this.filterCategories();
    }
    
    onCategoryFocus(): void {
        // Clear search term to allow editing
        this.categorySearchTerm = '';
        this.isEditingCategory = true;
        this.showCategoryDropdown = true;
        this.filterCategories();
    }
    
    onCategoryBlur(): void {
        setTimeout(() => {
            this.showCategoryDropdown = false;
            this.isEditingCategory = false;
            // Clear search term for next time
            this.categorySearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }
    
    /**
     * Handle owner input events
     */
    onOwnerInput(event: any): void {
        const value = event.target.value;
        this.ownerSearchTerm = value;
        this.isEditingOwner = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            if (this.selectedOwnerId) {
                this.selectedOwnerId = null;
                this.onFilterChange();
            }
        }
        
        this.filterOwners();
    }
    
    onOwnerFocus(): void {
        // Clear search term to allow editing
        this.ownerSearchTerm = '';
        this.isEditingOwner = true;
        this.showOwnerDropdown = true;
        this.filterOwners();
    }
    
    /**
     * Handle owner input events - allow clearing the input
     */
    onOwnerInputKeyDown(event: KeyboardEvent): void {
        // Allow escape to close dropdown
        if (event.key === 'Escape') {
            this.showOwnerDropdown = false;
        }
    }
    
    onOwnerBlur(): void {
        setTimeout(() => {
            this.showOwnerDropdown = false;
            this.isEditingOwner = false;
            // Clear search term for next time
            this.ownerSearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }
    
    /**
     * Get selected property type label
     */
    getSelectedPropertyTypeLabel(): string {
        if (this.selectedPropertyType === null) {
            return 'All Types';  // Show "All Types" when no specific type is selected
        }
        const type = this.propertyTypes.find(t => t.value === this.selectedPropertyType);
        return type ? this.getPropertyTypeDisplayLabel(type) : 'All Types';
    }
    
    /**
     * Get selected owner name
     */
    getSelectedOwnerName(): string {
        if (this.selectedOwnerId === null) {
            return 'All';  // Show "All" when no specific owner is selected
        }
        const owner = this.owners.find(o => o.id === this.selectedOwnerId);
        return owner ? (owner.isACompany ? owner.companyName : `${owner.firstName} ${owner.lastName}`) : 'All';
    }
    
    /**
     * Get selected category name
     */
    getSelectedCategoryName(): string {
        if (this.selectedCategory === null) {
            return 'All';  // Show "All" when no specific category is selected
        }
        return getCategoryLabel(this.selectedCategory);
    }

    /**
     * Toggle view mode
     */
    setViewMode(mode: 'list' | 'cards'): void {
        this.viewMode = mode;
        // Save view preference to app config
        this._appConfigService.setContactViewPreference('property', mode);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle filter change
     */
    onFilterChange(): void {
        this.pagination.currentPage = 1; // Reset to first page when filter changes
        this.loadProperties();
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    /**
     * Get property type label
     */
    getPropertyTypeLabel(type: string): string
    {
        // TypeProperty is now stored as a string in the backend
        // Return the string directly, or empty string if null/undefined
        return type || '';
    }

    /**
     * Get property type display label for filter dropdown
     */
    getPropertyTypeDisplayLabel(propertyType: any): string
    {
        return this.showFrenchLabels ? propertyType.labelFr : propertyType.label;
    }

    /**
     * Get property category label
     */
    getPropertyCategoryLabel(category: PropertyCategory | string): string
    {
        // Handle string values from backend
        if (typeof category === 'string') {
            const lowerCategory = category.toLowerCase();
            if (lowerCategory === 'location') return 'Location';
            if (lowerCategory === 'vente') return 'Vente';
            if (lowerCategory === 'locationvacances') return 'Location vacances';
            return category; // Return as-is if it's an unknown string
        }
        
        // Handle numeric enum values
        return getCategoryLabel(category);
    }

    /**
     * Get payment type label
     */
    getPaymentTypeLabel(typePaiment: number | string): string
    {
        // Handle string values from backend
        if (typeof typePaiment === 'string') {
            const lowerType = typePaiment.toLowerCase();
            if (lowerType === 'monthly') return 'Monthly';
            if (lowerType === 'daily') return 'Daily';
            if (lowerType === 'weekly') return 'Weekly';
            if (lowerType === 'fixed') return 'Fixed';
            return typePaiment; // Return as-is if it's an unknown string
        }
        
        // Handle numeric enum values
        switch(typePaiment) {
            case 0: return 'Monthly';
            case 1: return 'Daily';
            case 2: return 'Weekly';
            case 3: return 'Fixed';
            default: return 'N/A';
        }
    }

    /**
     * Get the image URL for display
     */
    getImageUrl(imageUrl: string): string | null
    {
        if (!imageUrl) {
            return null;
        }

        // If it already has the data URL prefix, return as is
        if (imageUrl.startsWith('data:')) {
            return imageUrl;
        }

        // If it's already a URL (http/https), return as is
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }

        // Otherwise, assume it's a plain base64 string and add the data URL prefix
        return `data:image/png;base64,${imageUrl}`;
    }

    /**
     * Get the default attachment URL for a property
     */
    getDefaultAttachmentUrl(property: Property): string | null
    {
        // Return the URL directly if it exists
        if (property.defaultAttachmentUrl) {
            return this.getImageUrl(property.defaultAttachmentUrl);
        }
        
        // Fallback to first attachment if available
        if (property.attachments && property.attachments.length > 0) {
            return this.getImageUrl(property.attachments[0].url);
        }
        
        return null;
    }

    /**
     * Navigate to property details
     */
    viewProperty(property: Property): void
    {
        this._router.navigate([property.id], {relativeTo: this._activatedRoute.parent});
    }

    /**
     * Navigate to property editor
     */
    editProperty(property: Property): void
    {
        this._router.navigate([property.id, 'edit'], {relativeTo: this._activatedRoute.parent});
    }

    /**
     * Delete property with confirmation
     */
    deleteProperty(property: Property, event: Event): void
    {
        // Prevent navigation when clicking delete button
        event.preventDefault();
        event.stopPropagation();

        // Check if user has delete permission
        if (!this.canDeleteProperties) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to delete properties');
            return;
        }

        // Confirm deletion
        const propertyName = property.name || property.identifier || 'this property';
        if (!confirm(`Are you sure you want to delete "${propertyName}"? This action cannot be undone.`)) {
            return;
        }

        // Delete the property
        this._propertyService.deleteProperty(property.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (success) => {
                    if (success) {
                        this._errorHandlerService.showSuccessAlert('Success', `Property "${propertyName}" has been deleted successfully`);
                        // Reload properties list
                        this.loadProperties();
                        this._changeDetectorRef.markForCheck();
                    } else {
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to delete property');
                    }
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', error?.error?.message || 'Failed to delete property');
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    /**
     * Navigate to tenants
     */
    viewTenants(property: Property): void
    {
        this._router.navigate(['/contacts/tenants'], { queryParams: { propertyId: property.id } });
    }

    /**
     * Navigate to accounting
     */
    viewAccounting(property: Property): void
    {
        // TODO: Implement accounting navigation
    }

    /**
     * Navigate to equipment
     */
    viewEquipment(property: Property): void
    {
        // TODO: Implement equipment management
    }

    /**
     * Navigate to maintenance
     */
    viewMaintenance(property: Property): void
    {
        // TODO: Implement maintenance management
    }

    /**
     * Check if category matches (handles both string and numeric values)
     */
    isCategoryLocation(category: PropertyCategory | string): boolean
    {
        if (typeof category === 'string') {
            return category.toLowerCase() === 'location';
        }
        return category === 0; // PropertyCategory.Location
    }

    isCategoryVente(category: PropertyCategory | string): boolean
    {
        if (typeof category === 'string') {
            return category.toLowerCase() === 'vente';
        }
        return category === 1; // PropertyCategory.Vente
    }

    isCategoryLocationVacances(category: PropertyCategory | string): boolean
    {
        if (typeof category === 'string') {
            return category.toLowerCase() === 'locationvacances';
        }
        return category === 2; // PropertyCategory.LocationVacances
    }

}
