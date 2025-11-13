import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BuildingService } from '../building.service';
import { PropertyService } from '../../property/property.service';
import { Building, CreateBuildingDto, UpdateBuildingDto, BuildingImageInput } from '../building.types';
import { Property, GetPropertiesFilter } from '../../property/property.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { AttachPropertyDialogComponent } from './attach-property-dialog.component';
import { PermissionService } from 'app/core/auth/permission.service';
import { PricePaymentTypePipe } from '@fuse/pipes/price-payment-type/price-payment-type.pipe';
import { PropertyDetailsComponent } from '../../property/details/details.component';

@Component({
    selector: 'building-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatDialogModule,
        MatTooltipModule,
        RouterModule,
        PricePaymentTypePipe
    ]
})
export class BuildingDetailComponent implements OnInit, OnDestroy {
    @ViewChild('fileInput') fileInput: ElementRef;
    
    buildingForm: FormGroup;
    building: Building;
    isEditMode: boolean = false;
    editingMode: boolean = false;
    isLoading: boolean = false;
    buildingId: string;
    
    // Properties in this building
    buildingProperties: Property[] = [];
    loadingProperties: boolean = false;
    
    // Track expanded properties
    expandedProperties: Set<string> = new Set<string>();

    // Cities
    cities: string[] = [];

    // Image upload
    selectedImage: File | null = null;
    imagePreview: string | null = null;
    currentImageUrl: string | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _buildingService: BuildingService,
        private _propertyService: PropertyService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _errorHandlerService: ErrorHandlerService,
        private _dialog: MatDialog,
        private _authService: AuthService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _permissionService: PermissionService
    ) {}

    ngOnInit(): void {
        // Initialize form
        this.buildingForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            address: ['', [Validators.required]],
            city: [''],
            year: [new Date().getFullYear()],
            description: [''],
            floor: [0]
        });

        // Load cities
        this.loadCities();
        this.setDefaultCity();

        // Check if we're in edit mode
        this._route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
            if (params['id'] && params['id'] !== 'add') {
                this.buildingId = params['id'];
                this.isEditMode = true;
                this.loadBuilding(this.buildingId);
            }

            // Disable form if user doesn't have edit permission
            if (!this.canEditBuildings()) {
                this.buildingForm.disable();
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
                this.buildingForm.patchValue({
                    name: building.name,
                    address: building.address,
                    city: building.city,
                    year: building.year,
                    description: building.description,
                    floor: building.floor
                });
                this.currentImageUrl = this.getImageUrl(building.defaultAttachmentUrl);
                
                // Set properties from building object (properties that belong to this building)
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
     * Load unattached properties (properties without a building)
     */
    loadUnattachedProperties(): void {
        this.loadingProperties = true;
        this._changeDetectorRef.markForCheck();
        
        const filter: GetPropertiesFilter = {
            currentPage: 1,
            pageSize: 1000,
            ignore: false,
            unattachedOnly: true // Only get properties without a building
        };
        
        this._propertyService.getProperties(filter).subscribe({
            next: (response) => {
                // Filter properties that don't have a buildingId (double-check client-side)
                this.buildingProperties = response.result.filter(p => !p.buildingId);
                this.loadingProperties = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                this.loadingProperties = false;
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load unattached properties');
                console.error('Error loading unattached properties:', error);
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Reload building properties after changes (e.g., after attaching/removing properties)
     */
    loadBuildingProperties(): void {
        if (!this.buildingId) return;
        
        // Reload the entire building to get updated properties that belong to this building
        this.loadBuilding(this.buildingId);
    }

    /**
     * Save building
     */
    async saveBuilding(): Promise<void> {
        if (this.buildingForm.invalid) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please fill in all required fields');
            return;
        }

        this.isLoading = true;
        const formValue = this.buildingForm.value;

        // Convert image to base64 if selected
        let imageInput: BuildingImageInput | undefined = undefined;
        if (this.selectedImage) {
            try {
                const base64 = await this.fileToBase64(this.selectedImage);
                imageInput = {
                    fileName: this.selectedImage.name,
                    base64Content: base64
                };
            } catch (error) {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to process image');
                this.isLoading = false;
                return;
            }
        }

        if (this.isEditMode) {
            // Update existing building
            const updateDto: UpdateBuildingDto = {
                id: this.buildingId,
                name: formValue.name,
                address: formValue.address,
                city: formValue.city,
                year: formValue.year,
                description: formValue.description,
                floor: formValue.floor,
                image: imageInput
            };

            this._buildingService.updateBuilding(this.buildingId, updateDto).subscribe({
                next: (response) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Building updated successfully');
                    this.isLoading = false;
                    this.editingMode = false;
                    // Reload the building to show updated data in view mode
                    this.loadBuilding(this.buildingId);
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to update building');
                    console.error('Error updating building:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
        } else {
            // Create new building
            const createDto: CreateBuildingDto = {
                name: formValue.name,
                address: formValue.address,
                city: formValue.city,
                year: formValue.year,
                description: formValue.description,
                floor: formValue.floor,
                image: imageInput
            };

            this._buildingService.createBuilding(createDto).subscribe({
                next: (response) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Building created successfully! You can now add properties.');
                    this.isLoading = false;
                    
                    // Extract the building ID from the response
                    const newBuildingId = response.data?.id || response.id;
                    
                    if (newBuildingId) {
                        // Switch to edit mode and navigate to the detail view with the new ID
                        this.isEditMode = true;
                        this.buildingId = newBuildingId;
                        
                        // Navigate to the edit route with the new building ID
                        this._router.navigate(['/building', newBuildingId, 'edit']).then(() => {
                            // Reload the building to show all details
                            this.loadBuilding(newBuildingId);
                        });
                    } else {
                        // Fallback to list if no ID
                        this._router.navigate(['/building']);
                    }
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to create building');
                    console.error('Error creating building:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
        }
    }

    /**
     * Enable edit mode
     */
    enableEditMode(): void {
        this.editingMode = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Cancel editing
     */
    cancelEdit(): void {
        if (this.isEditMode) {
            // If in edit mode, just exit editing mode and reload building
            this.editingMode = false;
            this.loadBuilding(this.buildingId);
        } else {
            // If adding new building, go back to list
            this._router.navigate(['/building']);
        }
    }

    /**
     * Cancel and go back
     */
    cancel(): void {
        this._router.navigate(['/building']);
    }

    /**
     * Navigate to add property for this building
     */
    addPropertyToBuilding(): void {
        if (this.buildingId) {
            this._router.navigate(['/property/add'], {
                queryParams: { buildingId: this.buildingId }
            });
        }
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
            // Optionally reload properties if needed
            if (result === 'updated') {
                this.loadBuildingProperties();
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
     * Load cities from settings
     */
    loadCities(): void {
        const settings = this._authService.getSettings();
        if (settings && settings.moroccanCities) {
            this.cities = settings.moroccanCities;
        } else {
            // Fallback to default Moroccan cities
            this.cities = [
                'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda',
                'Kénitra', 'Tétouan', 'Safi', 'Mohammedia', 'Khouribga', 'Beni Mellal', 'El Jadida',
                'Taza', 'Nador', 'Settat', 'Larache', 'Ksar El Kebir', 'Khemisset', 'Guelmim',
                'Berrechid', 'Ouarzazate', 'Fquih Ben Salah', 'Taourirt', 'Berkane', 'Sidi Slimane',
                'Errachidia', 'Sidi Kacem', 'Khenifra', 'Ifrane', 'Azrou', 'Midelt', 'Zagora',
                'Tinghir', 'Dakhla', 'Laâyoune', 'Smara', 'Boujdour', 'Essaouira', 'Chefchaouen',
                'Asilah', 'Lixus', 'Volubilis', 'Ifrane', 'Imouzzer', 'Aït Benhaddou'
            ];
        }
    }

    /**
     * Set default city from settings
     */
    setDefaultCity(): void {
        const settings = this._authService.getSettings();
        if (settings && settings.defaultCity && !this.isEditMode) {
            // Only set default city if not in edit mode (creating new building)
            this.buildingForm.patchValue({ city: settings.defaultCity });
        }
    }

    /**
     * Open add property dialog
     */
    openAddPropertyDialog(): void {
        if (this.isEditMode && this.buildingId) {
            this._router.navigate(['/property/add'], {
                queryParams: { buildingId: this.buildingId }
            });
        } else {
            this._errorHandlerService.showInfoAlert('Save Building First', 'Please save the building before adding properties');
        }
    }

    /**
     * Open attach existing property dialog
     */
    openAttachPropertyDialog(): void {
        if (this.isEditMode && this.buildingId) {
            const dialogRef = this._dialog.open(AttachPropertyDialogComponent, {
                width: '90vw',
                maxWidth: '1200px',
                height: '85vh',
                maxHeight: '85vh',
                data: { buildingId: this.buildingId },
                disableClose: false
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    // Property was attached, reload the properties list
                    this.loadBuildingProperties();
                    this._errorHandlerService.showSuccessAlert(
                        'Success',
                        'Property has been attached to this building'
                    );
                }
            });
        } else {
            this._errorHandlerService.showInfoAlert('Save Building First', 'Please save the building before attaching properties');
        }
    }

    /**
     * Trigger file input click
     */
    selectImage(): void {
        this.fileInput.nativeElement.click();
    }

    /**
     * Handle file selection
     */
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                this._errorHandlerService.showErrorAlert('Invalid File Type', 'Please select an image file');
                return;
            }

            // Check file size (3MB limit)
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 3) {
                this._errorHandlerService.showErrorAlert('File Too Large', `File is ${fileSizeInMB.toFixed(2)} MB. Please choose files smaller than 3 MB.`);
                return;
            }

            this.selectedImage = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
                this._changeDetectorRef.markForCheck();
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * Remove selected image
     */
    removeImage(): void {
        this.selectedImage = null;
        this.imagePreview = null;
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove property from building
     */
    removePropertyFromBuilding(property: Property, event: Event): void {
        event.stopPropagation(); // Prevent navigation to property detail

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
        // Use the dedicated update-building endpoint to detach (set buildingId to null)
        this._propertyService.updatePropertyBuilding(property.id, null).subscribe({
            next: () => {
                this._errorHandlerService.showSuccessAlert('Success', `Property "${property.name}" has been removed from this building`);
                // Reload the properties list
                this.loadBuildingProperties();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to remove property from building');
                console.error('Error removing property from building:', error);
            }
        });
    }

    /**
     * Convert file to base64
     */
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the data:image/...;base64, prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Get payment type label
     */
    getPaymentTypeLabel(typePaiment: any): string {
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
     * Check if user can edit buildings
     */
    canEditBuildings(): boolean {
        return this._permissionService.canEdit('buildings');
    }

    /**
     * Check if user can delete buildings
     */
    canDeleteBuildings(): boolean {
        return this._permissionService.canDelete('buildings');
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
     * Get properly formatted image URL
     */
    getImageUrl(url: string | null | undefined): string | null {
        if (!url) {
            return null;
        }

        if (url.startsWith('data:') || url.startsWith('http')) {
            return url;
        }

        return `data:image/png;base64,${url}`;
    }
}

