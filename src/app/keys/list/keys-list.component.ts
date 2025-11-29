import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import {  Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Key } from '@shared/models/key/key.model';
import type { KeyListRequest } from '@shared/models/key/key-list-request.model';
import { KeyService } from '@shared/services/key.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { PropertyService } from '@shared/services/property.service';
import type { Property as PropertyModel } from '@shared/models/property/property.model';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { EditKeyComponent } from '../edit/edit-key.component';
import { ZardImageViewerComponent, type ImageItem } from '@shared/image-viewer/image-viewer.component';
import { imageSlideAnimation } from '@shared/animations/image-swap.animations';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';

@Component({
  selector: 'app-keys-list',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    ZardDatatablePaginationComponent,
    ZardComboboxComponent,
    ZardImageViewerComponent,
    ZardImageHoverPreviewDirective,
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './keys-list.component.html',
  animations: [imageSlideAnimation],
})
export class KeysListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly keyService = inject(KeyService);
  private readonly propertyService = inject(PropertyService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal(''); // Actual search term sent to server
  readonly searchInput = signal(''); // Input field value (for two-way binding)
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10); // Will be initialized from preferences in ngOnInit
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly keys = signal<Key[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly properties = signal<PropertyModel[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly selectedPropertyId = signal<string | null>(null);
  readonly isLoadingProperties = signal(false);
  
  // Image viewer state
  readonly isImageViewerOpen = signal(false);
  readonly imageViewerIndex = signal(0);
  readonly selectedKeyForImageViewer = signal<Key | null>(null);
  
  // Reference to property combobox for clearing
  readonly propertyComboboxRef = viewChild<ZardComboboxComponent>('propertyCombobox');

  // Template references for custom cells
  readonly keyIdCell = viewChild<TemplateRef<any>>('keyIdCell');
  readonly nameCell = viewChild<TemplateRef<any>>('nameCell');
  readonly propertyCell = viewChild<TemplateRef<any>>('propertyCell');
  readonly descriptionCell = viewChild<TemplateRef<any>>('descriptionCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Key>[]>(() => [
    {
      key: 'id',
      label: 'Key',
      cellTemplate: this.keyIdCell(),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      cellTemplate: this.nameCell(),
    },
    {
      key: 'property',
      label: 'Property',
      sortable: true,
      cellTemplate: this.propertyCell(),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      cellTemplate: this.descriptionCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '50px',
      cellTemplate: this.actionsCell(),
    },
  ]);

  readonly filteredKeys = computed(() => {
    return this.keys();
  });

  readonly emptyMessage = computed(() => {
    if (this.searchQuery()) {
      return this.translateService.instant('keys.list.emptySearch');
    }
    return this.translateService.instant('keys.list.empty');
  });

  readonly hasData = computed(() => {
    return this.filteredKeys().length > 0;
  });

  readonly selectedCount = computed(() => {
    return this.selectedRows().size;
  });

  readonly hasSelectedKeys = computed(() => {
    return this.selectedCount() > 0;
  });

  readonly showResetButton = computed(() => {
    return (this.searchQuery() && this.searchQuery().trim() !== '') || 
           this.selectedPropertyId() !== null;
  });

  ngOnInit(): void {
    // Get route key for preferences (e.g., 'keys/list')
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
          this.loadKeys();
        }
      });
    
    this.loadKeys();
    this.loadProperties();
  }

  /**
   * Get the route key for preferences storage
   */
  private getRouteKey(): string {
    return 'keys/list';
  }

  loadKeys(): void {
    this.isLoading.set(true);
    const request: KeyListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      ...(this.searchQuery() && this.searchQuery().trim() ? { searchQuery: this.searchQuery().trim() } : {}),
      ...(this.selectedPropertyId() ? { propertyId: this.selectedPropertyId()! } : {}),
    };
    
    this.keyService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.keys.set(response.result);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
        // Ensure selection is cleared after data loads (forces datatable to reset)
        this.selectedRows.set(new Set());
      },
      error: (error) => {
        this.isLoading.set(false);
        // Clear selection on error too
        this.selectedRows.set(new Set());
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
          label: this.getPropertyDisplayName(property),
        }));
        this.propertyOptions.set(options);
        this.isLoadingProperties.set(false);
      },
      error: (error) => {
        this.isLoadingProperties.set(false);
      },
    });
  }

  getPropertyDisplayName(property: PropertyModel): string {
    let name = property.name || property.identifier || 'Unnamed Property';
    
    // Add identifier if available and different from name
    if (property.identifier && property.identifier !== name) {
      return `${name} (${property.identifier})`;
    }
    return name;
  }

  onPropertyChange(propertyId: string | null): void {
    this.selectedPropertyId.set(propertyId);
    this.currentPage.set(1);
    this.loadKeys();
  }

  onResetFilters(): void {
    // Clear search
    this.searchInput.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    
    // Clear property selection
    this.selectedPropertyId.set(null);
    
    // Clear combobox internal value using ControlValueAccessor
    setTimeout(() => {
      const combobox = this.propertyComboboxRef();
      if (combobox) {
        // Clear internal value - writeValue is part of ControlValueAccessor interface
        (combobox as any).writeValue(null);
      }
    }, 0);
    
    // Reload keys
    this.loadKeys();
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
      
      // Load keys immediately
      this.loadKeys();
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

  onEditKey(key: Key): void {
    const dialogRef = this.dialogService.create({
      zContent: EditKeyComponent,
      zTitle: 'Edit Key',
      zWidth: '800px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: { keyId: key.id },
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        // Reload keys after editing
        this.loadKeys();
      }
    });
  }

  onAddKey(): void {
    const dialogRef = this.dialogService.create({
      zContent: EditKeyComponent,
      zTitle: 'Add Key',
      zWidth: '800px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: {},
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        // Reload keys after adding
        this.loadKeys();
      }
    });
  }

  onDeleteKey(key: Key): void {
    const keyName = key.name || 'this key';
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Key',
      zDescription: `Are you sure you want to delete ${keyName}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.isDeleting.set(true);
        this.keyService.delete(key.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            // Reload keys to get updated list from server
            this.loadKeys();
            // Remove from selection if selected
            const newSet = new Set(this.selectedRows());
            newSet.delete(key.id);
            this.selectedRows.set(newSet);
            this.isDeleting.set(false);
          },
          error: (error) => {
            this.isDeleting.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadKeys();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page when page size changes
    // Save page size preference for current route
    const routeKey = this.getRouteKey();
    this.preferencesService.setPageSize(routeKey, size);
    this.loadKeys();
  }

  onSelectionChange(selection: Set<string>): void {
    this.selectedRows.set(selection);
  }

  toggleSelect(keyId: string): void {
    const newSet = new Set(this.selectedRows());
    if (newSet.has(keyId)) {
      newSet.delete(keyId);
    } else {
      newSet.add(keyId);
    }
    this.selectedRows.set(newSet);
  }

  isSelected(keyId: string): boolean {
    return this.selectedRows().has(keyId);
  }

  getKeyDisplayName(key: Key): string {
    return key.name || 'Unnamed Key';
  }

  getPropertyName(key: Key): string {
    // First try to use the property object if available
    if (key.property) {
      return this.getPropertyDisplayName(key.property as any);
    }
    
    // If property object is not available, look it up from the loaded properties list
    if (key.propertyId) {
      const property = this.properties().find(p => p.id === key.propertyId);
      if (property) {
        return this.getPropertyDisplayName(property);
      }
    }
    
    return 'Unknown Property';
  }

  // Image viewer methods
  getKeyAttachments(key: Key): ImageItem[] {
    // Prioritize defaultAttachmentUrl (single image model)
    if (key.defaultAttachmentUrl) {
      return [{
        url: key.defaultAttachmentUrl,
        name: 'Key image',
        size: 0,
      }];
    }
    
    // Fallback to attachments array if available
    if (!key.attachments || key.attachments.length === 0) {
      return [];
    }
    
    // Sort attachments: default image first
    const defaultId = key.defaultAttachmentId;
    if (!defaultId) {
      return key.attachments.map(att => ({
        url: att.url,
        name: att.fileName || 'Image',
        size: 0,
      }));
    }
    
    const sorted = [...key.attachments];
    const defaultIndex = sorted.findIndex(att => att.id === defaultId);
    
    if (defaultIndex > 0) {
      const defaultAttachment = sorted.splice(defaultIndex, 1)[0];
      sorted.unshift(defaultAttachment);
    }
    
    return sorted.map(att => ({
      url: att.url,
      name: att.fileName || 'Image',
      size: 0,
    }));
  }

  getKeyImageUrl(key: Key): string | null {
    // Prioritize defaultAttachmentUrl (single image model)
    if (key.defaultAttachmentUrl) {
      return key.defaultAttachmentUrl;
    }
    // Fallback to attachments if available
    if (key.attachments && key.attachments.length > 0) {
      return key.attachments[0].url;
    }
    return null;
  }

  hasKeyImages(key: Key): boolean {
    return !!key.defaultAttachmentUrl || !!(key.attachments && key.attachments.length > 0);
  }

  openImageViewer(key: Key, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const images = this.getKeyAttachments(key);
    if (images.length > 0) {
      this.selectedKeyForImageViewer.set(key);
      this.imageViewerIndex.set(0);
      this.isImageViewerOpen.set(true);
    }
  }

  closeImageViewer(): void {
    this.isImageViewerOpen.set(false);
    this.selectedKeyForImageViewer.set(null);
  }

  onImageChanged(index: number): void {
    this.imageViewerIndex.set(index);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

