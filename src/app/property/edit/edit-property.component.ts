import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { ContentComponent } from '@shared/components/layout/content.component';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { PropertyService } from '@shared/services/property.service';
import { UserService } from '@shared/services/user.service';
import { ContactService } from '@shared/services/contact.service';
import type { Property } from '@shared/models/property/property.model';
import { PropertyCategory, TypePaiment, AttachmentDetails } from '@shared/models/property/property.model';
import type { CreatePropertyRequest, PropertyImageInput } from '@shared/models/property/create-property-request.model';
import type { UpdatePropertyRequest } from '@shared/models/property/update-property-request.model';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';
import type { Category } from '@shared/models/settings/category.model';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  isDefault: boolean;
}

interface ExistingImage {
  id: string;
  url: string;
  fileName: string;
  isDefault: boolean;
}

type PropertyFormData = {
  identifier: string;
  name: string;
  description: string;
  address: string;
  city: string;
  typeProperty: string;
  area: number;
  pieces: number;
  bathrooms: number;
  furnished: boolean;
  price: number;
  typePaiment: TypePaiment;
  buildingId: string;
  contactId: string;
  features: string[];
  equipment: string[];
  category: PropertyCategory;
  isPublic: boolean;
  isPublicAdresse: boolean;
  isShared: boolean;
};

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutComponent,
    ContentComponent,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputGroupComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardCheckboxComponent,
    ZardCardComponent,
    ZardImageHoverPreviewDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-property.component.html',
})
export class EditPropertyComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly userService = inject(UserService);
  private readonly contactService = inject(ContactService);
  private readonly destroy$ = new Subject<void>();

  // Effect to sync default city after settings load
  private readonly cityEffect = effect(() => {
    const defaultCity = this.defaultCity();
    const currentCity = this.formData().city;
    const isEdit = this.isEditMode();
    
    if (defaultCity && !isEdit && (!currentCity || currentCity.trim() === '')) {
      console.log('[Default City] Effect triggered - Setting city:', defaultCity, 'Current city:', currentCity, 'Is edit:', isEdit);
      // Use setTimeout to ensure this runs after the initial form setup and select component initialization
      setTimeout(() => {
        this.formData.update(data => ({
          ...data,
          city: defaultCity,
        }));
        console.log('[Default City] City set via effect:', this.formData().city);
        // Force change detection by updating the signal again
        setTimeout(() => {
          console.log('[Default City] Final city value:', this.formData().city);
        }, 100);
      }, 100);
    }
  });

  readonly propertyId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.propertyId() !== null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly formSubmitted = signal(false);

  // Form data
  readonly formData = signal({
    identifier: '',
    name: '',
    description: '',
    address: '',
    city: '',
    typeProperty: '',
    area: 0,
    pieces: 0,
    bathrooms: 0,
    furnished: false,
    price: 0,
    typePaiment: TypePaiment.Monthly,
    buildingId: '',
    contactId: '',
    features: [] as string[],
    equipment: [] as string[],
    category: PropertyCategory.Location,
    isPublic: false,
    isPublicAdresse: false,
    isShared: false,
  });

  // Images
  readonly uploadedImages = signal<UploadedImage[]>([]);
  readonly existingImages = signal<ExistingImage[]>([]);
  readonly imagesToDelete = signal<Set<string>>(new Set());
  readonly imageInput = viewChild<ElementRef<HTMLInputElement>>('imageInput');

  // Contacts/Owners
  readonly owners = signal<Contact[]>([]);
  readonly isLoadingOwners = signal(false);

  // Settings
  readonly propertyTypes = signal<string[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly defaultCity = signal<string>('');
  
  // City options (same as in settings)
  readonly cityOptions = ['Tanger', 'Casablanca', 'Rabat', 'Kenitra', 'Agadir'];

  // Icon templates
  readonly homeIconTemplate = viewChild.required<TemplateRef<void>>('homeIconTemplate');
  readonly mapPinIconTemplate = viewChild.required<TemplateRef<void>>('mapPinIconTemplate');
  readonly buildingIconTemplate = viewChild.required<TemplateRef<void>>('buildingIconTemplate');
  readonly squareIconTemplate = viewChild.required<TemplateRef<void>>('squareIconTemplate');
  readonly banknoteIconTemplate = viewChild.required<TemplateRef<void>>('banknoteIconTemplate');
  readonly userIconTemplate = viewChild.required<TemplateRef<void>>('userIconTemplate');

  // Computed values
  readonly allImages = computed(() => {
    const images: Array<{ id: string; url: string; isDefault: boolean; isUploaded: boolean }> = [];
    
    // Add existing images (not marked for deletion)
    const toDelete = this.imagesToDelete();
    this.existingImages().forEach(img => {
      if (!toDelete.has(img.id)) {
        images.push({
          id: img.id,
          url: img.url,
          isDefault: img.isDefault,
          isUploaded: true,
        });
      }
    });
    
    // Add uploaded images
    this.uploadedImages().forEach(img => {
      images.push({
        id: img.id,
        url: img.preview,
        isDefault: img.isDefault,
        isUploaded: false,
      });
    });
    
    return images;
  });

  readonly defaultImage = computed(() => {
    const images = this.allImages();
    return images.find(img => img.isDefault) || images[0] || null;
  });

  readonly hasImages = computed(() => this.allImages().length > 0);

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.identifier.trim() !== '' &&
      data.name.trim() !== '' &&
      data.typeProperty.trim() !== '' &&
      data.area > 0 &&
      data.pieces > 0 &&
      data.price > 0 &&
      data.contactId !== ''
    );
  });

  // Error messages
  readonly identifierError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().identifier;
    if (!value || value.trim() === '') {
      return 'Identifier is required';
    }
    return '';
  });

  readonly nameError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().name;
    if (!value || value.trim() === '') {
      return 'Name is required';
    }
    return '';
  });

  readonly areaError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().area;
    if (value <= 0) {
      return 'Area must be greater than 0';
    }
    return '';
  });

  readonly piecesError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().pieces;
    if (value <= 0) {
      return 'Pieces must be greater than 0';
    }
    return '';
  });

  readonly priceError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().price;
    if (value <= 0) {
      return 'Price must be greater than 0';
    }
    return '';
  });

  readonly contactIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().contactId;
    if (!value || value.trim() === '') {
      return 'Owner is required';
    }
    return '';
  });

  readonly typePropertyError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().typeProperty;
    if (!value || value.trim() === '') {
      return 'Type Property is required';
    }
    return '';
  });

  // Error states
  readonly identifierHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().identifier || this.formData().identifier.trim() === '');
  });

  readonly nameHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().name || this.formData().name.trim() === '');
  });

  readonly areaHasError = computed(() => {
    return this.formSubmitted() && this.formData().area <= 0;
  });

  readonly piecesHasError = computed(() => {
    return this.formSubmitted() && this.formData().pieces <= 0;
  });

  readonly priceHasError = computed(() => {
    return this.formSubmitted() && this.formData().price <= 0;
  });

  readonly contactIdHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().contactId || this.formData().contactId.trim() === '');
  });

  readonly typePropertyHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().typeProperty || this.formData().typeProperty.trim() === '');
  });

  // Enums for template
  readonly PropertyCategory = PropertyCategory;
  readonly TypePaiment = TypePaiment;

  readonly categoryOptions = [
    { value: PropertyCategory.Location, label: 'Location' },
    { value: PropertyCategory.Vente, label: 'Vente' },
    { value: PropertyCategory.LocationVacances, label: 'Location Vacances' },
  ];

  readonly typePaimentOptions = [
    { value: TypePaiment.Monthly, label: 'Monthly' },
    { value: TypePaiment.Daily, label: 'Daily' },
    { value: TypePaiment.Weekly, label: 'Weekly' },
    { value: TypePaiment.Fixed, label: 'Fixed' },
  ];

  ngOnInit(): void {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'add') {
      this.propertyId.set(id);
      this.loadProperty(id);
    }

    // Load owners
    this.loadOwners();

    // Load settings (property types and categories)
    this.loadSettings();

    // Listen to route changes
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const updatedId = params.get('id');
      if (updatedId && updatedId !== 'add') {
        if (updatedId !== this.propertyId()) {
          this.propertyId.set(updatedId);
          this.loadProperty(updatedId);
        }
      } else {
        this.propertyId.set(null);
        this.resetForm();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProperty(id: string): void {
    this.isLoading.set(true);
    
    this.propertyService.getById(id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (property) => {
          this.populateFormFromProperty(property);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading property:', error);
          this.isLoading.set(false);
        },
      });
  }

  private populateFormFromProperty(property: Property): void {
    // If city from property is not in the options, use default city or empty
    let city = property.city || '';
    if (city && !this.cityOptions.includes(city)) {
      city = this.defaultCity() || '';
    }
    
    this.formData.set({
      identifier: property.identifier || '',
      name: property.name || '',
      description: property.description || '',
      address: property.address || '',
      city: city,
      typeProperty: property.typeProperty || '',
      area: property.area || 0,
      pieces: property.pieces || 0,
      bathrooms: property.bathrooms || 0,
      furnished: property.furnished || false,
      price: property.price || 0,
      typePaiment: property.typePaiment || TypePaiment.Monthly,
      buildingId: property.buildingId || '',
      contactId: property.contactId || '',
      features: property.features ? [...property.features] : [],
      equipment: property.equipment ? [...property.equipment] : [],
      category: property.category || PropertyCategory.Location,
      isPublic: property.isPublic || false,
      isPublicAdresse: property.isPublicAdresse || false,
      isShared: property.isShared || false,
    });

    // Set existing images
    if (property.attachments && property.attachments.length > 0) {
      const existing: ExistingImage[] = property.attachments.map(att => ({
        id: att.id,
        url: att.url,
        fileName: att.fileName,
        isDefault: property.defaultAttachmentId === att.id,
      }));
      this.existingImages.set(existing);
    } else {
      this.existingImages.set([]);
    }

    // Reset images to delete
    this.imagesToDelete.set(new Set());
    this.uploadedImages.set([]);
  }

  private resetForm(): void {
    this.formData.set({
      identifier: '',
      name: '',
      description: '',
      address: '',
      city: '',
      typeProperty: '',
      area: 0,
      pieces: 0,
      bathrooms: 0,
      furnished: false,
      price: 0,
      typePaiment: TypePaiment.Monthly,
      buildingId: '',
      contactId: '',
      features: [],
      equipment: [],
      category: PropertyCategory.Location,
      isPublic: false,
      isPublicAdresse: false,
      isShared: false,
    });
    this.existingImages.set([]);
    this.uploadedImages.set([]);
    this.imagesToDelete.set(new Set());
    this.formSubmitted.set(false);
  }

  loadOwners(): void {
    this.isLoadingOwners.set(true);
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: false,
      type: ContactType.Owner,
    };
    
    this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.owners.set(response.result);
        this.isLoadingOwners.set(false);
      },
      error: (error) => {
        console.error('Error loading owners:', error);
        this.isLoadingOwners.set(false);
      },
    });
  }

  loadSettings(): void {
    try {
      const settingsStr = localStorage.getItem('settings');
      
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        
        if (settings.propertyTypes && Array.isArray(settings.propertyTypes)) {
          this.propertyTypes.set(settings.propertyTypes);
        }
        
        if (settings.categories && Array.isArray(settings.categories)) {
          this.categories.set(settings.categories);
        }
        
        if (settings.defaultCity) {
          console.log('[Default City] Found in settings:', settings.defaultCity);
          this.defaultCity.set(settings.defaultCity);
        } else {
          console.log('[Default City] No defaultCity found in settings');
        }
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  }

  /**
   * Generate identifier based on category reference + 8 random numbers
   */
  generateIdentifier(): void {
    const category = this.formData().category;
    const reference = this.getCategoryReference(category);
    
    if (!reference) {
      console.warn('Cannot generate identifier: category reference not found');
      return;
    }
    
    // Generate 8 random digits
    const randomNumbers = Math.floor(10000000 + Math.random() * 90000000).toString();
    const generatedIdentifier = `${reference}${randomNumbers}`;
    
    this.updateField('identifier', generatedIdentifier);
  }

  /**
   * Get category reference based on PropertyCategory enum
   */
  getCategoryReference(category: PropertyCategory): string {
    const categoryKey = this.getCategoryKey(category);
    const categoryData = this.categories().find(cat => cat.key === categoryKey);
    return categoryData?.reference || '';
  }

  /**
   * Convert PropertyCategory enum to category key
   */
  private getCategoryKey(category: PropertyCategory): string {
    switch (category) {
      case PropertyCategory.Location:
        return 'location';
      case PropertyCategory.Vente:
        return 'vente';
      case PropertyCategory.LocationVacances:
        return 'vacance';
      default:
        return '';
    }
  }

  /**
   * Handle category change - auto-fill identifier with reference
   */
  onCategoryChange(category: PropertyCategory): void {
    // Get previous category reference before updating
    const previousCategory = this.formData().category;
    const previousReference = this.getCategoryReference(previousCategory);
    const currentIdentifier = this.formData().identifier;
    
    // Update category field directly (without triggering onCategoryChange again)
    this.formData.update(data => ({
      ...data,
      category: category,
    }));
    
    // Auto-fill identifier with category reference if identifier is empty or matches previous category reference
    if (!currentIdentifier || currentIdentifier.trim() === '' || currentIdentifier === previousReference) {
      const newReference = this.getCategoryReference(category);
      if (newReference) {
        this.formData.update(data => ({
          ...data,
          identifier: newReference,
        }));
      }
    }
  }

  getOwnerDisplayName(contact: Contact): string {
    if (contact.isACompany && contact.companyName) {
      return contact.companyName;
    }
    const firstName = contact.firstName || '';
    const lastName = contact.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    return name || contact.identifier || 'Unnamed Owner';
  }

  // Image handlers
  onImageClick(): void {
    this.imageInput()?.nativeElement.click();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const newImages: UploadedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`File "${file.name}" is not an image. Please select image files only.`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`Image "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          const imageId = `img-${Date.now()}-${i}`;
          
          const uploadedImage: UploadedImage = {
            id: imageId,
            file: file,
            preview: preview,
            name: file.name,
            size: file.size,
            isDefault: false,
          };

          // If this is the first image and no default exists, make it default
          const allImages = this.allImages();
          if (allImages.length === 0) {
            uploadedImage.isDefault = true;
          }

          this.uploadedImages.update(images => [...images, uploadedImage]);
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset input
    input.value = '';
  }

  onRemoveImage(imageId: string, isUploaded: boolean): void {
    if (isUploaded) {
      this.uploadedImages.update(images => {
        const updated = images.filter(img => img.id !== imageId);
        // If removed image was default, make first image default
        const removed = images.find(img => img.id === imageId);
        if (removed?.isDefault && updated.length > 0) {
          updated[0].isDefault = true;
        }
        return updated;
      });
    } else {
      // Mark existing image for deletion
      this.imagesToDelete.update(set => {
        const newSet = new Set(set);
        newSet.add(imageId);
        return newSet;
      });
      
      // If deleted image was default, make first remaining image default
      const existing = this.existingImages().find(img => img.id === imageId);
      if (existing?.isDefault) {
        const remaining = this.allImages().filter(img => img.id !== imageId);
        if (remaining.length > 0) {
          if (remaining[0].isUploaded) {
            this.uploadedImages.update(images => {
              if (images.length > 0) {
                images[0].isDefault = true;
              }
              return images;
            });
          } else {
            this.existingImages.update(images => {
              const img = images.find(i => i.id === remaining[0].id);
              if (img) {
                img.isDefault = true;
              }
              return images;
            });
          }
        }
      }
    }
  }

  onSetDefaultImage(imageId: string, isUploaded: boolean): void {
    // Clear all defaults
    this.uploadedImages.update(images => 
      images.map(img => ({ ...img, isDefault: img.id === imageId }))
    );
    
    this.existingImages.update(images => 
      images.map(img => ({ ...img, isDefault: img.id === imageId }))
    );
  }

  // Form submission
  onSave(): void {
    this.formSubmitted.set(true);

    if (!this.isFormValid()) {
      return;
    }

    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !currentUser.companyId) {
      console.error('User or company ID not found');
      return;
    }

    this.isSaving.set(true);

    const data = this.formData();
    const propertyId = this.propertyId();

    if (propertyId && this.isEditMode()) {
      // Update existing property
      this.prepareUpdateRequest(data, propertyId, currentUser.companyId)
        .then((request) => {
          this.propertyService.update(propertyId, request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.formSubmitted.set(false);
                this.isSaving.set(false);
                this.router.navigate(['/property']);
              },
              error: (error) => {
                console.error('Error updating property:', error);
                this.isSaving.set(false);
              },
            });
        })
        .catch((error) => {
          console.error('Error preparing update request:', error);
          this.isSaving.set(false);
        });
    } else {
      // Create new property
      this.prepareCreateRequest(data, currentUser.companyId)
        .then((request) => {
          this.propertyService.create(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.formSubmitted.set(false);
                this.isSaving.set(false);
                this.router.navigate(['/property']);
              },
              error: (error) => {
                console.error('Error creating property:', error);
                this.isSaving.set(false);
              },
            });
        })
        .catch((error) => {
          console.error('Error preparing create request:', error);
          this.isSaving.set(false);
        });
    }
  }

  private async prepareCreateRequest(
    formData: PropertyFormData,
    companyId: string
  ): Promise<CreatePropertyRequest> {
    const request: CreatePropertyRequest = {
      identifier: formData.identifier.trim(),
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      typeProperty: formData.typeProperty?.trim() || undefined,
      area: formData.area,
      pieces: formData.pieces,
      bathrooms: formData.bathrooms,
      furnished: formData.furnished,
      price: formData.price,
      typePaiment: formData.typePaiment,
      buildingId: formData.buildingId || undefined,
      contactId: formData.contactId,
      companyId: companyId,
      features: formData.features.length > 0 ? formData.features : undefined,
      equipment: formData.equipment.length > 0 ? formData.equipment : undefined,
      category: formData.category,
      isPublic: formData.isPublic,
      isPublicAdresse: formData.isPublicAdresse,
      isShared: formData.isShared,
    };

    // Convert uploaded images to PropertyImageInput
    const uploadedImages = this.uploadedImages();
    if (uploadedImages.length > 0) {
      try {
        const images: PropertyImageInput[] = await Promise.all(
          uploadedImages.map(async (uploadedImage) => {
            const base64Content = await this.fileToBase64(uploadedImage.file);
            return {
              fileName: uploadedImage.name,
              base64Content: base64Content,
              isDefault: uploadedImage.isDefault,
            };
          })
        );
        request.images = images;
        
        // Set default image ID
        const defaultImage = uploadedImages.find(img => img.isDefault);
        if (defaultImage) {
          // The backend will set this based on isDefault flag in images array
        }
      } catch (error) {
        console.error('Error converting images to base64:', error);
      }
    }

    return request;
  }

  private async prepareUpdateRequest(
    formData: PropertyFormData,
    propertyId: string,
    companyId: string
  ): Promise<UpdatePropertyRequest> {
    const request: UpdatePropertyRequest = {
      id: propertyId,
      identifier: formData.identifier.trim() || undefined,
      name: formData.name.trim() || undefined,
      description: formData.description?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      typeProperty: formData.typeProperty?.trim() || undefined,
      area: formData.area || undefined,
      pieces: formData.pieces || undefined,
      bathrooms: formData.bathrooms || undefined,
      furnished: formData.furnished,
      price: formData.price || undefined,
      typePaiment: formData.typePaiment,
      buildingId: formData.buildingId || undefined,
      contactId: formData.contactId || undefined,
      features: formData.features.length > 0 ? formData.features : undefined,
      equipment: formData.equipment.length > 0 ? formData.equipment : undefined,
      category: formData.category,
      isPublic: formData.isPublic,
      isPublicAdresse: formData.isPublicAdresse,
      isShared: formData.isShared,
    };

    // Convert uploaded images to PropertyImageInput
    const uploadedImages = this.uploadedImages();
    if (uploadedImages.length > 0) {
      try {
        const images: PropertyImageInput[] = await Promise.all(
          uploadedImages.map(async (uploadedImage) => {
            const base64Content = await this.fileToBase64(uploadedImage.file);
            return {
              fileName: uploadedImage.name,
              base64Content: base64Content,
              isDefault: uploadedImage.isDefault,
            };
          })
        );
        request.imagesToAdd = images;
      } catch (error) {
        console.error('Error converting images to base64:', error);
      }
    }

    // Set default attachment ID
    const defaultImage = this.defaultImage();
    if (defaultImage) {
      request.defaultAttachmentId = defaultImage.id;
    }

    // Handle images to delete
    const imagesToDelete = Array.from(this.imagesToDelete());
    if (imagesToDelete.length > 0) {
      request.attachmentsToDelete = imagesToDelete;
    }

    return request;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  onCancel(): void {
    this.router.navigate(['/property']);
  }

  updateField<K extends keyof PropertyFormData>(
    field: K,
    value: PropertyFormData[K]
  ): void {
    if (field === 'city') {
      console.log('[Default City] updateField called for city:', value);
    }
    this.formData.update(data => ({
      ...data,
      [field]: value,
    }));
  }

  getTypePaimentLabel(): string {
    const option = this.typePaimentOptions.find(o => o.value === this.formData().typePaiment);
    return option?.label || 'Select';
  }

  getCategoryLabel(): string {
    const option = this.categoryOptions.find(o => o.value === this.formData().category);
    return option?.label || 'Select';
  }

  getOwnerLabel(): string {
    const contactId = this.formData().contactId;
    if (!contactId) return 'Select owner';
    const owner = this.owners().find(o => o.id === contactId);
    return owner ? this.getOwnerDisplayName(owner) : 'Select owner';
  }
}
