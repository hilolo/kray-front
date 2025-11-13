import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../property/property.service';
import { Property, GetPropertiesFilter } from '../../property/property.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

@Component({
    selector: 'app-attach-property-dialog',
    templateUrl: './attach-property-dialog.component.html',
    styleUrls: ['./attach-property-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FormsModule
    ]
})
export class AttachPropertyDialogComponent implements OnInit {
    searchTerm: string = '';
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    selectedProperty: Property | null = null;
    isLoading: boolean = false;
    isAttaching: boolean = false;
    formFieldHelpers: string[] = [''];

    constructor(
        public dialogRef: MatDialogRef<AttachPropertyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { buildingId: string },
        private _propertyService: PropertyService,
        private _errorHandlerService: ErrorHandlerService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Defer loading to next cycle to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
            this.loadUnassignedProperties();
        }, 0);
    }

    /**
     * Load properties that don't have a buildingId
     */
    loadUnassignedProperties(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        
        // Create filter to get properties without buildingId
        const filter: GetPropertiesFilter = {
            currentPage: 1,
            pageSize: 1000,
            ignore: false,
            unattachedOnly: true // Filter for properties without a building
        };
        
        this._propertyService.getProperties(filter).subscribe({
            next: (response) => {
                // Filter properties that don't have a buildingId (double-check client-side)
                this.properties = response.result.filter(p => !p.buildingId);
                this.filteredProperties = [...this.properties];
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: (error) => {
                this.isLoading = false;
                this._errorHandlerService.showErrorAlert(
                    'Error Loading Properties',
                    'Failed to load available properties. Please try again.'
                );
                this._cdr.markForCheck();
            }
        });
    }

    /**
     * Filter properties based on search term
     */
    filterProperties(): void {
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.filteredProperties = [...this.properties];
        } else {
            const searchLower = this.searchTerm.toLowerCase().trim();
            this.filteredProperties = this.properties.filter(property => {
                const name = (property.name || '').toLowerCase();
                const identifier = (property.identifier || '').toLowerCase();
                const address = (property.address || '').toLowerCase();
                
                return name.includes(searchLower) || 
                       identifier.includes(searchLower) || 
                       address.includes(searchLower);
            });
        }
        this._cdr.markForCheck();
    }

    /**
     * Select a property to view details
     */
    selectProperty(property: Property): void {
        this.selectedProperty = property;
        this._cdr.markForCheck();
    }

    /**
     * Clear selected property
     */
    clearSelection(): void {
        this.selectedProperty = null;
        this._cdr.markForCheck();
    }

    /**
     * Attach the selected property to the building
     */
    attachProperty(): void {
        if (!this.selectedProperty || !this.data.buildingId) {
            return;
        }

        this.isAttaching = true;
        
        // Use the dedicated update-building endpoint (lightweight operation - doesn't affect images)
        this._propertyService.updatePropertyBuilding(this.selectedProperty.id, this.data.buildingId).subscribe({
            next: (updatedProperty) => {
                this.isAttaching = false;
                this._errorHandlerService.showSuccessAlert(
                    'Property Attached',
                    `Property "${updatedProperty.name || updatedProperty.identifier}" has been successfully attached to this building.`
                );
                // Close dialog and return the updated property
                this.dialogRef.close(updatedProperty);
            },
            error: (error) => {
                this.isAttaching = false;
                this._errorHandlerService.showErrorAlert(
                    'Failed to Attach Property',
                    error?.error?.message || 'An error occurred while attaching the property. Please try again.'
                );
                this._cdr.markForCheck();
            }
        });
    }

    /**
     * Close the dialog
     */
    close(): void {
        this.dialogRef.close();
    }

    /**
     * Get property type display name
     */
    getPropertyType(property: Property): string {
        return property.typeProperty || 'Non défini';
    }

    /**
     * Get property category display name
     */
    getPropertyCategory(property: Property): string {
        const category = property.category;
        
        // Handle string values from backend
        if (typeof category === 'string') {
            const lowerCategory = category.toLowerCase();
            if (lowerCategory === 'location') return 'Location';
            if (lowerCategory === 'vente') return 'Vente';
            if (lowerCategory === 'locationvacances') return 'Location vacances';
            // If it's an unknown string, return it as-is
            return category;
        }
        
        // Handle numeric enum values
        if (typeof category === 'number') {
            switch(category) {
                case 0: return 'Location';
                case 1: return 'Vente';
                case 2: return 'Location Vacances';
                default: return 'Non défini';
            }
        }
        
        // If category is null or undefined
        return 'Non défini';
    }

    /**
     * Get payment type display name
     */
    getPaymentType(property: Property): string {
        const typePaiment = property.typePaiment;
        
        // Handle string values from backend
        if (typeof typePaiment === 'string') {
            const lowerType = typePaiment.toLowerCase();
            if (lowerType === 'monthly') return 'Mensuel';
            if (lowerType === 'daily') return 'Journalier';
            if (lowerType === 'weekly') return 'Hebdomadaire';
            if (lowerType === 'fixed') return 'Fixe';
            // If it's an unknown string, return it as-is
            return typePaiment;
        }
        
        // Handle numeric enum values
        if (typeof typePaiment === 'number') {
            switch(typePaiment) {
                case 0: return 'Mensuel';
                case 1: return 'Journalier';
                case 2: return 'Hebdomadaire';
                case 3: return 'Fixe';
                default: return 'Non défini';
            }
        }
        
        // If typePaiment is null or undefined
        return 'Non défini';
    }

    /**
     * Format price with payment type
     */
    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD'
        }).format(price || 0);
    }

    /**
     * Format price with payment type
     */
    formatPriceWithType(property: Property): string {
        const formattedPrice = this.formatPrice(property.price);
        const paymentType = this.getPaymentType(property);
        return `${formattedPrice} / ${paymentType}`;
    }
}

