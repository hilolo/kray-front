import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { NavigationService } from 'app/core/navigation/navigation.service';

@Component({
    selector: 'app-application-settings',
    templateUrl: './application.component.html',
    styleUrls: ['./application.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatDividerModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatOptionModule,
        MatProgressSpinnerModule,
        TranslocoModule
    ]
})
export class ApplicationSettingsComponent implements OnInit {
    settingsForm: FormGroup;
    isSaving = false;
    isLoading = true;
    currentLanguage: string = 'fr';
    formFieldHelpers: string[] = [''];
    
    // Custom features and amenities
    customFeature = '';
    customAmenity = '';
    customPropertyType = '';
    showAddFeature = false;
    showAddAmenity = false;
    showAddPropertyType = false;
    addingFeature = false;
    addingAmenity = false;
    addingPropertyType = false;

    // Default features
    defaultFeatures = [
        'Alarm', 'Furnished', 'Renovated', 'Hardwood floors', 'Fireplace', 'Fresh paint',
        'Dishwasher', 'Walk-in closets', 'Balcony, Deck, Patio', 'Internet', 'Fenced yard', 'Tile',
        'Carpet', 'Storage', 'Unfurnished'
    ];

    // Default amenities
    defaultAmenities = [
        'Parking', 'Laundry', 'Air conditioning', 'Heating', 'Swimming pool', 'Gym',
        'Security', 'Elevator', 'Balcony', 'Garden', 'Garage', 'Pet friendly'
    ];

    // Default property types
    defaultPropertyTypes = [
        'Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Vacation Rental',
        'Investment Property', 'Luxury', 'Affordable Housing', 'Student Housing',
        'Senior Living', 'Retail Space', 'Office Space', 'Warehouse', 'Land'
    ];

    // Moroccan cities list
    moroccanCities = [
        'Tanger',
        'Rabat',
        'Casablanca',
        'Kénitra'
    ];




    constructor(
        private _formBuilder: FormBuilder,
        private _errorHandlerService: ErrorHandlerService,
        private _cdr: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private _httpClient: HttpClient,
        private _authService: AuthService,
        private _navigationService: NavigationService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.currentLanguage = this._translocoService.getActiveLang();
        this._translocoService.langChanges$.subscribe(lang => {
            this.currentLanguage = lang;
        });
        this.initializeAsync();
    }

    initializeForm(): void {
        this.settingsForm = this._formBuilder.group({
            defaultCity: ['Casablanca', Validators.required],
            locationReference: ['AL', Validators.required],
            venteReference: ['AV', Validators.required],
            vacanceReference: ['VC', Validators.required],
            language: [this.currentLanguage, Validators.required],
            features: this._formBuilder.array([]),
            amenities: this._formBuilder.array([]),
            propertyTypes: this._formBuilder.array([])
        });
    }

    async initializeAsync(): Promise<void> {
        try {
            // First, try to load from localStorage for faster initial load
            const cachedSettings = this._authService.getSettings();
            
            if (cachedSettings) {
                this._populateForm(cachedSettings);
                this.isLoading = false;
                this._cdr.detectChanges();
            }
            
            // Then, load settings from API to ensure we have the latest data
            this._httpClient.get<any>(`${environment.apiUrl}/api/settings`)
                .subscribe({
                    next: (response) => {
                        const settings = response;
                        
                        // Update form with API response
                        this._populateForm(settings);
                        
                        // Update localStorage with the latest settings from API
                        this._authService.updateSettings(settings);
                        
                        this.isLoading = false;
                        this._cdr.detectChanges();
                    },
                    error: (error) => {
                        console.error('Error loading settings:', error);
                        // Use default values on error
                        this.settingsForm.patchValue({
                            defaultCity: 'Casablanca',
                            locationReference: 'AL',
                            venteReference: 'AV',
                            vacanceReference: 'VC',
                            language: this.currentLanguage
                        });
                        this.loadFeaturesAndAmenities();
                        this.isLoading = false;
                        this._cdr.detectChanges();
                    }
                });
        } catch (error) {
            console.error('Error initializing settings:', error);
            this.isLoading = false;
            this._cdr.detectChanges();
        }
    }

    private _populateForm(settings: any): void {
        // Clear existing features, amenities, and property types arrays
        while (this.featuresArray.length !== 0) {
            this.featuresArray.removeAt(0);
        }
        while (this.amenitiesArray.length !== 0) {
            this.amenitiesArray.removeAt(0);
        }
        while (this.propertyTypesArray.length !== 0) {
            this.propertyTypesArray.removeAt(0);
        }

        // Update form with settings data
        this.settingsForm.patchValue({
            defaultCity: settings.defaultCity || 'Casablanca',
            language: settings.language || this.currentLanguage
        });

        // Update category references
        if (settings.categories && settings.categories.length > 0) {
            const locationCat = settings.categories.find((c: any) => c.key === 'location');
            const venteCat = settings.categories.find((c: any) => c.key === 'vente');
            const vacanceCat = settings.categories.find((c: any) => c.key === 'vacance');
            
            if (locationCat) {
                this.settingsForm.patchValue({ locationReference: locationCat.reference || 'AL' });
            }
            if (venteCat) {
                this.settingsForm.patchValue({ venteReference: venteCat.reference || 'AV' });
            }
            if (vacanceCat) {
                this.settingsForm.patchValue({ vacanceReference: vacanceCat.reference || 'VC' });
            }
        } else {
            // Default values if categories not found
            this.settingsForm.patchValue({
                locationReference: 'AL',
                venteReference: 'AV',
                vacanceReference: 'VC'
            });
        }

        // Load features and amenities
        if (settings.features && settings.features.length > 0) {
            settings.features.forEach((feature: string) => {
                this.addFeature(feature);
            });
        } else {
            // Use default features if none from API
            this.loadFeaturesAndAmenities();
        }

        if (settings.amenities && settings.amenities.length > 0) {
            settings.amenities.forEach((amenity: string) => {
                this.addAmenity(amenity);
            });
        } else {
            // Use default amenities if none from API
            this.loadAmenitiesBatch(0);
        }

        if (settings.propertyTypes && settings.propertyTypes.length > 0) {
            settings.propertyTypes.forEach((propertyType: string) => {
                this.addPropertyType(propertyType);
            });
        } else {
            // Use default property types if none from API
            this.loadPropertyTypesBatch(0);
        }
    }

    private loadFeaturesAndAmenities(): void {
        // Initialize features in batches to avoid blocking
        this.loadFeaturesBatch(0);
        this.loadAmenitiesBatch(0);
        this.loadPropertyTypesBatch(0);
    }

    private loadFeaturesBatch(startIndex: number): void {
        const batchSize = 5;
        const endIndex = Math.min(startIndex + batchSize, this.defaultFeatures.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            this.addFeature(this.defaultFeatures[i]);
        }
        
        if (endIndex < this.defaultFeatures.length) {
            setTimeout(() => this.loadFeaturesBatch(endIndex), 10);
        }
    }

    private loadAmenitiesBatch(startIndex: number): void {
        const batchSize = 5;
        const endIndex = Math.min(startIndex + batchSize, this.defaultAmenities.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            this.addAmenity(this.defaultAmenities[i]);
        }
        
        if (endIndex < this.defaultAmenities.length) {
            setTimeout(() => this.loadAmenitiesBatch(endIndex), 10);
        }
    }

    private loadPropertyTypesBatch(startIndex: number): void {
        const batchSize = 5;
        const endIndex = Math.min(startIndex + batchSize, this.defaultPropertyTypes.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            this.addPropertyType(this.defaultPropertyTypes[i]);
        }
        
        if (endIndex < this.defaultPropertyTypes.length) {
            setTimeout(() => this.loadPropertyTypesBatch(endIndex), 10);
        }
    }


    get featuresArray(): FormArray {
        return this.settingsForm.get('features') as FormArray;
    }

    get amenitiesArray(): FormArray {
        return this.settingsForm.get('amenities') as FormArray;
    }

    get propertyTypesArray(): FormArray {
        return this.settingsForm.get('propertyTypes') as FormArray;
    }


    addFeature(feature: string = ''): void {
        this.featuresArray.push(this._formBuilder.control(feature, Validators.required));
    }

    addAmenity(amenity: string = ''): void {
        this.amenitiesArray.push(this._formBuilder.control(amenity, Validators.required));
    }

    addPropertyType(propertyType: string = ''): void {
        this.propertyTypesArray.push(this._formBuilder.control(propertyType, Validators.required));
    }


    removeFeature(index: number): void {
        this.featuresArray.removeAt(index);
    }

    removeAmenity(index: number): void {
        this.amenitiesArray.removeAt(index);
    }

    removePropertyType(index: number): void {
        this.propertyTypesArray.removeAt(index);
    }

    toggleFeature(index: number): void {
        // For settings, we don't need toggle functionality, just display
    }

    toggleAmenity(index: number): void {
        // For settings, we don't need toggle functionality, just display
    }

    isFeatureSelected(index: number): boolean {
        return false; // For settings, we don't need selection state
    }

    isAmenitySelected(index: number): boolean {
        return false; // For settings, we don't need selection state
    }

    togglePropertyType(index: number): void {
        // For settings, we don't need toggle functionality, just display
    }

    isPropertyTypeSelected(index: number): boolean {
        return false; // For settings, we don't need selection state
    }

    startAddingFeature(): void {
        this.addingFeature = true;
        this.customFeature = '';
    }

    startAddingAmenity(): void {
        this.addingAmenity = true;
        this.customAmenity = '';
    }

    startAddingPropertyType(): void {
        this.addingPropertyType = true;
        this.customPropertyType = '';
    }

    confirmAddFeature(): void {
        if (this.customFeature.trim()) {
            this.addFeature(this.customFeature.trim());
            this.customFeature = '';
        }
        this.addingFeature = false;
    }

    confirmAddAmenity(): void {
        if (this.customAmenity.trim()) {
            this.addAmenity(this.customAmenity.trim());
            this.customAmenity = '';
        }
        this.addingAmenity = false;
    }

    confirmAddPropertyType(): void {
        if (this.customPropertyType.trim()) {
            this.addPropertyType(this.customPropertyType.trim());
            this.customPropertyType = '';
        }
        this.addingPropertyType = false;
    }

    cancelAddFeature(): void {
        this.addingFeature = false;
        this.customFeature = '';
    }

    cancelAddAmenity(): void {
        this.addingAmenity = false;
        this.customAmenity = '';
    }

    cancelAddPropertyType(): void {
        this.addingPropertyType = false;
        this.customPropertyType = '';
    }

    // Prevent form submission when Enter is pressed in input fields
    onInputKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            // Don't call the confirm methods here as they're handled by keyup.enter
        }
    }

    saveSettings(): void {
        if (this.settingsForm.valid) {
            this.isSaving = true;
            
            // Get the selected language from the form
            const selectedLanguage = this.settingsForm.get('language')?.value;
            
            // Get form values
            const formValues = this.settingsForm.value;
            
            // Extract features, amenities, and property types from form arrays
            const features = formValues.features || [];
            const amenities = formValues.amenities || [];
            const propertyTypes = formValues.propertyTypes || [];
            
            // Prepare the update payload
            const updatePayload = {
                defaultCity: formValues.defaultCity,
                language: formValues.language,
                categories: [
                    {
                        key: 'location',
                        reference: formValues.locationReference
                    },
                    {
                        key: 'vente',
                        reference: formValues.venteReference
                    },
                    {
                        key: 'vacance',
                        reference: formValues.vacanceReference
                    }
                ],
                features: features,
                amenities: amenities,
                propertyTypes: propertyTypes
            };
            
            // Call the API to update settings
            this._httpClient.put(`${environment.apiUrl}/api/settings`, updatePayload)
                .subscribe({
                    next: (response: any) => {
                        this.isSaving = false;
                        
                        // Update localStorage with the new settings
                        this._authService.updateSettings(response);
                        
                        // Change language after successful save
                        if (selectedLanguage && selectedLanguage !== this.currentLanguage) {
                            // Update the language in the auth service settings first
                            const currentSettings = this._authService.getSettings();
                            if (currentSettings) {
                                const updatedSettings = { ...currentSettings, language: selectedLanguage };
                                this._authService.updateSettings(updatedSettings);
                            }
                            
                            // Set the new language - this will trigger langChanges$ observable
                            this._translocoService.setActiveLang(selectedLanguage);
                            this.currentLanguage = selectedLanguage;
                            
                            // Force change detection to ensure UI updates
                            this._cdr.detectChanges();
                            
                            // Reload navigation with new language
                            this._navigationService.get(selectedLanguage).subscribe();
                        }
                        
                        this._errorHandlerService.showSuccessAlert(
                            'Settings Saved',
                            'Application settings have been saved successfully.'
                        );
                        this._cdr.detectChanges();
                    },
                    error: (error) => {
                        this.isSaving = false;
                        this._errorHandlerService.showErrorAlert(
                            'Error',
                            'Failed to save settings. Please try again.'
                        );
                        this._cdr.detectChanges();
                    }
                });
        } else {
            this._errorHandlerService.showErrorAlert(
                'Validation Error',
                'Please fill in all required fields.'
            );
        }
    }


}
