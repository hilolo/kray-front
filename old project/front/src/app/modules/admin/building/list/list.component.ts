import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BuildingService } from '../building.service';
import { Building, GetBuildingsFilter } from '../building.types';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { PropertyService } from '../../property/property.service';
import { Property } from '../../property/property.types';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';
import { PermissionService } from 'app/core/auth/permission.service';
import { PricePaymentTypePipe } from '@fuse/pipes/price-payment-type/price-payment-type.pipe';

@Component({
    selector: 'building-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        NgIf,
        NgFor,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        RouterLink,
        MatTooltipModule,
        MatPaginatorModule,
        MatSidenavModule,
        NoDataComponent,
        PricePaymentTypePipe
    ],
})
export class BuildingListComponent implements OnInit, OnDestroy {
    buildings$: Observable<Building[]>;
    buildingsCount: number = 0;
    selectedBuilding: Building;
    
    // Pagination
    pagination: { currentPage: number, totalPages: number, totalItems: number } = { currentPage: 1, totalPages: 1, totalItems: 0 };
    pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    pageSizeOptions: number[] = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;
    
    // Search
    searchControl: FormControl = new FormControl('');
    
    // Properties drawer
    drawerOpened: boolean = false;
    selectedBuildingForProperties: Building | null = null;
    selectedBuildingProperties: Property[] = [];
    loadingDrawerProperties: boolean = false;
    
    // Permissions
    canViewBuildings: boolean = false;
    canEditBuildings: boolean = false;
    canDeleteBuildings: boolean = false;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _buildingService: BuildingService,
        private _propertyService: PropertyService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _errorHandlerService: ErrorHandlerService,
        private _permissionService: PermissionService
    ) {}

    ngOnInit(): void {
        // Check permissions
        this.canViewBuildings = this._permissionService.canView('buildings');
        this.canEditBuildings = this._permissionService.canEdit('buildings');
        this.canDeleteBuildings = this._permissionService.canDelete('buildings');
        
        // If user doesn't have view permission, show error and don't load data
        if (!this.canViewBuildings) {
            this._errorHandlerService.showErrorAlert(
                'Permission Denied',
                'You do not have permission to view buildings. Please contact your administrator.'
            );
            return;
        }
        
        // Get buildings
        this.buildings$ = this._buildingService.buildings$;

        // Subscribe to buildings count
        this._buildingService.buildings$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((buildings: Building[]) => {
                this.buildingsCount = buildings.length;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to pagination changes
        this._buildingService.pagination$
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
                this.loadBuildings();
            });

        // Load initial data
        this.loadBuildings();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Load buildings
     */
    loadBuildings(): void {
        const filter: GetBuildingsFilter = {
            currentPage: this.pagination.currentPage,
            pageSize: this.pageSize,
            searchQuery: this.searchControl.value || '',
            ignore: false
        };

        this._buildingService.getBuildings(filter).subscribe({
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load buildings');
                console.error('Error loading buildings:', error);
            }
        });
    }

    /**
     * Open properties drawer for a building
     */
    openPropertiesDrawer(building: Building): void {
        this.selectedBuildingForProperties = building;
        this.drawerOpened = true;
        this.loadBuildingProperties(building.id);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close properties drawer
     */
    closePropertiesDrawer(): void {
        this.drawerOpened = false;
        this.selectedBuildingForProperties = null;
        this.selectedBuildingProperties = [];
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Load properties for a specific building
     */
    loadBuildingProperties(buildingId: string): void {
        this.loadingDrawerProperties = true;
        this.selectedBuildingProperties = [];
        this._changeDetectorRef.markForCheck();

        this._propertyService.getProperties({
            currentPage: 1,
            pageSize: 100,
            searchQuery: '',
            ignore: false,
            buildingId: buildingId
        }).subscribe({
            next: (response) => {
                this.selectedBuildingProperties = response.result || [];
                this.loadingDrawerProperties = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load building properties');
                console.error('Error loading building properties:', error);
                this.loadingDrawerProperties = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Page change event
     */
    onPageChange(event: any): void {
        this.pagination.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadBuildings();
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
     * Navigate to add building
     */
    addBuilding(): void {
        // Navigation will be handled by routerLink in template
    }

    /**
     * Navigate to building detail
     */
    viewBuildingDetail(buildingId: string): void {
        // Navigation will be handled by routerLink in template
    }

    /**
     * Navigate to property detail
     */
    viewPropertyDetail(propertyId: string): void {
        // Navigation will be handled by routerLink in template
    }

    /**
     * Handle image error
     */
    onImageError(event: any, building: Building): void {
        // Clear the image URL so the icon will be displayed instead
        building.defaultAttachmentUrl = null;
        this._changeDetectorRef.markForCheck();
    }
}

