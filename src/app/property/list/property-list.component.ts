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
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Property } from '@shared/models/property/property.model';
import { PropertyCategory } from '@shared/models/property/property.model';
import type { PropertyListRequest } from '@shared/models/property/property-list-request.model';
import { PropertyService } from '@shared/services/property.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { ContactService } from '@shared/services/contact.service';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';

@Component({
  selector: 'app-property-list',
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
    ZardComboboxComponent,
    ZardImageHoverPreviewDirective,
    ZardSwitchComponent,
    TranslateModule,
    FormsModule,
    PropertyPricePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-list.component.html',
})
export class PropertyListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly contactService = inject(ContactService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal(''); // Actual search term sent to server
  readonly searchInput = signal(''); // Input field value (for two-way binding)
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10); // Will be initialized from preferences in ngOnInit
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly showArchived = signal(false);
  readonly archivedProperties = signal<Property[]>([]);
  readonly properties = signal<Property[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly owners = signal<Contact[]>([]);
  readonly ownerOptions = signal<ZardComboboxOption[]>([]);
  readonly selectedOwnerId = signal<string | null>(null);
  readonly isLoadingOwners = signal(false);
  
  // Reference to owner combobox for clearing
  readonly ownerComboboxRef = viewChild<ZardComboboxComponent>('ownerCombobox');
  
  // Property Types
  readonly propertyTypeOptions = signal<string[]>([]);
  readonly selectedPropertyTypes = signal<string[]>([]);
  
  readonly selectedPropertyTypesDisplay = computed(() => {
    const selected = this.selectedPropertyTypes();
    if (selected.length === 0) return '';
    if (selected.length === 1) return selected[0];
    return `${selected.length} types selected`;
  });

  // Category
  readonly selectedCategory = signal<PropertyCategory | null>(null);
  readonly categoryOptions = signal<ZardComboboxOption[]>([]);
  
  // Reference to category combobox for clearing
  readonly categoryComboboxRef = viewChild<ZardComboboxComponent>('categoryCombobox');

  // Template references for custom cells
  readonly propertyIdCell = viewChild<TemplateRef<any>>('propertyIdCell');
  readonly referenceCell = viewChild<TemplateRef<any>>('referenceCell');
  readonly addressCell = viewChild<TemplateRef<any>>('addressCell');
  readonly priceCell = viewChild<TemplateRef<any>>('priceCell');
  readonly typeCell = viewChild<TemplateRef<any>>('typeCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Property>[]>(() => [
    {
      key: 'id',
      label: 'Image',
      cellTemplate: this.propertyIdCell(),
    },
    {
      key: 'reference',
      label: 'Reference',
      sortable: true,
      cellTemplate: this.referenceCell(),
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      cellTemplate: this.addressCell(),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      cellTemplate: this.priceCell(),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      cellTemplate: this.typeCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '50px',
      cellTemplate: this.actionsCell(),
    },
  ]);

  readonly filteredProperties = computed(() => {
    return this.properties();
  });

  readonly emptyMessage = computed(() => {
    if (this.showArchived()) {
      return 'No archived properties found';
    }
    if (this.searchQuery()) {
      return 'No properties match your search';
    }
    return 'No properties available';
  });

  readonly hasData = computed(() => {
    return this.filteredProperties().length > 0;
  });

  readonly selectedCount = computed(() => {
    return this.selectedRows().size;
  });

  readonly hasSelectedProperties = computed(() => {
    return this.selectedCount() > 0;
  });

  readonly showResetButton = computed(() => {
    return (this.searchQuery() && this.searchQuery().trim() !== '') || 
           this.selectedOwnerId() !== null || 
           this.selectedPropertyTypes().length > 0 ||
           this.selectedCategory() !== null;
  });

  ngOnInit(): void {
    // Get route key for preferences (e.g., 'property/list')
    const routeKey = this.getRouteKey();
    
    // Load view type preference for this route
    const savedViewType = this.preferencesService.getViewType(routeKey);
    this.viewMode.set(savedViewType);
    
    // Load page size preference for this route
    const savedPageSize = this.preferencesService.getPageSize(routeKey);
    this.pageSize.set(savedPageSize);
    
    // Set up debounced search subscription
    this.searchInputSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only trigger if value actually changed
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        const trimmedValue = value.trim();
        
        // Only search if 3+ characters, otherwise clear search
        if (trimmedValue.length >= 3) {
          this.performSearch(trimmedValue);
        } else if (trimmedValue.length === 0 && this.searchQuery()) {
          // Clear search if input is empty
          this.performSearch('');
        } else if (trimmedValue.length > 0 && trimmedValue.length < 3) {
          // If search term is less than 3 characters, clear the search query
          this.searchQuery.set('');
          this.currentPage.set(1);
          this.loadProperties();
        }
      });
    
    this.loadProperties();
    this.loadOwners();
    this.loadPropertyTypes();
    this.loadCategories();
  }

  /**
   * Get the route key for preferences storage
   */
  private getRouteKey(): string {
    return 'property/list';
  }

  loadProperties(): void {
    this.isLoading.set(true);
    const request: PropertyListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      ...(this.searchQuery() && this.searchQuery().trim() ? { searchQuery: this.searchQuery().trim() } : {}),
      ...(this.selectedOwnerId() ? { contactId: this.selectedOwnerId()! } : {}),
      ...(this.selectedPropertyTypes().length > 0 ? { typeProperties: this.selectedPropertyTypes() } : {}),
      ...(this.selectedCategory() !== null ? { category: this.selectedCategory()! } : {}),
      // Only include isArchived when showing archived (true), otherwise omit it so backend defaults to false
      ...(this.showArchived() ? { isArchived: true } : {}),
    };
    
    this.propertyService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.properties.set(response.result);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
        // Ensure selection is cleared after data loads (forces datatable to reset)
        this.selectedRows.set(new Set());
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.isLoading.set(false);
        // Clear selection on error too
        this.selectedRows.set(new Set());
      },
    });
  }

  loadOwners(): void {
    this.isLoadingOwners.set(true);
    const request = {
      currentPage: 1,
      pageSize: 1000, // Large page size to get all owners
      ignore: false,
      type: ContactType.Owner,
    };
    
    this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.owners.set(response.result);
        // Convert contacts to combobox options
        const options: ZardComboboxOption[] = response.result.map(contact => ({
          value: contact.id,
          label: this.getOwnerDisplayName(contact),
        }));
        this.ownerOptions.set(options);
        this.isLoadingOwners.set(false);
      },
      error: (error) => {
        console.error('Error loading owners:', error);
        this.isLoadingOwners.set(false);
      },
    });
  }

  getOwnerDisplayName(contact: Contact): string {
    let name = '';
    if (contact.isACompany) {
      name = contact.companyName || '';
    } else {
      const firstName = contact.firstName || '';
      const lastName = contact.lastName || '';
      name = `${firstName} ${lastName}`.trim();
    }
    
    // Add reference if available
    if (contact.identifier) {
      return name ? `${name} (${contact.identifier})` : contact.identifier;
    }
    return name || 'Unnamed Owner';
  }

  onOwnerChange(ownerId: string | null): void {
    this.selectedOwnerId.set(ownerId);
    this.currentPage.set(1);
    this.loadProperties();
  }
  
  loadPropertyTypes(): void {
    try {
      const settingsStr = localStorage.getItem('settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        if (settings.propertyTypes && Array.isArray(settings.propertyTypes)) {
          this.propertyTypeOptions.set(settings.propertyTypes);
        }
      }
    } catch (error) {
      console.error('Error loading property types from localStorage:', error);
    }
  }

  loadCategories(): void {
    const options: ZardComboboxOption[] = [
      { value: PropertyCategory.Location.toString(), label: 'Location' },
      { value: PropertyCategory.Vente.toString(), label: 'Vente' },
      { value: PropertyCategory.LocationVacances.toString(), label: 'Location Vacances' },
    ];
    this.categoryOptions.set(options);
  }
  
  togglePropertyType(type: string): void {
    const current = this.selectedPropertyTypes();
    if (current.includes(type)) {
      this.selectedPropertyTypes.set(current.filter(t => t !== type));
    } else {
      this.selectedPropertyTypes.set([...current, type]);
    }
    this.currentPage.set(1);
    this.loadProperties();
  }

  onCategoryChange(categoryId: string | null): void {
    const category = categoryId !== null ? +categoryId as PropertyCategory : null;
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.loadProperties();
  }

  onResetFilters(): void {
    // Clear search
    this.searchInput.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    
    // Clear owner selection
    this.selectedOwnerId.set(null);
    
    // Clear combobox internal values using ControlValueAccessor
    setTimeout(() => {
      const ownerCombobox = this.ownerComboboxRef();
      if (ownerCombobox) {
        // Clear internal value - writeValue is part of ControlValueAccessor interface
        (ownerCombobox as any).writeValue(null);
      }
      const categoryCombobox = this.categoryComboboxRef();
      if (categoryCombobox) {
        (categoryCombobox as any).writeValue(null);
      }
    }, 0);
    
    // Clear property types selection
    this.selectedPropertyTypes.set([]);
    
    // Clear category selection
    this.selectedCategory.set(null);
    
    // Reload properties
    this.loadProperties();
  }

  onSearchInputChange(value: string): void {
    // Update the input value
    this.searchInput.set(value);
    // Emit to subject for debounced search
    this.searchInputSubject.next(value);
  }

  /**
   * Perform search with the given search term
   * Triggers API call
   */
  private performSearch(searchTerm: string): void {
    const currentSearchQuery = this.searchQuery();
    
    // Only update if search term actually changed
    if (searchTerm !== currentSearchQuery) {
      this.searchQuery.set(searchTerm);
      this.currentPage.set(1);
      
      // Load properties immediately
      this.loadProperties();
    }
  }

  onSearchSubmit(): void {
    // Optional: Trigger search immediately when Enter is pressed (bypasses debounce)
    const searchTerm = this.searchInput().trim();
    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      this.performSearch(searchTerm);
    }
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearchSubmit();
    }
  }

  toggleViewMode(): void {
    const newViewMode = this.viewMode() === 'list' ? 'card' : 'list';
    this.viewMode.set(newViewMode);
    // Save view type preference for current route
    const routeKey = this.getRouteKey();
    this.preferencesService.setViewType(routeKey, newViewMode);
  }

  toggleShowArchived(value: boolean): void {
    this.showArchived.set(value);
    // Clear selection immediately
    this.selectedRows.set(new Set());
    // Clear all filters
    this.searchQuery.set('');
    this.searchInput.set('');
    this.selectedOwnerId.set(null);
    this.selectedPropertyTypes.set([]);
    this.selectedCategory.set(null);
    // Clear combobox internal values
    setTimeout(() => {
      const ownerCombobox = this.ownerComboboxRef();
      if (ownerCombobox) {
        (ownerCombobox as any).writeValue(null);
      }
      const categoryCombobox = this.categoryComboboxRef();
      if (categoryCombobox) {
        (categoryCombobox as any).writeValue(null);
      }
    }, 0);
    // Reset to first page
    this.currentPage.set(1);
    // Load properties - selection will be cleared again after data loads to ensure datatable resets
    this.loadProperties();
  }

  showArchiveConfirmation(): void {
    const selectedCount = this.selectedCount();
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Archive Properties',
      zDescription: `Are you sure you want to archive ${selectedCount} propert${selectedCount > 1 ? 'ies' : 'y'}?`,
      zOkText: 'Archive',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.archiveSelectedProperties();
      }
    });
  }

  showUnarchiveConfirmation(): void {
    const selectedCount = this.selectedCount();
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Unarchive Properties',
      zDescription: `Are you sure you want to unarchive ${selectedCount} propert${selectedCount > 1 ? 'ies' : 'y'}?`,
      zOkText: 'Unarchive',
      zCancelText: 'Cancel',
      zOkDestructive: false,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.unarchiveSelectedProperties();
      }
    });
  }

  archiveSelectedProperties(): void {
    const selectedIds = Array.from(this.selectedRows());
    if (selectedIds.length === 0) return;

    this.isDeleting.set(true);
    
    // Archive each selected property via API
    const archivePromises = selectedIds.map(id => 
      this.propertyService.updateArchiveStatus(id, true).pipe(takeUntil(this.destroy$)).toPromise()
    );

    Promise.all(archivePromises).then(() => {
      // Reload properties to get updated list from server
      this.loadProperties();
      this.selectedRows.set(new Set());
      this.isDeleting.set(false);
    }).catch((error) => {
      console.error('Error archiving properties:', error);
      this.isDeleting.set(false);
    });
  }

  unarchiveSelectedProperties(): void {
    const selectedIds = Array.from(this.selectedRows());
    if (selectedIds.length === 0) return;

    this.isDeleting.set(true);
    
    // Unarchive each selected property via API
    const unarchivePromises = selectedIds.map(id => 
      this.propertyService.updateArchiveStatus(id, false).pipe(takeUntil(this.destroy$)).toPromise()
    );

    Promise.all(unarchivePromises).then(() => {
      // Reload properties to get updated list from server
      this.loadProperties();
      this.selectedRows.set(new Set());
      this.isDeleting.set(false);
    }).catch((error) => {
      console.error('Error unarchiving properties:', error);
      this.isDeleting.set(false);
    });
  }

  onViewProperty(property: Property): void {
    console.log('View property:', property);
    // TODO: Implement view functionality
  }

  onEditProperty(property: Property): void {
    this.router.navigate(['/property', property.id]);
  }

  onDeleteProperty(property: Property): void {
    const propertyName = property.name || property.identifier;
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Property',
      zDescription: `Are you sure you want to delete ${propertyName}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.isDeleting.set(true);
        this.propertyService.delete(property.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            // Reload properties to get updated list from server
            this.loadProperties();
            // Remove from selection if selected
            const newSet = new Set(this.selectedRows());
            newSet.delete(property.id);
            this.selectedRows.set(newSet);
            this.isDeleting.set(false);
          },
          error: (error) => {
            console.error('Error deleting property:', error);
            this.isDeleting.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProperties();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page when page size changes
    // Save page size preference for current route
    const routeKey = this.getRouteKey();
    this.preferencesService.setPageSize(routeKey, size);
    this.loadProperties();
  }

  onSelectionChange(selection: Set<string>): void {
    this.selectedRows.set(selection);
  }

  toggleSelect(propertyId: string): void {
    const newSet = new Set(this.selectedRows());
    if (newSet.has(propertyId)) {
      newSet.delete(propertyId);
    } else {
      newSet.add(propertyId);
    }
    this.selectedRows.set(newSet);
  }

  isSelected(propertyId: string): boolean {
    return this.selectedRows().has(propertyId);
  }

  getPropertyDisplayName(property: Property): string {
    return property.name || property.identifier || 'Unnamed Property';
  }

  getPropertyTypeLabel(property: Property): string {
    return property.typeProperty || 'N/A';
  }

  getInitials(property: Property): string {
    const name = this.getPropertyDisplayName(property);
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getOwnerName(property: Property): string {
    // First try ownerName from property
    if (property.ownerName) {
      return property.ownerName;
    }
    
    // Then try contact object
    if (property.contact) {
      // If companyName exists and is not empty, it's a company
      if (property.contact.companyName && property.contact.companyName.trim() !== '') {
        return property.contact.companyName;
      } else {
        // Otherwise, it's a person - use firstName and lastName
        const firstName = property.contact.firstName || '';
        const lastName = property.contact.lastName || '';
        return `${firstName} ${lastName}`.trim();
      }
    }
    
    return '';
  }

  getOwnerReference(property: Property): string {
    if (property.contact && property.contact.identifier) {
      return property.contact.identifier;
    }
    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

