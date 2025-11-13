import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BuildingService } from '../building.service';
import { PropertyService } from '../../property/property.service';
import { Building } from '../building.types';
import { Property } from '../../property/property.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PricePaymentTypePipe } from '@fuse/pipes/price-payment-type/price-payment-type.pipe';
import { PropertyDetailsComponent } from '../../property/details/details.component';

@Component({
    selector: 'building-full-detail',
    templateUrl: './full-detail.component.html',
    styleUrls: ['./full-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule,
        RouterModule,
        PricePaymentTypePipe
    ]
})
export class BuildingFullDetailComponent implements OnInit, OnDestroy {
    building: Building;
    isLoading: boolean = false;
    buildingId: string;
    
    // Properties in this building
    buildingProperties: Property[] = [];
    loadingProperties: boolean = false;
    
    // Track expanded properties
    expandedProperties: Set<string> = new Set<string>();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _buildingService: BuildingService,
        private _propertyService: PropertyService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _errorHandlerService: ErrorHandlerService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _dialog: MatDialog
    ) {}

    ngOnInit(): void {
        // Get building ID from route
        this._route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
            if (params['id']) {
                this.buildingId = params['id'];
                this.loadBuilding(this.buildingId);
            }
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Load building data
     */
    loadBuilding(id: string): void {
        this.isLoading = true;
        
        this._buildingService.getBuildingById(id).subscribe({
            next: (building) => {
                this.building = building;
                this.buildingProperties = building.properties || [];
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load building');
                console.error('Error loading building:', error);
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Open property detail in dialog
     */
    viewPropertyDetail(propertyId: string): void {
        const dialogRef = this._dialog.open(PropertyDetailsComponent, {
            width: '95vw',
            maxWidth: '1400px',
            height: '90vh',
            maxHeight: '90vh',
            panelClass: 'property-detail-dialog',
            data: { propertyId: propertyId },
            disableClose: false
        });

        dialogRef.afterClosed().subscribe(result => {
            // Optionally reload building if needed
            if (result === 'updated') {
                this.loadBuilding(this.buildingId);
            }
        });
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
     * Toggle property details expansion
     */
    togglePropertyDetails(propertyId: string, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        
        if (this.expandedProperties.has(propertyId)) {
            this.expandedProperties.delete(propertyId);
        } else {
            this.expandedProperties.add(propertyId);
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if property is expanded
     */
    isPropertyExpanded(propertyId: string): boolean {
        return this.expandedProperties.has(propertyId);
    }

    /**
     * Remove property from building
     */
    removePropertyFromBuilding(property: Property, event: Event): void {
        event.stopPropagation();

        // Show confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Remove Property from Building',
            message: `Are you sure you want to remove "${property.name}" from this building? The property will not be deleted, just unassigned from this building.`,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn'
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Remove',
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
                this._removePropertyFromBuilding(property);
            }
        });
    }

    /**
     * Actually remove the property from building
     */
    private _removePropertyFromBuilding(property: Property): void {
        this._propertyService.updatePropertyBuilding(property.id, null).subscribe({
            next: () => {
                this._errorHandlerService.showSuccessAlert('Success', `Property "${property.name}" has been removed from this building`);
                // Reload the building to refresh properties list
                this.loadBuilding(this.buildingId);
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to remove property from building');
                console.error('Error removing property from building:', error);
            }
        });
    }
}

