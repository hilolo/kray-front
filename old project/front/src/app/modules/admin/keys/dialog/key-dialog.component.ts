import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { KeysService } from '../keys.service';
import { Key, CreateKeyDto, UpdateKeyDto, KeyDialogMode } from '../keys.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { PropertyService } from '../../property/property.service';
import { Property } from '../../property/property.types';

@Component({
    selector: 'key-dialog',
    templateUrl: './key-dialog.component.html',
    styleUrls: ['./key-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatProgressSpinnerModule
    ]
})
export class KeyDialogComponent implements OnInit {
    keyForm: FormGroup;
    mode: KeyDialogMode;
    key: Key;
    isLoading: boolean = false;
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    loadingProperties: boolean = false;
    propertySearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    selectedPropertyId: string = '';
    isEditingProperty: boolean = false;
    formFieldHelpers: string[] = [''];

    KeyDialogMode = KeyDialogMode;

    constructor(
        public dialogRef: MatDialogRef<KeyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: KeyDialogMode; key?: Key },
        private _formBuilder: FormBuilder,
        private _keysService: KeysService,
        private _propertyService: PropertyService,
        private _errorHandlerService: ErrorHandlerService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
        this.mode = data.mode;
        this.key = data.key;
    }

    ngOnInit(): void {
        // Initialize form
        this.keyForm = this._formBuilder.group({
            name: [
                { value: this.key?.name || '', disabled: this.mode === KeyDialogMode.VIEW },
                [Validators.required, Validators.maxLength(200)]
            ],
            description: [
                { value: this.key?.description || '', disabled: this.mode === KeyDialogMode.VIEW },
                [Validators.maxLength(1000)]
            ],
            propertyId: [
                { value: this.key?.propertyId || '', disabled: this.mode === KeyDialogMode.VIEW },
                [Validators.required]
            ]
        });

        // Load properties if not in view mode
        if (this.mode !== KeyDialogMode.VIEW) {
            // Set selected property if in edit mode (before loading to avoid errors)
            if (this.mode === KeyDialogMode.EDIT && this.key?.propertyId) {
                this.selectedPropertyId = this.key.propertyId;
            }
            
            // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
                this.loadProperties();
            });
        }
    }

    /**
     * Load all properties for selection
     */
    loadProperties(): void {
        this.loadingProperties = true;
        this._changeDetectorRef.detectChanges();
        
        this._propertyService.getProperties({
            currentPage: 1,
            pageSize: 1000,
            searchQuery: '',
            ignore: true // Get all properties
        }).subscribe({
            next: (result) => {
                this.properties = result.result || [];
                this.filteredProperties = [...this.properties];
                this.loadingProperties = false;
                this._changeDetectorRef.detectChanges();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load properties');
                console.error('Error loading properties:', error);
                this.loadingProperties = false;
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * Filter properties based on search term
     */
    filterProperties(searchTerm: string): void {
        if (!searchTerm || searchTerm.trim() === '') {
            this.filteredProperties = [...this.properties];
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        this.filteredProperties = this.properties.filter(property => {
            const matchesIdentifier = property.identifier?.toLowerCase().includes(term);
            const matchesName = property.name?.toLowerCase().includes(term);
            const matchesAddress = property.address?.toLowerCase().includes(term);
            const matchesOwner = property.ownerName?.toLowerCase().includes(term);
            
            return matchesIdentifier || matchesName || matchesAddress || matchesOwner;
        });
    }

    /**
     * Handle property input
     */
    onPropertyInput(event: any): void {
        this.propertySearchTerm = event.target.value;
        this.isEditingProperty = true;
        this.showPropertyDropdown = true;
        this.filterProperties(this.propertySearchTerm);
    }

    /**
     * Handle property focus
     */
    onPropertyFocus(): void {
        this.isEditingProperty = true;
        this.showPropertyDropdown = true;
        this.propertySearchTerm = '';
        this.filterProperties(this.propertySearchTerm);
    }

    /**
     * Handle property blur
     */
    onPropertyBlur(): void {
        setTimeout(() => {
            this.showPropertyDropdown = false;
            this.isEditingProperty = false;
            if (!this.selectedPropertyId) {
                this.propertySearchTerm = '';
            }
        }, 200);
    }

    /**
     * Select property
     */
    selectProperty(propertyId: string): void {
        this.selectedPropertyId = propertyId;
        this.keyForm.patchValue({ propertyId: propertyId });
        this.showPropertyDropdown = false;
        this.isEditingProperty = false;
        this.propertySearchTerm = '';
    }

    /**
     * Clear property selection
     */
    clearPropertySelection(): void {
        this.selectedPropertyId = '';
        this.keyForm.patchValue({ propertyId: '' });
        this.propertySearchTerm = '';
        this.filterProperties('');
    }

    /**
     * Get selected property display text
     */
    getSelectedPropertyDisplay(): string {
        if (!this.selectedPropertyId) {
            return '';
        }
        const property = this.properties.find(p => p.id === this.selectedPropertyId);
        return property ? `${property.identifier} - ${property.name}` : '';
    }

    /**
     * Get dialog title
     */
    getTitle(): string {
        switch (this.mode) {
            case KeyDialogMode.ADD:
                return 'Add New Key';
            case KeyDialogMode.EDIT:
                return 'Edit Key';
            case KeyDialogMode.VIEW:
                return 'Key Details';
            default:
                return 'Key';
        }
    }

    /**
     * Get property name by ID
     */
    getPropertyName(propertyId: string): string {
        const property = this.properties.find(p => p.id === propertyId);
        return property ? `${property.identifier} - ${property.name}` : propertyId;
    }

    /**
     * Save key
     */
    save(): void {
        if (this.keyForm.invalid) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please fill in all required fields');
            return;
        }

        this.isLoading = true;
        const formValue = this.keyForm.value;

        if (this.mode === KeyDialogMode.ADD) {
            const createDto: CreateKeyDto = {
                name: formValue.name,
                description: formValue.description,
                propertyId: formValue.propertyId
            };

            this._keysService.createKey(createDto).subscribe({
                next: (result) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Key created successfully');
                    this.isLoading = false;
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to create key');
                    console.error('Error creating key:', error);
                    this.isLoading = false;
                }
            });
        } else if (this.mode === KeyDialogMode.EDIT) {
            const updateDto: UpdateKeyDto = {
                id: this.key.id,
                name: formValue.name,
                description: formValue.description,
                propertyId: formValue.propertyId
            };

            this._keysService.updateKey(this.key.id, updateDto).subscribe({
                next: (result) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Key updated successfully');
                    this.isLoading = false;
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to update key');
                    console.error('Error updating key:', error);
                    this.isLoading = false;
                }
            });
        }
    }

    /**
     * Close dialog
     */
    close(): void {
        this.dialogRef.close();
    }
}

