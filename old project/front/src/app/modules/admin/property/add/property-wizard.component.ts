import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Inject, Optional, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../property.service';
import { CreatePropertyDto, PropertySubType, PropertyAppType, PaymentType, PropertyCategory, Property, AttachmentDetails, UpdatePropertyDto } from '../property.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from 'app/core/auth/auth.service';
import { ContactsService } from 'app/modules/admin/contacts/contacts.service';
import { Contact } from 'app/modules/admin/contacts/contacts.types';
import { ContactAddDialogComponent } from './contact-add-dialog.component';
import { ImageViewerComponent } from 'app/core/image-viewer/image-viewer.component';
import { PermissionService } from 'app/core/auth/permission.service';

@Component({
    selector: 'app-property-wizard',
    templateUrl: './property-wizard.component.html',
    styleUrls: ['./property-wizard.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatOptionModule,
        MatDialogModule,
        MatCheckboxModule,
        MatTooltipModule,
        TranslocoModule,
        ImageViewerComponent
    ]
})
export class PropertyWizardComponent implements OnInit {
    @ViewChild('fileInput') fileInput: ElementRef;

    currentStep = 1;
    totalSteps = 5;
    propertyForm: FormGroup;
    uploadedFiles: File[] = [];
    previewUrls: string[] = [];
    defaultImageIndex: number = -1;
    isUploading: boolean = false;
    isLoadingProperty: boolean = false;
    isDragOver: boolean = false;
    currentLanguage: string = 'fr'; // Default to French
    
    // View mode properties
    propertyId: string | null = null;
    isViewMode: boolean = false;
    editMode: boolean = false;
    currentProperty: Property | null = null;
    
    // Building ID from query params (to navigate back to building detail)
    buildingId: string | null = null;
    
    // Existing images (from backend) and new images (to upload)
    existingImages: AttachmentDetails[] = [];
    newImages: { file: File; preview: string }[] = [];
    imagesToDelete: string[] = [];
    defaultNewImageIndex: number = -1; // Track which new image should be default (-1 means none)

    // Image viewer properties
    isImageViewerOpen: boolean = false;
    selectedImageUrl: string = '';
    selectedImageName: string = '';
    selectedImageSize: number = 0;
    selectedImages: { url: string; name: string; size: number }[] = [];
    selectedImageIndex: number = 0;
    formFieldHelpers: string[] = [''];
    
    // Dialog mode
    dialogMode: boolean = false;
    
    // Step titles and descriptions
    steps = [
        { 
            number: 1, 
            title: 'Owner', 
            description: 'Select or add the property owner',
            icon: 'heroicons_outline:user-circle'
        },
        { 
            number: 2, 
            title: 'Property Type', 
            description: 'Select the type of property you want to add',
            icon: 'heroicons_outline:building-office-2'
        },
        { 
            number: 3, 
            title: 'General Information', 
            description: 'Enter the basic information about the property',
            icon: 'heroicons_outline:information-circle'
        },
        { 
            number: 4, 
            title: 'Property Details', 
            description: 'Add property details, features, and amenities',
            icon: 'heroicons_outline:home'
        },
        { 
            number: 5, 
            title: 'Property Images', 
            description: 'Upload images and select the default image',
            icon: 'heroicons_outline:photo'
        }
    ];
    
    // Cities data
    cities: string[] = [];
    filteredCities: string[] = [];
    citySearchTerm = '';
    showCityDropdown = false;
    
    // Custom features and amenities
    customFeature = '';
    customAmenity = '';
    showAddFeature = false;
    showAddAmenity = false;
    addingFeature = false;
    addingAmenity = false;
    
    // Owners data
    owners: Contact[] = [];
    filteredOwners: Contact[] = [];
    ownerSearchTerm = '';
    showOwnerDropdown = false;
    selectedOwnerForDisplay: Contact | null = null;
    
    // Element reference for click outside detection
    @ViewChild('ownerDropdownContainer', { read: ElementRef }) ownerDropdownContainer?: ElementRef;
    

    // Property types - will be loaded from localStorage
    propertyTypes: any[] = [];
    
    // Available property type options - loaded from localStorage
    availablePropertyTypes: any[] = [];

    // Property categories
    propertyCategories = [
        { value: PropertyCategory.Location, label: 'Location' },
        { value: PropertyCategory.Vente, label: 'Vente' },
        { value: PropertyCategory.LocationVacances, label: 'Location vacances' }
    ];

    // Payment types for location category
    paymentTypes = [
        { value: PaymentType.Monthly, label: 'Monthly' },
        { value: PaymentType.Daily, label: 'Daily' },
        { value: PaymentType.Weekly, label: 'Weekly' },
        { value: PaymentType.Fixed, label: 'Fixed' }
    ];



    // Property features
    propertyFeatures = [
        'Alarm', 'Furnished', 'Renovated', 'Hardwood floors', 'Fireplace', 'Fresh paint',
        'Dishwasher', 'Walk-in closets', 'Balcony, Deck, Patio', 'Internet', 'Fenced yard', 'Tile',
        'Carpet', 'Storage', 'Unfurnished'
    ];

    // Property amenities
    propertyAmenities = [
        'Parking', 'Laundry', 'Air conditioning', 'Heating', 'Swimming pool', 'Gym',
        'Security', 'Elevator', 'Balcony', 'Garden', 'Garage', 'Pet friendly'
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _propertyService: PropertyService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _errorHandlerService: ErrorHandlerService,
        private _cdr: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private _authService: AuthService,
        private _contactsService: ContactsService,
        private _dialog: MatDialog,
        private _permissionService: PermissionService,
        @Optional() public dialogRef: MatDialogRef<PropertyWizardComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.initializeForm();
        // Check if we're in dialog mode
        if (data && data.mode === 'dialog') {
            this.dialogMode = true;
        }
    }
    
    /**
     * Handle clicks outside dropdown to close it
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        // Check if click is outside owner dropdown
        if (this.showOwnerDropdown && this.ownerDropdownContainer) {
            const clickedInside = this.ownerDropdownContainer.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.showOwnerDropdown = false;
                this._cdr.detectChanges();
            }
        }
    }

    ngOnInit(): void {
        // Check if we're in view mode (editing/viewing existing property)
        this._activatedRoute.params.subscribe(params => {
            this.propertyId = params['id'] || null;
            this.isViewMode = !!this.propertyId;
            
            if (this.isViewMode) {
                // Load the property data
                this.loadProperty(this.propertyId);
            }
            
            // Disable form if user doesn't have edit permission
            if (!this.canEditProperties()) {
                this.propertyForm.disable();
            }
        });
        
        // Capture buildingId from query params (for back navigation)
        this._activatedRoute.queryParams.subscribe(params => {
            this.buildingId = params['buildingId'] || null;
        });
        
        this.loadCities();
        this.setDefaultCity();
        this.loadDefaultPropertyTypes();
        this.loadDefaultFeaturesAndAmenities();
        this.loadOwners();
        // Initialize filtered owners
        this.filteredOwners = this.owners;
        // Get current language
        this.currentLanguage = this._translocoService.getActiveLang();
        // Subscribe to language changes
        this._translocoService.langChanges$.subscribe(lang => {
            this.currentLanguage = lang;
        });
        
        // Watch for step changes to handle UI state
        this.watchStepChanges();
    }
    
    watchStepChanges(): void {
        // This method can be used for future step change watching
    }

    initializeForm(): void {
        this.propertyForm = this._formBuilder.group({
            // Step 1: Property Type and Category
            propertyType: [''], // Optional
            category: ['', Validators.required],
            furnished: [false], // For location category
            price: [null, [Validators.required, Validators.min(0)]], // Required for all categories
            typePaiment: [PaymentType.Monthly, Validators.required], // Required for all categories

            // Step 2: General Information
            name: ['', Validators.required],
            reference: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],

            // Step 3: Property Details
            surfaceConstruite: [null, [Validators.min(0)]],
            pieces: [0, [Validators.min(0)]],
            chambres: [0, [Validators.min(0)]],
            sallesDeBains: [0, [Validators.min(0)]],
            features: this._formBuilder.array([]),
            amenities: this._formBuilder.array([]),

            // Step 4: Images (handled separately)
            units: [1, [Validators.required, Validators.min(1)]],
            occupiedUnits: [0, [Validators.required, Validators.min(0)]],
            vacantUnits: [1, [Validators.required, Validators.min(0)]],
            balance: [0],
            ownerId: ['', Validators.required],
            companyId: ['default-company']
        });

        // Set up category change listener
        this.propertyForm.get('category')?.valueChanges.subscribe(() => {
            this.onCategoryChange();
        });

        // Filter owners on search term change
        if (typeof this.ownerSearchTerm !== 'undefined') {
            // Watch for owner search term changes
            // This will be handled by a reactive approach in the template
        }
    }

    getStepTitle(): string {
        switch (this.currentStep) {
            case 1: return 'Owner';
            case 2: return 'Property Type';
            case 3: return 'General Information';
            case 4: return 'Property Details';
            case 5: return 'Property Images';
            default: return '';
        }
    }

    getStepDescription(): string {
        switch (this.currentStep) {
            case 1: return 'Select or add the property owner';
            case 2: return 'Select the type of property you want to add';
            case 3: return 'Enter the basic information about the property';
            case 4: return 'Add property details, features, and amenities';
            case 5: return 'Upload images and select the default image';
            default: return '';
        }
    }

    onFormKeyDown(event: KeyboardEvent): void {
        // Prevent form submission when Enter is pressed anywhere in the form
        // Only allow submission when clicking the Next/Create Property button
        if (event.key === 'Enter') {
            // Check if the target is not a button
            if (!(event.target instanceof HTMLButtonElement)) {
                event.preventDefault();
            }
        }
    }

    nextStep(): void {
        if (this.isViewMode && !this.editMode) {
            // In read-only view mode, just navigate to next step without validation
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
            }
        } else {
            // In create or edit mode, validate and submit if on last step
            if (this.isCurrentStepValid()) {
                if (this.currentStep < this.totalSteps) {
                    this.currentStep++;
                } else {
                    this.submitProperty();
                }
            }
        }
    }

    previousStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            
            // Restore selected owner display when returning to step 1
            if (this.currentStep === 1) {
                this.restoreSelectedOwnerDisplay();
                // Reset filtered owners to show all
                this.filteredOwners = this.owners;
                // Close dropdown
                this.showOwnerDropdown = false;
                // Force change detection
                this._cdr.detectChanges();
            }
        }
    }
    
    // Restore selected owner display from form value
    restoreSelectedOwnerDisplay(): void {
        const ownerId = this.propertyForm.get('ownerId')?.value;
        if (ownerId && !this.selectedOwnerForDisplay) {
            const owner = this.owners.find(o => o.id === ownerId);
            if (owner) {
                this.selectedOwnerForDisplay = owner;
                this.ownerSearchTerm = owner.name || '';
                this._cdr.detectChanges();
            }
        }
    }

    isCurrentStepValid(): boolean {
        switch (this.currentStep) {
            case 1:
                return this.propertyForm.get('ownerId')?.valid;
            case 2:
                return this.propertyForm.get('category')?.valid &&
                       this.propertyForm.get('price')?.valid &&
                       this.propertyForm.get('typePaiment')?.valid;
            case 3:
                return this.propertyForm.get('name')?.valid && 
                       this.propertyForm.get('reference')?.valid &&
                       this.propertyForm.get('address')?.valid && 
                       this.propertyForm.get('city')?.valid;
            case 4:
                return true; // Optional fields
            case 5:
                // In edit mode, allow proceeding if there are existing images or at least one will remain after deletions
                if (this.editMode) {
                    const remainingExistingImages = this.existingImages.filter(img => !this.imagesToDelete.includes(img.id)).length;
                    const hasValidDefault = (this.defaultImageIndex >= 0 && remainingExistingImages > 0) || this.defaultNewImageIndex >= 0;
                    return (remainingExistingImages > 0 || this.newImages.length > 0) && hasValidDefault;
                }
                // In create mode, require uploaded files
                return this.uploadedFiles.length > 0 && this.defaultImageIndex >= 0;
            default:
                return false;
        }
    }

    onFileSelected(event: any): void {
        const files = Array.from(event.target.files) as File[];
        this.handleFileUpload(files);
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
        
        const files = Array.from(event.dataTransfer?.files || []);
        this.handleFileUpload(files);
    }

    handleFileUpload(files: File[]): void {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this._errorHandlerService.showErrorAlert(
                'Invalid File Type',
                'Please upload only image files.'
            );
            return;
        }

        // Set uploading state
        this.isUploading = true;

        // Process all files
        let processedCount = 0;
        const totalFiles = imageFiles.length;
        let hasError = false;

        imageFiles.forEach((file, index) => {
            // Check file size (3MB limit)
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 3) {
                this._errorHandlerService.showErrorAlert(
                    'File Too Large',
                    `File "${file.name}" is ${fileSizeInMB.toFixed(2)} MB. Please choose files smaller than 3 MB.`
                );
                processedCount++;
                hasError = true;
                if (processedCount === totalFiles) {
                    this.isUploading = false;
                    // Force change detection
                    this._cdr.detectChanges();
                }
                return;
            }

            // Add to appropriate array based on mode
            if (this.editMode) {
                // In edit mode, add to newImages array
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.newImages.push({ file, preview: e.target.result });
                    processedCount++;
                    
                    // When all files are processed, set loading to false
                    if (processedCount === totalFiles) {
                        this.isUploading = false;
                        // Force change detection
                        this._cdr.detectChanges();
                    }
                };
                reader.readAsDataURL(file);
            } else {
                // In create mode, use existing logic
                this.uploadedFiles.push(file);
                
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.previewUrls.push(e.target.result);
                    processedCount++;
                    
                    // When all files are processed, set loading to false
                    if (processedCount === totalFiles) {
                        this.isUploading = false;
                        // Set first image as default if no default is set
                        if (this.defaultImageIndex === -1 && this.previewUrls.length > 0) {
                            this.defaultImageIndex = 0;
                        }
                        // Force change detection
                        this._cdr.detectChanges();
                    }
                };
                reader.onerror = () => {
                    this._errorHandlerService.showErrorAlert(
                        'Upload Error',
                        `Failed to read file "${file.name}". Please try again.`
                    );
                    processedCount++;
                    hasError = true;
                    if (processedCount === totalFiles) {
                        this.isUploading = false;
                        // Force change detection
                        this._cdr.detectChanges();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    removeImage(index: number): void {
        if (index >= 0 && index < this.uploadedFiles.length) {
            const wasDefaultImage = this.defaultImageIndex === index;
            
            this.uploadedFiles.splice(index, 1);
            this.previewUrls.splice(index, 1);
            
            if (wasDefaultImage) {
                // If we removed the default image, set the first image as default
                if (this.previewUrls.length > 0) {
                    this.defaultImageIndex = 0;
                } else {
                    this.defaultImageIndex = -1;
                }
            } else if (this.defaultImageIndex > index) {
                this.defaultImageIndex--;
            }
        }
    }

    setDefaultImage(index: number): void {
        if (index >= 0 && index < this.previewUrls.length) {
            this.defaultImageIndex = index;
        }
    }

    // Methods for managing existing images in edit mode
    removeExistingImage(attachmentId: string, index: number): void {
        if (!this.imagesToDelete.includes(attachmentId)) {
            this.imagesToDelete.push(attachmentId);
        }
        
        // If this was the default image, automatically select another one
        if (this.defaultImageIndex === index) {
            this.defaultImageIndex = -1;
            
            // Try to find another non-deleted existing image to set as default
            for (let i = 0; i < this.existingImages.length; i++) {
                if (!this.imagesToDelete.includes(this.existingImages[i].id)) {
                    this.defaultImageIndex = i;
                    break;
                }
            }
            
            // If no existing images are available, check if we have new images
            if (this.defaultImageIndex === -1 && this.newImages.length > 0) {
                // Set first new image as default
                this.defaultNewImageIndex = 0;
            }
        }
    }

    restoreExistingImage(attachmentId: string): void {
        const index = this.imagesToDelete.indexOf(attachmentId);
        if (index > -1) {
            this.imagesToDelete.splice(index, 1);
            
            // If there's no default image currently, set this restored image as default
            const hasExistingDefault = this.defaultImageIndex >= 0 && 
                                      this.defaultImageIndex < this.existingImages.length &&
                                      !this.imagesToDelete.includes(this.existingImages[this.defaultImageIndex].id);
            const hasNewDefault = this.defaultNewImageIndex >= 0 && this.defaultNewImageIndex < this.newImages.length;
            
            if (!hasExistingDefault && !hasNewDefault) {
                // Find the index of the restored image in existingImages array
                const restoredImageIndex = this.existingImages.findIndex(img => img.id === attachmentId);
                if (restoredImageIndex > -1) {
                    this.defaultImageIndex = restoredImageIndex;
                    this.defaultNewImageIndex = -1; // Clear new image default
                }
            }
        }
    }

    removeNewImage(index: number): void {
        if (index >= 0 && index < this.newImages.length) {
            this.newImages.splice(index, 1);
            
            // If we removed the default new image, automatically select another
            if (this.defaultNewImageIndex === index) {
                this.defaultNewImageIndex = -1;
                
                // Try to find another new image to set as default
                if (this.newImages.length > 0) {
                    this.defaultNewImageIndex = 0;
                } else {
                    // No new images left, try to find a non-deleted existing image
                    for (let i = 0; i < this.existingImages.length; i++) {
                        if (!this.imagesToDelete.includes(this.existingImages[i].id)) {
                            this.defaultImageIndex = i;
                            break;
                        }
                    }
                }
            } else if (this.defaultNewImageIndex > index) {
                this.defaultNewImageIndex--;
            }
        }
    }

    setDefaultExistingImage(attachmentId: string, index: number): void {
        this.defaultImageIndex = index;
        // Clear new image default
        this.defaultNewImageIndex = -1;
        // Update form value
        if (this.propertyForm) {
            this.propertyForm.patchValue({
                defaultAttachmentId: attachmentId
            });
        }
    }

    setDefaultNewImage(index: number): void {
        if (index >= 0 && index < this.newImages.length) {
            // Clear existing image default
            this.defaultImageIndex = -1;
            // Set new image as default
            this.defaultNewImageIndex = index;
        }
    }

    isNewImageDefault(index: number): boolean {
        return this.defaultNewImageIndex === index;
    }

    isExistingImageDeleted(attachmentId: string): boolean {
        return this.imagesToDelete.includes(attachmentId);
    }

    getActiveExistingImagesCount(): number {
        return this.existingImages.filter(img => !this.imagesToDelete.includes(img.id)).length;
    }

    toggleFeature(feature: string): void {
        const featuresArray = this.propertyForm.get('features') as FormArray;
        const index = featuresArray.controls.findIndex(control => control.value === feature);
        
        if (index > -1) {
            featuresArray.removeAt(index);
        } else {
            featuresArray.push(this._formBuilder.control(feature));
        }
    }

    toggleAmenity(amenity: string): void {
        const amenitiesArray = this.propertyForm.get('amenities') as FormArray;
        const index = amenitiesArray.controls.findIndex(control => control.value === amenity);
        
        if (index > -1) {
            amenitiesArray.removeAt(index);
        } else {
            amenitiesArray.push(this._formBuilder.control(amenity));
        }
    }


    isFeatureSelected(feature: string): boolean {
        const featuresArray = this.propertyForm.get('features') as FormArray;
        return featuresArray.controls.some(control => control.value === feature);
    }

    isAmenitySelected(amenity: string): boolean {
        const amenitiesArray = this.propertyForm.get('amenities') as FormArray;
        return amenitiesArray.controls.some(control => control.value === amenity);
    }


    async submitProperty(): Promise<void> {
        // Different validation for edit mode vs create mode
        const isValid = this.editMode ? 
            this.propertyForm.valid : 
            (this.propertyForm.valid && this.uploadedFiles.length > 0 && this.defaultImageIndex >= 0);
        
        if (isValid) {
            if (this.editMode) {
                await this.updateProperty();
            } else {
                await this.createProperty();
            }
        } else {
            this.showValidationErrors();
        }
    }

    async createProperty(): Promise<void> {
        if (this.propertyForm.valid && this.uploadedFiles.length > 0 && this.defaultImageIndex >= 0) {
            const formValue = this.propertyForm.value;
            this.isUploading = true;
            
            try {
                // Convert files to base64
                const images: { fileName: string; base64Content: string }[] = [];
                
                for (let i = 0; i < this.uploadedFiles.length; i++) {
                    const file = this.uploadedFiles[i];
                    const base64 = await this.convertFileToBase64(file);
                    images.push({
                        fileName: file.name,
                        base64Content: base64
                    });
                }
                
                // Get features and amenities array values
                const featuresArray = this.propertyForm.get('features') as FormArray;
                const amenitiesArray = this.propertyForm.get('amenities') as FormArray;
                const featuresList = featuresArray.value || [];
                const amenitiesList = amenitiesArray.value || [];
                
                // Get property type label as string
                const propertyTypeValue = formValue.propertyType || 0;
                const propertyTypeObj = this.availablePropertyTypes.find(t => t.value === propertyTypeValue);
                const propertyTypeLabel = propertyTypeObj ? propertyTypeObj.label : 'Others';
                
                // Create property data with proper backend field names
                const propertyData: CreatePropertyDto = {
                    identifier: formValue.reference || '',
                    name: formValue.name || '',
                    description: formValue.name || '',
                    address: formValue.address || '',
                    city: formValue.city || '',
                    typeProperty: propertyTypeLabel,
                    area: parseFloat(formValue.surfaceConstruite) || 0,
                    pieces: parseFloat(formValue.chambres) || 0, // chambres = bedrooms
                    bathrooms: parseFloat(formValue.sallesDeBains) || 0,
                    furnished: formValue.furnished || false,
                    price: parseFloat(formValue.price) || 0,
                    typePaiment: formValue.typePaiment ?? 0,
                    buildingId: this.buildingId || undefined, // Include buildingId if coming from building detail
                    contactId: formValue.ownerId,
                    features: featuresList, // Property features (hardwood floors, fireplace, etc.)
                    equipment: amenitiesList, // Amenities/Equipment (AC, heating, dishwasher, etc.)
                    category: formValue.category ?? PropertyCategory.Location,
                    images: images,
                    defaultImageId: this.defaultImageIndex.toString()
                };

                this._propertyService.createProperty(propertyData as any).subscribe({
                    next: (property) => {
                        this.isUploading = false;
                        this._errorHandlerService.showSuccessAlert(
                            'Property Created Successfully!',
                            `The property "${property.name || property.identifier}" has been created successfully.`
                        );
                        
                        // If in dialog mode, close with the created property
                        if (this.dialogMode && this.dialogRef) {
                            setTimeout(() => {
                                this.dialogRef.close(property);
                            }, 500);
                            return;
                        }
                        
                        // Navigate back to building detail if property was created from building, otherwise to property list
                        setTimeout(() => {
                            if (this.buildingId) {
                                this._router.navigate(['/building', this.buildingId]);
                            } else {
                                this._router.navigate(['/property']);
                            }
                        }, 500);
                    },
                    error: (error) => {
                        this.isUploading = false;
                        this._errorHandlerService.showErrorAlert(
                            'Failed to Create Property',
                            error?.error?.message || 'An error occurred while creating the property. Please try again.'
                        );
                    }
                });
            } catch (error) {
                this.isUploading = false;
                this._errorHandlerService.showErrorAlert(
                    'Error',
                    'Failed to process images'
                );
            }
        } else {
            this.showValidationErrors();
        }
    }

    async updateProperty(): Promise<void> {
        if (!this.currentProperty || !this.propertyForm.valid) {
            return;
        }

        const formValue = this.propertyForm.value;
        this.isUploading = true;
        
        try {
            // Convert new images to base64
            const imagesToAdd: { fileName: string; base64Content: string; isDefault?: boolean }[] = [];
            
            for (let i = 0; i < this.newImages.length; i++) {
                const newImage = this.newImages[i];
                const base64 = await this.convertFileToBase64(newImage.file);
                imagesToAdd.push({
                    fileName: newImage.file.name,
                    base64Content: base64,
                    isDefault: this.defaultNewImageIndex === i // Mark if this is the selected default
                });
            }
            
            // Get features and amenities array values
            const featuresArray = this.propertyForm.get('features') as FormArray;
            const amenitiesArray = this.propertyForm.get('amenities') as FormArray;
            const featuresList = featuresArray.value || [];
            const amenitiesList = amenitiesArray.value || [];
            
            // Get property type label as string
            const propertyTypeValue = formValue.propertyType || 0;
            const propertyTypeObj = this.availablePropertyTypes.find(t => t.value === propertyTypeValue);
            const propertyTypeLabel = propertyTypeObj ? propertyTypeObj.label : 'Others';
            
            // Get the current default attachment ID
            let defaultAttachmentId = this.currentProperty.defaultAttachmentId;
            
            // If a new image is selected as default, clear the existing default (backend will set it after upload)
            if (this.defaultNewImageIndex >= 0) {
                defaultAttachmentId = undefined;
            }
            // If an existing image is selected as default, use its ID
            else if (this.defaultImageIndex >= 0 && this.defaultImageIndex < this.existingImages.length) {
                const activeExistingImages = this.existingImages.filter(img => !this.imagesToDelete.includes(img.id));
                if (this.defaultImageIndex < activeExistingImages.length) {
                    defaultAttachmentId = activeExistingImages[this.defaultImageIndex].id;
                }
            }
            
            // Create update property data
            const propertyData: UpdatePropertyDto = {
                id: this.currentProperty.id,
                identifier: formValue.reference || '',
                name: formValue.name || '',
                description: formValue.name || '',
                address: formValue.address || '',
                city: formValue.city || '',
                typeProperty: propertyTypeLabel, // Use label (string) not value (number)
                area: parseFloat(formValue.surfaceConstruite) || 0,
                pieces: parseFloat(formValue.chambres) || 0,
                bathrooms: parseFloat(formValue.sallesDeBains) || 0,
                furnished: formValue.furnished || false,
                price: parseFloat(formValue.price) || 0,
                typePaiment: formValue.typePaiment ?? 0,
                buildingId: this.buildingId || this.currentProperty.buildingId || undefined, // Include buildingId from query params or existing property
                contactId: formValue.ownerId,
                features: featuresList,
                equipment: amenitiesList,
                category: formValue.category ?? PropertyCategory.Location,
                defaultAttachmentId: defaultAttachmentId,
                imagesToAdd: imagesToAdd.length > 0 ? imagesToAdd : undefined,
                attachmentsToDelete: this.imagesToDelete.length > 0 ? this.imagesToDelete : undefined
            };

            this._propertyService.updateProperty(this.currentProperty.id, propertyData as any).subscribe({
                next: (property) => {
                    this.isUploading = false;
                    this._errorHandlerService.showSuccessAlert(
                        'Property Updated Successfully!',
                        `The property "${property.name || property.identifier}" has been updated successfully.`
                    );
                    
                    // If in dialog mode, close with the updated property
                    if (this.dialogMode && this.dialogRef) {
                        setTimeout(() => {
                            this.dialogRef.close(property);
                        }, 500);
                        return;
                    }
                    
                    // Navigate back to building detail if property was updated from building, otherwise to property list
                    setTimeout(() => {
                        if (this.buildingId) {
                            this._router.navigate(['/building', this.buildingId]);
                        } else {
                            this._router.navigate(['/property']);
                        }
                    }, 500);
                },
                error: (error) => {
                    this.isUploading = false;
                    this._errorHandlerService.showErrorAlert(
                        'Failed to Update Property',
                        error?.error?.message || 'An error occurred while updating the property. Please try again.'
                    );
                }
            });
        } catch (error) {
            this.isUploading = false;
            this._errorHandlerService.showErrorAlert(
                'Error',
                'Failed to process images'
            );
        }
    }

    showValidationErrors(): void {
        const failedValidations = [];
        
        if (!this.propertyForm.valid) {
            failedValidations.push('Form is invalid');
            Object.keys(this.propertyForm.controls).forEach(key => {
                const control = this.propertyForm.get(key);
                if (control?.invalid) {
                    failedValidations.push(`${key}: ${JSON.stringify(control.errors)}`);
                }
            });
        }
        
        if (!this.editMode && this.uploadedFiles.length === 0) {
            failedValidations.push('No files uploaded');
        }
        
        if (!this.editMode && this.defaultImageIndex < 0) {
            failedValidations.push('No default image selected');
        }
        
        this._errorHandlerService.showErrorAlert(
            'Validation Error',
            this.editMode ? 
                'Please fill in all required fields.' :
                'Please fill in all required fields and upload at least one image.'
        );
    }
    
    // Helper method to convert File to base64 string
    private convertFileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    getProgressPercentage(): number {
        return (this.currentStep / this.totalSteps) * 100;
    }

    // Expose Math to template
    Math = Math;

    // Get property type label based on current language
    getPropertyTypeLabel(type: any): string {
        // If the type object has a custom label (from localStorage), use it directly
        if (type.label) {
            return type.label;
        }
        // If the type object has a key property (from localStorage), use it for translation
        if (type.key) {
            const key = `property.add.property_types.${type.key}`;
            return this._translocoService.translate(key);
        }
        // Otherwise, use the enum value to get the translation key
        const translationKey = `property.add.property_types.${this.getPropertyTypeKey(type.value)}`;
        return this._translocoService.translate(translationKey);
    }

    // Get category label based on current language
    getCategoryLabel(category: any): string {
        // Return the label directly from the category object
        return category.label || 'Unknown';
    }

    // Get payment type label based on current language
    getPaymentTypeLabel(paymentType: any): string {
        const key = `property.add.payment_types.${this.getPaymentTypeKey(paymentType.value)}`;
        return this._translocoService.translate(key);
    }

    // Helper to get payment type key
    private getPaymentTypeKey(value: PaymentType | number): string {
        switch(value) {
            case PaymentType.Monthly: return 'monthly';
            case PaymentType.Daily: return 'daily';
            case PaymentType.Weekly: return 'weekly';
            case PaymentType.Fixed: return 'fixed';
            default: return 'monthly';
        }
    }

    // Helper to get property type key
    private getPropertyTypeKey(value: number): string {
        switch(value) {
            case 0: return 'apartments';
            case 1: return 'villa';
            case 2: return 'riads';
            case 3: return 'offices';
            case 4: return 'factories';
            case 5: return 'ground';
            case 6: return 'others';
            default: 
                return 'others';
        }
    }

    // Toggle language
    toggleLanguage(): void {
        const newLang = this.currentLanguage === 'fr' ? 'en' : 'fr';
        this._translocoService.setActiveLang(newLang);
        this.currentLanguage = newLang;
    }

    // City-related methods
    loadCities(): void {
        // Load Moroccan cities from application settings
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
        this.filteredCities = [...this.cities];
    }

    setDefaultCity(): void {
        // Set the default city from application settings
        const settings = this._authService.getSettings();
        if (settings && settings.defaultCity) {
            this.propertyForm.patchValue({ city: settings.defaultCity });
            this.citySearchTerm = settings.defaultCity;
        }
    }

    onCitySearch(event: any): void {
        this.citySearchTerm = event.target.value;
        this.filteredCities = this.cities.filter(city => 
            city.toLowerCase().includes(this.citySearchTerm.toLowerCase())
        );
        this.showCityDropdown = this.citySearchTerm.length > 0 && this.filteredCities.length > 0;
    }

    selectCity(city: string): void {
        this.propertyForm.patchValue({ city });
        this.citySearchTerm = city;
        this.showCityDropdown = false;
    }

    onCityInputFocus(): void {
        if (this.citySearchTerm.length > 0) {
            this.showCityDropdown = true;
        }
    }

    onCityInputBlur(): void {
        // Delay hiding dropdown to allow for click events
        setTimeout(() => {
            this.showCityDropdown = false;
        }, 200);
    }

    // Custom features and amenities methods
    addCustomFeature(): void {
        if (this.customFeature.trim()) {
            this.propertyFeatures.push(this.customFeature.trim());
            this.toggleFeature(this.customFeature.trim());
            this.customFeature = '';
            this.showAddFeature = false;
        }
    }

    addCustomAmenity(): void {
        if (this.customAmenity.trim()) {
            this.propertyAmenities.push(this.customAmenity.trim());
            this.toggleAmenity(this.customAmenity.trim());
            this.customAmenity = '';
            this.showAddAmenity = false;
        }
    }


    // Inline adding methods
    startAddingFeature(): void {
        this.addingFeature = true;
        this.customFeature = '';
    }

    startAddingAmenity(): void {
        this.addingAmenity = true;
        this.customAmenity = '';
    }


    confirmAddFeature(): void {
        if (this.customFeature.trim()) {
            this.propertyFeatures.push(this.customFeature.trim());
            this.toggleFeature(this.customFeature.trim());
            this.customFeature = '';
        }
        this.addingFeature = false;
    }

    confirmAddAmenity(): void {
        if (this.customAmenity.trim()) {
            this.propertyAmenities.push(this.customAmenity.trim());
            this.toggleAmenity(this.customAmenity.trim());
            this.customAmenity = '';
        }
        this.addingAmenity = false;
    }


    cancelAddFeature(): void {
        this.addingFeature = false;
        this.customFeature = '';
    }

    cancelAddAmenity(): void {
        this.addingAmenity = false;
        this.customAmenity = '';
    }


    removeCustomFeature(feature: string): void {
        const index = this.propertyFeatures.indexOf(feature);
        if (index > -1) {
            this.propertyFeatures.splice(index, 1);
            // Also remove from form if selected
            const featuresArray = this.propertyForm.get('features') as FormArray;
            const formIndex = featuresArray.controls.findIndex(control => control.value === feature);
            if (formIndex > -1) {
                featuresArray.removeAt(formIndex);
            }
        }
    }

    removeCustomAmenity(amenity: string): void {
        const index = this.propertyAmenities.indexOf(amenity);
        if (index > -1) {
            this.propertyAmenities.splice(index, 1);
            // Also remove from form if selected
            const amenitiesArray = this.propertyForm.get('amenities') as FormArray;
            const formIndex = amenitiesArray.controls.findIndex(control => control.value === amenity);
            if (formIndex > -1) {
                amenitiesArray.removeAt(formIndex);
            }
        }
    }

    // Counter control methods
    incrementPieces(): void {
        const currentValue = this.propertyForm.get('pieces')?.value || 0;
        this.propertyForm.patchValue({ pieces: currentValue + 1 });
    }

    decrementPieces(): void {
        const currentValue = this.propertyForm.get('pieces')?.value || 0;
        if (currentValue > 0) {
            this.propertyForm.patchValue({ pieces: currentValue - 1 });
        }
    }

    incrementChambres(): void {
        const currentValue = this.propertyForm.get('chambres')?.value || 0;
        this.propertyForm.patchValue({ chambres: currentValue + 1 });
    }

    decrementChambres(): void {
        const currentValue = this.propertyForm.get('chambres')?.value || 0;
        if (currentValue > 0) {
            this.propertyForm.patchValue({ chambres: currentValue - 1 });
        }
    }

    incrementSallesDeBains(): void {
        const currentValue = this.propertyForm.get('sallesDeBains')?.value || 0;
        this.propertyForm.patchValue({ sallesDeBains: currentValue + 1 });
    }

    decrementSallesDeBains(): void {
        const currentValue = this.propertyForm.get('sallesDeBains')?.value || 0;
        if (currentValue > 0) {
            this.propertyForm.patchValue({ sallesDeBains: currentValue - 1 });
        }
    }

    // Navigation methods - Step clicking disabled, only forward navigation allowed

    isStepCompleted(stepNumber: number): boolean {
        switch (stepNumber) {
            case 1:
                return this.propertyForm.get('propertyType')?.valid;
            case 2:
                return this.propertyForm.get('name')?.valid && 
                       this.propertyForm.get('address')?.valid && 
                       this.propertyForm.get('city')?.valid;
            case 3:
                return true; // Optional fields
            case 4:
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    // Load property types from localStorage
    loadDefaultPropertyTypes(): void {
        const settings = this._authService.getSettings();
        
        // Load property types from localStorage settings
        if (settings && settings.propertyTypes && settings.propertyTypes.length > 0) {
            this.availablePropertyTypes = settings.propertyTypes.map((type: string, index: number) => ({
                value: index,
                label: type,
                labelFr: type,
                key: type.toLowerCase().replace(/\s+/g, '_')
            }));
        } else {
            // Default property types if nothing in settings
            this.availablePropertyTypes = [
                { value: 0, label: 'Apartments', labelFr: 'Appartements', key: 'apartments' },
                { value: 1, label: 'Villa', labelFr: 'Villa', key: 'villa' },
                { value: 2, label: 'Riads', labelFr: 'Riads', key: 'riads' },
                { value: 3, label: 'Offices', labelFr: 'Bureaux', key: 'offices' },
                { value: 4, label: 'Factories', labelFr: 'Usines', key: 'factories' },
                { value: 5, label: 'Ground', labelFr: 'Terrain', key: 'ground' },
                { value: 6, label: 'Others', labelFr: 'Autres', key: 'others' }
            ];
        }
        
        // Set propertyTypes to available types (for the main type dropdown)
        this.propertyTypes = [...this.availablePropertyTypes];
    }

    // Load default features and amenities from localStorage
    loadDefaultFeaturesAndAmenities(): void {
        const settings = this._authService.getSettings();
        
        if (settings && settings.features && settings.features.length > 0) {
            this.propertyFeatures = [...settings.features];
        }
        
        if (settings && settings.amenities && settings.amenities.length > 0) {
            this.propertyAmenities = [...settings.amenities];
        }
    }

    // Generate reference based on category and settings
    generateReference(category: number): string {
        const settings = this._authService.getSettings();
        if (!settings || !settings.categories) {
            // Fallback to default references based on enum value
            switch (category) {
                case PropertyCategory.Location:
                    return 'AL';
                case PropertyCategory.Vente:
                    return 'AV';
                case PropertyCategory.LocationVacances:
                    return 'VC';
                default:
                    return 'REF';
            }
        }

        // Find category key from enum value
        let categoryKey = '';
        switch (category) {
            case PropertyCategory.Location:
                categoryKey = 'location';
                break;
            case PropertyCategory.Vente:
                categoryKey = 'vente';
                break;
            case PropertyCategory.LocationVacances:
                categoryKey = 'vacance';
                break;
            default:
                categoryKey = 'location';
        }

        const categoryData = settings.categories.find((cat: any) => cat.key === categoryKey);
        if (categoryData && categoryData.reference) {
            // Return just the reference prefix without random numbers
            return categoryData.reference;
        }
        
        // Fallback to default references
        switch (category) {
            case PropertyCategory.Location:
                return 'AL';
            case PropertyCategory.Vente:
                return 'AV';
            case PropertyCategory.LocationVacances:
                return 'VC';
            default:
                return 'REF';
        }
    }

    // Watch for category changes to update reference
    onCategoryChange(): void {
        const category = this.propertyForm.get('category')?.value;
        if (category !== null && category !== undefined) {
            const reference = this.generateReference(category);
            this.propertyForm.patchValue({ reference });
            
            // Set payment type to Fixed for vente (sale) category
            if (category === PropertyCategory.Vente) {
                this.propertyForm.patchValue({ typePaiment: PaymentType.Fixed });
            } else if (category === PropertyCategory.Location) {
                // Set payment type to Monthly for location category (default)
                this.propertyForm.patchValue({ typePaiment: PaymentType.Monthly });
            }
        }
    }

    // Navigate to settings page
    goToSettings(): void {
        this._router.navigate(['/admin/settings/application']);
    }

    // Generate random number and replace current reference
    generateRandomReference(): void {
        const currentReference = this.propertyForm.get('reference')?.value || '';
        
        // Generate a random 8-digit number
        const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
        
        // Extract the prefix from current reference (remove any existing numbers)
        let prefix = currentReference.trim();
        if (prefix) {
            // Remove any trailing digits to get just the prefix
            prefix = prefix.replace(/\d+$/, '');
        }
        
        // If we have a prefix, use it; otherwise use default
        if (prefix) {
            this.propertyForm.patchValue({ reference: `${prefix}${randomNumber}` });
        } else {
            // If no prefix, use a default prefix
            this.propertyForm.patchValue({ reference: `REF${randomNumber}` });
        }
    }

    // Load owners from contacts service
    loadOwners(): void {
        this._contactsService.getContactsByType('owner', 1, 100, true).subscribe({
            next: (contacts) => {
                this.owners = contacts;
                this.filteredOwners = contacts || [];
                
                // Restore selected owner display if we have an ownerId in the form
                this.restoreSelectedOwnerDisplay();
                
                // If we're in edit/view mode and owner is already selected, populate search term
                if (this.isViewMode && this.propertyForm.get('ownerId')?.value) {
                    const ownerId = this.propertyForm.get('ownerId')?.value;
                    const owner = this.owners.find(o => o.id === ownerId);
                    if (owner) {
                        this.ownerSearchTerm = owner.name || '';
                        this.selectedOwnerForDisplay = owner;
                    }
                }
                
                this._cdr.detectChanges();
            },
            error: (error) => {
                this.owners = [];
                this.filteredOwners = [];
                this._cdr.detectChanges();
            }
        });
    }

    // Open dialog to add new contact
    openAddContactDialog(): void {
        const dialogRef = this._dialog.open(ContactAddDialogComponent, {
            width: '95vw',
            maxWidth: '95vw',
            height: '95vh',
            maxHeight: '95vh',
            data: { type: 'owner' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.id) {
                // Reload owners to include the new one
                this.loadOwners();
                // Select the newly created contact
                setTimeout(() => {
                    this.propertyForm.patchValue({ ownerId: result.id });
                    this.selectedOwnerForDisplay = result;
                    this.ownerSearchTerm = result.name || '';
                    this._cdr.detectChanges();
                }, 500);
            }
        });
    }

    // Select an owner
    selectOwner(owner: Contact): void {
        this.propertyForm.patchValue({ ownerId: owner.id });
        this.selectedOwnerForDisplay = owner;
        this.ownerSearchTerm = owner.name || '';
        this.showOwnerDropdown = false;
        this._cdr.detectChanges();
    }

    // Clear selected owner
    clearOwner(): void {
        this.propertyForm.patchValue({ ownerId: '' });
        this.selectedOwnerForDisplay = null;
        this.ownerSearchTerm = '';
        this.showOwnerDropdown = false;
        this._cdr.detectChanges();
    }

    // Get selected owner
    getSelectedOwner(): Contact | undefined {
        const ownerId = this.propertyForm.get('ownerId')?.value;
        if (!ownerId) return undefined;
        
        // Return cached owner if available
        if (this.selectedOwnerForDisplay && this.selectedOwnerForDisplay.id === ownerId) {
            return this.selectedOwnerForDisplay;
        }
        
        // Otherwise find in owners list
        const owner = this.owners.find(o => o.id === ownerId);
        if (owner) {
            this.selectedOwnerForDisplay = owner;
        }
        return owner;
    }

    // Get selected owner name
    getSelectedOwnerName(): string {
        const owner = this.getSelectedOwner();
        if (!owner) return '';
        
        return this.getOwnerDisplayName(owner);
    }

    // Get selected owner avatar URL
    getSelectedOwnerAvatar(): string {
        const owner = this.getSelectedOwner();
        if (!owner?.avatar) return '';
        
        // If it already has the data URL prefix, return as is
        if (owner.avatar.startsWith('data:')) {
            return owner.avatar;
        }
        
        // If it's already a URL (http/https), return as is
        if (owner.avatar.startsWith('http')) {
            return owner.avatar;
        }
        
        // Otherwise, assume it's a plain base64 string and add the data URL prefix
        return `data:image/png;base64,${owner.avatar}`;
    }

    // Get owner display name
    getOwnerDisplayName(owner: Contact): string {
        if (owner.isACompany && owner.companyName) {
            return owner.companyName;
        }
        return `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
    }

    // Filter owners based on search term
    filterOwners(): void {
        if (!this.ownerSearchTerm || this.ownerSearchTerm.trim() === '') {
            this.filteredOwners = this.owners;
        } else {
            const searchTerm = this.ownerSearchTerm.toLowerCase().trim();
            this.filteredOwners = this.owners.filter(owner => {
                const displayName = this.getOwnerDisplayName(owner).toLowerCase();
                const email = (owner.email || '').toLowerCase();
                const phone = (owner.phones && owner.phones.length > 0) ? owner.phones[0].toLowerCase() : '';
                const identifier = (owner.identifier || '').toLowerCase();
                return displayName.includes(searchTerm) || 
                       email.includes(searchTerm) || 
                       phone.includes(searchTerm) || 
                       identifier.includes(searchTerm);
            });
        }
    }

    // Load property data for viewing
    loadProperty(propertyId: string): void {
        this.isLoadingProperty = true;
        this._propertyService.getPropertyById(propertyId).subscribe({
            next: (property) => {
                this.currentProperty = property;
                this.populateForm(property);
                
                // Load images from property object
                this.loadPropertyImages(property);
                
                this.isLoadingProperty = false;
                
                // Note: We don't disable the form in view mode to allow click events for alerts
                // Instead, we use [readonly] attributes on inputs
                
                this._cdr.detectChanges();
            },
            error: (error) => {
                this.isLoadingProperty = false;
                this._errorHandlerService.showErrorAlert(
                    'Error Loading Property',
                    'Failed to load property details. Please try again.'
                );
                // Navigate back to list on error
                this._router.navigate(['/property']);
            }
        });
    }

    // Load property images from property object
    loadPropertyImages(property: any): void {
        // Reset arrays
        this.existingImages = [];
        this.newImages = [];
        this.imagesToDelete = [];
        this.defaultNewImageIndex = -1; // Reset new image default
        
        // Load existing attachments
        if (property.attachments && Array.isArray(property.attachments)) {
            this.existingImages = [...property.attachments];
        }
        // Fallback: Check for default attachment URL
        else if (property.defaultAttachmentUrl) {
            this.existingImages = [{ 
                url: property.defaultAttachmentUrl, 
                id: property.defaultAttachmentId,
                fileName: 'default-image'
            }];
        }
        
        // Set default image index based on defaultAttachmentId
        this.defaultImageIndex = -1;
        if (property.defaultAttachmentId && this.existingImages.length > 0) {
            const defaultIndex = this.existingImages.findIndex((att: any) => 
                att.id === property.defaultAttachmentId
            );
            if (defaultIndex !== -1) {
                this.defaultImageIndex = defaultIndex;
            }
        }
        
        // If no default was found but we have images, set first as default
        if (this.defaultImageIndex === -1 && this.existingImages.length > 0) {
            this.defaultImageIndex = 0;
        }
    }

    // Populate form with property data
    populateForm(property: Property): void {
        // Find the property type value from available types
        let propertyTypeValue = 0;
        if (property.typeProperty) {
            const matchingType = this.availablePropertyTypes.find(t => 
                t.label === property.typeProperty || t.key === property.typeProperty.toLowerCase()
            );
            if (matchingType) {
                propertyTypeValue = matchingType.value;
            }
        }

        // Ensure category is a number
        let categoryValue = PropertyCategory.Location;
        if (property.category !== null && property.category !== undefined) {
            // If category is already a number, use it
            if (typeof property.category === 'number') {
                categoryValue = property.category as PropertyCategory;
            } else {
                // If it's a string or other type, convert to enum
                const categoryStr = String(property.category).toLowerCase();
                if (categoryStr === 'location') {
                    categoryValue = PropertyCategory.Location;
                } else if (categoryStr === 'vente') {
                    categoryValue = PropertyCategory.Vente;
                } else if (categoryStr === 'locationvacances' || categoryStr === 'location vacances') {
                    categoryValue = PropertyCategory.LocationVacances;
                }
            }
        }

        // Ensure payment type is a number
        let paymentTypeValue = PaymentType.Monthly;
        if (property.typePaiment !== null && property.typePaiment !== undefined) {
            if (typeof property.typePaiment === 'number') {
                paymentTypeValue = property.typePaiment;
            } else if (typeof property.typePaiment === 'string') {
                const paymentStr = property.typePaiment.toLowerCase();
                if (paymentStr === 'monthly') {
                    paymentTypeValue = PaymentType.Monthly;
                } else if (paymentStr === 'daily') {
                    paymentTypeValue = PaymentType.Daily;
                } else if (paymentStr === 'weekly') {
                    paymentTypeValue = PaymentType.Weekly;
                } else if (paymentStr === 'fixed') {
                    paymentTypeValue = PaymentType.Fixed;
                }
            }
        }

        // Populate basic form fields
        this.propertyForm.patchValue({
            propertyType: propertyTypeValue,
            category: categoryValue,
            furnished: property.furnished || false,
            price: property.price || 0,
            typePaiment: paymentTypeValue,
            name: property.name || '',
            reference: property.identifier || '',
            address: property.address || '',
            city: property.city || '',
            surfaceConstruite: property.area || 0,
            pieces: property.pieces || 0,
            chambres: property.pieces || 0, // Using pieces as chambres
            sallesDeBains: property.bathrooms || 0,
            ownerId: property.contactId || ''
        });

        // Set city search term
        this.citySearchTerm = property.city || '';
        
        // Force change detection to update UI
        this._cdr.detectChanges();

        // Populate features
        if (property.features && Array.isArray(property.features)) {
            const featuresArray = this.propertyForm.get('features') as FormArray;
            featuresArray.clear();
            property.features.forEach(feature => {
                // Add feature to the list if it doesn't exist
                if (!this.propertyFeatures.includes(feature)) {
                    this.propertyFeatures.push(feature);
                }
                featuresArray.push(this._formBuilder.control(feature));
            });
        }

        // Populate amenities (equipment)
        if (property.equipment && Array.isArray(property.equipment)) {
            const amenitiesArray = this.propertyForm.get('amenities') as FormArray;
            amenitiesArray.clear();
            property.equipment.forEach(amenity => {
                // Add amenity to the list if it doesn't exist
                if (!this.propertyAmenities.includes(amenity)) {
                    this.propertyAmenities.push(amenity);
                }
                amenitiesArray.push(this._formBuilder.control(amenity));
            });
        }

        // Set selected owner for display
        if (property.contactId) {
            const owner = this.owners.find(o => o.id === property.contactId);
            if (owner) {
                this.selectedOwnerForDisplay = owner;
                this.ownerSearchTerm = owner.name || '';
            }
        }
    }

    // Back to list or building detail
    backToList(): void {
        // If in dialog mode, close the dialog
        if (this.dialogMode && this.dialogRef) {
            this.dialogRef.close();
            return;
        }
        
        // If we came from a building (buildingId in query params), navigate back to that building
        if (this.buildingId) {
            this._router.navigate(['/building', this.buildingId]);
        } else {
            // Otherwise, navigate to property list
            this._router.navigate(['/property']);
        }
    }
    
    // Close dialog method
    closeDialog(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    // Image viewer methods
    openImageViewer(url: string, index: number): void {
        // Only work with existing images (view mode)
        if (this.existingImages.length === 0) {
            return;
        }

        // Prepare all images for the viewer from existingImages
        this.selectedImages = this.existingImages.map((img, i) => ({
            url: img.url,
            name: img.fileName || `Property Image ${i + 1}`,
            size: 0 // We don't have size info from URLs
        }));
        
        // Set the current image
        this.selectedImageIndex = index;
        this.selectedImageUrl = url;
        this.selectedImageName = this.existingImages[index]?.fileName || `Property Image ${index + 1}`;
        this.selectedImageSize = 0;
        this.isImageViewerOpen = true;
        
        // Force change detection to ensure the viewer opens
        this._cdr.detectChanges();
    }

    closeImageViewer(): void {
        this.isImageViewerOpen = false;
        this._cdr.detectChanges();
    }

    onImageChanged(newIndex: number): void {
        this.selectedImageIndex = newIndex;
        if (this.selectedImages && this.selectedImages[newIndex]) {
            this.selectedImageUrl = this.selectedImages[newIndex].url;
            this.selectedImageName = this.selectedImages[newIndex].name;
            this.selectedImageSize = this.selectedImages[newIndex].size;
        }
        this._cdr.detectChanges();
    }

    /**
     * Show alert when trying to edit while not in view mode
     */
    onInputClick(): void {
        if (this.isViewMode && !this.editMode) {
            this._errorHandlerService.showInfoAlert(
                'Edit Mode Required',
                'You cannot modify this field in view mode. Please enable edit mode to make changes.'
            );
        }
    }

    /**
     * Handle click on disabled elements (like radio buttons, checkboxes)
     */
    onDisabledElementClick(event: Event): void {
        if (this.isViewMode && !this.editMode) {
            event.preventDefault();
            event.stopPropagation();
            this._errorHandlerService.showInfoAlert(
                'Edit Mode Required',
                'You cannot modify this field in view mode. Please enable edit mode to make changes.'
            );
        }
    }

    /**
     * Toggle edit mode
     */
    toggleEditMode(enable: boolean): void {
        this.editMode = enable;
        
        // If enabling edit mode, ensure we're at the first step
        if (enable) {
            this.currentStep = 1;
        }
        
        this._cdr.markForCheck();
    }

    /**
     * Check if fields should be read-only
     */
    isReadOnly(): boolean {
        return this.isViewMode && !this.editMode;
    }

    /**
     * Check if user can edit properties
     */
    canEditProperties(): boolean {
        return this._permissionService.canEdit('properties');
    }

    /**
     * Check if user can delete properties
     */
    canDeleteProperties(): boolean {
        return this._permissionService.canDelete('properties');
    }
}
