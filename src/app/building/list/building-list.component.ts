import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardSheetService } from '@shared/components/sheet/sheet.service';
import { ZardSheetRef } from '@shared/components/sheet/sheet-ref';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Building } from '@shared/models/building/building.model';
import type { BuildingListRequest } from '@shared/models/building/building-list-request.model';
import { BuildingService } from '@shared/services/building.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { ToastService } from '@shared/services/toast.service';
import { UserService } from '@shared/services/user.service';
import { PropertyService } from '@shared/services/property.service';
import type { Property } from '@shared/models/property/property.model';
import type { PropertyListRequest } from '@shared/models/property/property-list-request.model';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCheckboxComponent,
    ZardIconComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    ZardDatatablePaginationComponent,
    ZardImageHoverPreviewDirective,
    ZardSwitchComponent,
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './building-list.component.html',
})
export class BuildingListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly buildingService = inject(BuildingService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly propertyService = inject(PropertyService);
  private readonly sheetService = inject(ZardSheetService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal('');
  readonly searchInput = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10);
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly showArchived = signal(false);
  readonly archivedBuildings = signal<Building[]>([]);
  readonly buildings = signal<Building[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);

  // Check if any filters are active
  readonly hasActiveFilters = computed(() => {
    return (this.searchQuery() && this.searchQuery().trim() !== '');
  });

  // Template references for custom cells
  readonly imageCell = viewChild<TemplateRef<any>>('imageCell');
  readonly nameCell = viewChild<TemplateRef<any>>('nameCell');
  readonly addressCell = viewChild<TemplateRef<any>>('addressCell');
  readonly detailsCell = viewChild<TemplateRef<any>>('detailsCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');
  readonly propertiesSheetTemplate = viewChild<TemplateRef<any>>('propertiesSheetTemplate');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Building>[]>(() => [
    {
      key: 'image',
      label: 'Image',
      cellTemplate: this.imageCell(),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      cellTemplate: this.nameCell(),
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      cellTemplate: this.addressCell(),
    },
    {
      key: 'details',
      label: 'Details',
      cellTemplate: this.detailsCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '50px',
      cellTemplate: this.actionsCell(),
    },
  ]);

  readonly emptyMessage = computed(() => {
    if (this.showArchived()) {
      return 'No archived buildings found';
    }
    return 'No buildings found';
  });

  readonly filteredBuildings = computed(() => {
    const buildings = this.showArchived() ? this.archivedBuildings() : this.buildings();
    return buildings;
  });

  readonly hasData = computed(() => {
    return this.filteredBuildings().length > 0;
  });

  // Effect to load preferences on init
  private readonly preferencesEffect = effect(() => {
    const route = this.route.snapshot.routeConfig?.path || 'building';
    const prefs = this.preferencesService.getPreferences(route);
    if (prefs) {
      this.pageSize.set(prefs.pageSize || 10);
      this.viewMode.set((prefs.viewType || 'list') as 'list' | 'card');
    }
  });

  // Effect to debounce search input
  private readonly searchEffect = effect(() => {
    this.searchInputSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.currentPage.set(1);
        this.loadBuildings();
      });
  });

  ngOnInit(): void {
    this.loadBuildings();
  }

  ngOnDestroy(): void {
    // Close any open sheet before destroying component
    if (this.propertiesSheetRef) {
      this.propertiesSheetRef.close();
      this.propertiesSheetRef = null;
    }
    this.destroy$.next();
    this.destroy$.complete();
    this.searchInputSubject.complete();
  }

  loadBuildings(): void {
    this.isLoading.set(true);
    
    const request: BuildingListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      searchQuery: this.searchQuery() || undefined,
      // Only include isArchived when showing archived (true), otherwise omit it so backend defaults to false
      ...(this.showArchived() ? { isArchived: true } : {}),
    };

    this.buildingService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        // Store in the appropriate signal based on archive status
        if (this.showArchived()) {
          this.archivedBuildings.set(response.result);
        } else {
          this.buildings.set(response.result);
        }
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
        // Ensure selection is cleared after data loads
        this.selectedRows.set(new Set());
      },
      error: (error) => {
        console.error('Error loading buildings:', error);
        this.toastService.error('Failed to load buildings');
        this.isLoading.set(false);
      },
    });
  }

  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    this.searchInputSubject.next(value);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadBuildings();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.savePreferences();
    this.loadBuildings();
  }

  onViewModeChange(mode: 'list' | 'card'): void {
    this.viewMode.set(mode);
    this.savePreferences();
  }

  onResetFilters(): void {
    this.searchInput.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadBuildings();
  }

  onShowArchivedChange(show: boolean): void {
    this.showArchived.set(show);
    this.currentPage.set(1);
    // Clear selection when switching between archived and non-archived
    this.selectedRows.set(new Set());
    this.loadBuildings();
  }

  onEditBuilding(building: Building): void {
    this.router.navigate(['/building', building.id]);
  }

  onDeleteBuilding(building: Building): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Building',
      zDescription: `Are you sure you want to delete ${building.name}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.isDeleting.set(true);
        this.buildingService.delete(building.id).subscribe({
          next: () => {
            this.toastService.success('Building deleted successfully');
            this.loadBuildings();
            this.isDeleting.set(false);
          },
          error: (error) => {
            console.error('Error deleting building:', error);
            this.toastService.error('Failed to delete building');
            this.isDeleting.set(false);
          },
        });
      }
    });
  }

  onSelectionChange(selection: Set<string>): void {
    this.selectedRows.set(selection);
  }

  toggleSelect(id: string): void {
    const selected = new Set(this.selectedRows());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedRows.set(selected);
  }

  isSelected(id: string): boolean {
    return this.selectedRows().has(id);
  }

  allSelected = computed(() => {
    const buildings = this.filteredBuildings();
    return buildings.length > 0 && buildings.every((building) => this.isSelected(building.id));
  });

  readonly hasSelectedItems = computed(() => {
    return this.selectedRows().size > 0;
  });

  readonly selectedBuildings = computed(() => {
    const selectedIds = this.selectedRows();
    return this.filteredBuildings().filter(building => selectedIds.has(building.id));
  });

  readonly selectedCount = computed(() => {
    return this.selectedRows().size;
  });

  readonly hasSelectedBuildings = computed(() => {
    return this.selectedRows().size > 0;
  });

  toggleSelectAll(): void {
    const buildings = this.filteredBuildings();
    const allSelected = this.allSelected();
    const selected = new Set<string>();
    if (!allSelected) {
      buildings.forEach((building) => selected.add(building.id));
    }
    this.selectedRows.set(selected);
  }

  savePreferences(): void {
    const route = this.route.snapshot.routeConfig?.path || 'building';
    this.preferencesService.setPreferences(route, {
      pageSize: this.pageSize(),
      viewType: this.viewMode(),
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getInitials(building: Building): string {
    if (!building.name) return '??';
    const parts = building.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return building.name.substring(0, 2).toUpperCase();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Properties sheet state
  private propertiesSheetRef: ZardSheetRef | null = null;
  readonly buildingProperties = signal<Property[]>([]);
  readonly isLoadingProperties = signal(false);
  readonly selectedBuildingId = signal<string | null>(null);
  readonly detachingPropertyId = signal<string | null>(null);

  onViewProperties(building: Building): void {
    // Close any existing sheet before opening a new one
    if (this.propertiesSheetRef) {
      this.propertiesSheetRef.close();
      this.propertiesSheetRef = null;
    }

    this.selectedBuildingId.set(building.id);
    this.loadBuildingProperties(building.id);

    this.propertiesSheetRef = this.sheetService.create({
      zContent: this.propertiesSheetTemplate(),
      zSide: 'right',
      zSize: 'lg',
      zTitle: `Properties - ${building.name}`,
      zClosable: true,
      zMaskClosable: true,
      zHideFooter: true,
      zViewContainerRef: this.viewContainerRef,
      zOnCancel: () => {
        this.propertiesSheetRef = null;
        this.selectedBuildingId.set(null);
        this.buildingProperties.set([]);
        this.isLoadingProperties.set(false);
      },
    });
  }

  private loadBuildingProperties(buildingId: string): void {
    this.isLoadingProperties.set(true);

    const request: PropertyListRequest = {
      currentPage: 1,
      pageSize: 100,
      ignore: false,
      buildingId: buildingId,
      isArchived: false,
    };

    this.propertyService.list(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.buildingProperties.set(response.result);
          this.isLoadingProperties.set(false);
        },
        error: (error) => {
          console.error('Error loading building properties:', error);
          this.toastService.error('Failed to load properties');
          this.isLoadingProperties.set(false);
        },
      });
  }

  showArchiveConfirmation(): void {
    const selectedCount = this.selectedCount();
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Archive Buildings',
      zDescription: `Are you sure you want to archive ${selectedCount} building${selectedCount > 1 ? 's' : ''}?`,
      zOkText: 'Archive',
      zCancelText: 'Cancel',
      zOkDestructive: false,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.archiveSelectedBuildings();
      }
    });
  }

  showUnarchiveConfirmation(): void {
    const selectedCount = this.selectedCount();
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Unarchive Buildings',
      zDescription: `Are you sure you want to unarchive ${selectedCount} building${selectedCount > 1 ? 's' : ''}?`,
      zOkText: 'Unarchive',
      zCancelText: 'Cancel',
      zOkDestructive: false,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.unarchiveSelectedBuildings();
      }
    });
  }

  archiveSelectedBuildings(): void {
    const selectedIds = Array.from(this.selectedRows());
    if (selectedIds.length === 0) return;

    this.isDeleting.set(true);
    
    // Archive each selected building via API
    const archivePromises = selectedIds.map(id => 
      this.buildingService.updateArchiveStatus(id, true).pipe(takeUntil(this.destroy$)).toPromise()
    );

    Promise.all(archivePromises).then(() => {
      // Reload buildings to get updated list from server
      this.loadBuildings();
      this.selectedRows.set(new Set());
      this.isDeleting.set(false);
      this.toastService.success(`Successfully archived ${selectedIds.length} building${selectedIds.length > 1 ? 's' : ''}`);
    }).catch((error) => {
      console.error('Error archiving buildings:', error);
      this.toastService.error('Failed to archive buildings');
      this.isDeleting.set(false);
    });
  }

  unarchiveSelectedBuildings(): void {
    const selectedIds = Array.from(this.selectedRows());
    if (selectedIds.length === 0) return;

    this.isDeleting.set(true);
    
    // Unarchive each selected building via API
    const unarchivePromises = selectedIds.map(id => 
      this.buildingService.updateArchiveStatus(id, false).pipe(takeUntil(this.destroy$)).toPromise()
    );

    Promise.all(unarchivePromises).then(() => {
      // Reload buildings to get updated list from server
      this.loadBuildings();
      this.selectedRows.set(new Set());
      this.isDeleting.set(false);
      this.toastService.success(`Successfully unarchived ${selectedIds.length} building${selectedIds.length > 1 ? 's' : ''}`);
    }).catch((error) => {
      console.error('Error unarchiving buildings:', error);
      this.toastService.error('Failed to unarchive buildings');
      this.isDeleting.set(false);
    });
  }

  onDetachProperty(property: Property): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Detach Property',
      zDescription: `Are you sure you want to detach "${property.name || property.identifier}" from this building?`,
      zOkText: 'Detach',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.detachingPropertyId.set(property.id);
        
        this.propertyService.updatePropertyBuilding(property.id, null)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastService.success(`Property "${property.name || property.identifier}" detached successfully`);
              // Remove from building properties list
              this.buildingProperties.update(properties => 
                properties.filter(p => p.id !== property.id)
              );
              this.detachingPropertyId.set(null);
            },
            error: (error) => {
              console.error('Error detaching property:', error);
              this.toastService.error('Failed to detach property');
              this.detachingPropertyId.set(null);
            },
          });
      }
    });
  }
}

