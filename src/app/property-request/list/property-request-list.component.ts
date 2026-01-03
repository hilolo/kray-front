import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ContactType } from '@shared/models/contact/contact.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { PropertyRequestService } from '@shared/services/property-request.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import type { PropertyRequest } from '@shared/models/property-request/property-request.model';
import type { PropertyRequestListRequest } from '@shared/models/property-request/property-request.model';
import { PropertyCategory } from '@shared/models/property/property.model';
import { EditPropertyRequestComponent } from '../edit/edit-property-request.component';

@Component({
  selector: 'app-property-request-list',
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
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-request-list.component.html',
})
export class PropertyRequestListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly router = inject(Router);
  private readonly propertyRequestService = inject(PropertyRequestService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal('');
  readonly searchInput = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10);
  readonly propertyRequests = signal<PropertyRequest[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly collaborationFilter = signal<boolean | undefined>(undefined);
  readonly selectedCategory = signal<PropertyCategory | null>(null);
  readonly categoryOptions = signal<ZardComboboxOption[]>([]);
  readonly categoryComboboxRef = viewChild<ZardComboboxComponent>('categoryCombobox');
  
  readonly clientNameCell = viewChild<TemplateRef<any>>('clientNameCell');
  readonly categoryCell = viewChild<TemplateRef<any>>('categoryCell');
  readonly budgetCell = viewChild<TemplateRef<any>>('budgetCell');
  readonly piecesCell = viewChild<TemplateRef<any>>('piecesCell');
  readonly isFurnishedCell = viewChild<TemplateRef<any>>('isFurnishedCell');
  readonly collaborationCell = viewChild<TemplateRef<any>>('collaborationCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  readonly columns = computed<DatatableColumn<PropertyRequest>[]>(() => [
    {
      key: 'client',
      label: this.translateService.instant('propertyRequest.list.columns.client'),
      cellTemplate: this.clientNameCell(),
    },
    {
      key: 'category',
      label: this.translateService.instant('propertyRequest.list.columns.category'),
      cellTemplate: this.categoryCell(),
    },
    {
      key: 'budget',
      label: this.translateService.instant('propertyRequest.list.columns.budget'),
      sortable: true,
      cellTemplate: this.budgetCell(),
    },
    {
      key: 'pieces',
      label: this.translateService.instant('propertyRequest.list.columns.pieces'),
      sortable: true,
      cellTemplate: this.piecesCell(),
    },
    {
      key: 'isFurnished',
      label: this.translateService.instant('propertyRequest.list.columns.isFurnished'),
      width: '100px',
      cellTemplate: this.isFurnishedCell(),
    },
    {
      key: 'collaboration',
      label: '',
      width: '80px',
      cellTemplate: this.collaborationCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '80px',
      cellTemplate: this.actionsCell(),
    },
  ]);

  readonly emptyMessage = computed(() => {
    if (this.isLoading()) {
      return this.translateService.instant('common.loading');
    }
    if (this.searchQuery()) {
      return this.translateService.instant('propertyRequest.list.noResults');
    }
    return this.translateService.instant('propertyRequest.list.empty');
  });

  readonly showResetButton = computed(() => {
    return this.searchQuery() !== '' || this.collaborationFilter() !== undefined || this.selectedCategory() !== null;
  });

  ngOnInit(): void {
    const routeKey = this.getRouteKey();
    const savedPageSize = this.preferencesService.getPageSize(routeKey);
    if (savedPageSize) {
      this.pageSize.set(savedPageSize);
    }

    this.loadCategories();
    this.setupSearchDebounce();
    this.loadPropertyRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getRouteKey(): string {
    return 'property-request/list';
  }

  private setupSearchDebounce(): void {
    this.searchInputSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
          this.performSearch(searchTerm);
        }
      });
  }

  loadPropertyRequests(): void {
    this.isLoading.set(true);
    const request: PropertyRequestListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      ...(this.searchQuery() && this.searchQuery().trim() ? { searchQuery: this.searchQuery().trim() } : {}),
      ...(this.collaborationFilter() !== undefined ? { isCollaborate: this.collaborationFilter() } : {}),
      ...(this.selectedCategory() !== null ? { category: this.selectedCategory()! } : {}),
    };
    
    this.propertyRequestService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.propertyRequests.set(response.result);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
        this.selectedRows.set(new Set());
      },
      error: () => {
        this.isLoading.set(false);
        this.selectedRows.set(new Set());
      },
    });
  }

  onResetFilters(): void {
    this.searchInput.set('');
    this.searchQuery.set('');
    this.collaborationFilter.set(undefined);
    this.selectedCategory.set(null);
    this.currentPage.set(1);
    // Clear combobox internal value
    setTimeout(() => {
      const categoryCombobox = this.categoryComboboxRef();
      if (categoryCombobox) {
        (categoryCombobox as any).writeValue(null);
      }
    }, 0);
    this.loadPropertyRequests();
  }

  onCollaborationFilterChange(value: boolean | undefined): void {
    this.collaborationFilter.set(value);
    this.currentPage.set(1);
    this.loadPropertyRequests();
  }

  onCollaborationClick(propertyRequest: PropertyRequest, event: Event): void {
    event.stopPropagation();
    const requestName = propertyRequest.client || this.translateService.instant('common.unnamed');
    const isCurrentlyCollaborate = propertyRequest.isCollaborate;
    
    const dialogRef = this.alertDialogService.confirm({
      zTitle: isCurrentlyCollaborate 
        ? this.translateService.instant('propertyRequest.collaboration.confirm.disable.title')
        : this.translateService.instant('propertyRequest.collaboration.confirm.enable.title'),
      zDescription: isCurrentlyCollaborate
        ? this.translateService.instant('propertyRequest.collaboration.confirm.disable.description', { name: requestName })
        : this.translateService.instant('propertyRequest.collaboration.confirm.enable.description', { name: requestName }),
      zOkText: isCurrentlyCollaborate 
        ? this.translateService.instant('propertyRequest.collaboration.confirm.disable.ok')
        : this.translateService.instant('propertyRequest.collaboration.confirm.enable.ok'),
      zCancelText: this.translateService.instant('common.cancel'),
      zOkDestructive: isCurrentlyCollaborate, // Destructive if disabling
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.isLoading.set(true); // Show loading indicator
        this.propertyRequestService.updateCollaborationStatus(propertyRequest.id, !isCurrentlyCollaborate).pipe(takeUntil(this.destroy$)).subscribe({
          next: (updatedPropertyRequest) => {
            // Update the property request in the list
            const propertyRequests = this.propertyRequests();
            const index = propertyRequests.findIndex(pr => pr.id === propertyRequest.id);
            if (index !== -1) {
              propertyRequests[index] = updatedPropertyRequest;
              this.propertyRequests.set([...propertyRequests]);
            }
            this.isLoading.set(false);
            // Success notification is handled by ApiService
          },
          error: (error) => {
            console.error('Error updating collaboration status:', error);
            this.isLoading.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
      }
    });
  }

  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    this.searchInputSubject.next(value);
  }

  private performSearch(searchTerm: string): void {
    const currentSearchQuery = this.searchQuery();
    if (searchTerm !== currentSearchQuery) {
      this.searchQuery.set(searchTerm);
      this.currentPage.set(1);
      this.loadPropertyRequests();
    }
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const searchTerm = this.searchInput().trim();
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.performSearch(searchTerm);
      }
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPropertyRequests();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    const routeKey = this.getRouteKey();
    this.preferencesService.setPageSize(routeKey, size);
    this.currentPage.set(1);
    this.loadPropertyRequests();
  }

  onViewPropertyRequest(propertyRequest: PropertyRequest): void {
    const dialogRef = this.dialogService.create({
      zContent: EditPropertyRequestComponent,
      zTitle: this.translateService.instant('propertyRequest.edit.viewTitle'),
      zWidth: '1200px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: { propertyRequestId: propertyRequest.id, viewMode: true },
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      // No need to reload on view close
    });
  }

  onEditPropertyRequest(propertyRequest: PropertyRequest): void {
    const dialogRef = this.dialogService.create({
      zContent: EditPropertyRequestComponent,
      zTitle: this.translateService.instant('propertyRequest.edit.editTitle'),
      zWidth: '1200px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: { propertyRequestId: propertyRequest.id },
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.loadPropertyRequests();
      }
    });
  }

  onAddPropertyRequest(): void {
    const dialogRef = this.dialogService.create({
      zContent: EditPropertyRequestComponent,
      zTitle: this.translateService.instant('propertyRequest.edit.addTitle'),
      zWidth: '1200px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: {},
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.loadPropertyRequests();
      }
    });
  }

  onDeletePropertyRequest(propertyRequest: PropertyRequest): void {
    const clientName = propertyRequest.client || 'this property request';
    const dialogRef = this.alertDialogService.confirm({
      zTitle: this.translateService.instant('propertyRequest.list.deleteTitle'),
      zDescription: this.translateService.instant('propertyRequest.list.deleteMessage', { name: clientName }),
      zOkText: this.translateService.instant('common.delete'),
      zCancelText: this.translateService.instant('common.cancel'),
      zOkDestructive: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.isDeleting.set(true);
        this.propertyRequestService.delete(propertyRequest.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.loadPropertyRequests();
            this.isDeleting.set(false);
          },
          error: () => {
            this.isDeleting.set(false);
          },
        });
      }
    });
  }

  getCategoryLabel(category: PropertyCategory): string {
    switch (category) {
      case PropertyCategory.Location:
        return this.translateService.instant('property.categories.location');
      case PropertyCategory.Vente:
        return this.translateService.instant('property.categories.vente');
      case PropertyCategory.LocationVacances:
        return this.translateService.instant('property.categories.locationVacances');
      default:
        return '';
    }
  }

  loadCategories(): void {
    const options: ZardComboboxOption[] = [
      { value: PropertyCategory.Location.toString(), label: this.translateService.instant('property.categories.location') },
      { value: PropertyCategory.Vente.toString(), label: this.translateService.instant('property.categories.vente') },
      { value: PropertyCategory.LocationVacances.toString(), label: this.translateService.instant('property.categories.locationVacances') },
    ];
    this.categoryOptions.set(options);
  }

  onCategoryChange(categoryId: string | null): void {
    const category = categoryId !== null ? +categoryId as PropertyCategory : null;
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.loadPropertyRequests();
  }
}

