import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { KeyService } from '@shared/services/key.service';
import { PropertyService } from '@shared/services/property.service';
import type { Key } from '@shared/models/key/key.model';
import type { CreateKeyRequest, KeyImageInput } from '@shared/models/key/create-key-request.model';
import type { UpdateKeyRequest } from '@shared/models/key/update-key-request.model';
import type { Property as PropertyModel } from '@shared/models/property/property.model';
import type { AttachmentDetails } from '@shared/models/property/property.model';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';

type KeyFormData = {
  name: string;
  description: string;
  propertyId: string;
};

@Component({
  selector: 'app-edit-key',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputGroupComponent,
    ZardCardComponent,
    ZardComboboxComponent,
    ZardImageHoverPreviewDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-key.component.html',
})
export class EditKeyComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly keyService = inject(KeyService);
  private readonly propertyService = inject(PropertyService);
  readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly dialogData = inject<{ keyId?: string }>(Z_MODAL_DATA, { optional: true });
  private readonly destroy$ = new Subject<void>();

  readonly keyId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.keyId() !== null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isDialogMode = computed(() => this.dialogRef !== null);
  readonly formSubmitted = signal(false);

  // Form data
  readonly formData = signal<KeyFormData>({
    name: '',
    description: '',
    propertyId: '',
  });

  // Properties/Owners
  readonly properties = signal<PropertyModel[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingProperties = signal(false);

  // Icon templates for input groups
  readonly keyIconTemplate = viewChild.required<TemplateRef<void>>('keyIconTemplate');
  readonly buildingIconTemplate = viewChild.required<TemplateRef<void>>('buildingIconTemplate');
  readonly imageInput = viewChild<ElementRef<HTMLInputElement>>('imageInput');

  // Image management
  readonly uploadedImages = signal<Array<{
    id: string;
    file: File;
    preview: string;
    name: string;
    size: number;
    isDefault: boolean;
  }>>([]);
  readonly existingImages = signal<Array<{
    id: string;
    url: string;
    fileName: string;
    isDefault: boolean;
  }>>([]);
  readonly imagesToDelete = signal<Set<string>>(new Set());


  // Computed values for images
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

  readonly hasImages = computed(() => this.allImages().length > 0);

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.name.trim() !== '' &&
      data.propertyId !== ''
    );
  });

  // Error messages
  readonly nameError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().name;
    if (!value || value.trim() === '') {
      return 'Name is required';
    }
    return '';
  });

  readonly propertyIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().propertyId;
    if (!value || value.trim() === '') {
      return 'Property is required';
    }
    return '';
  });

  // Error states
  readonly nameHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().name || this.formData().name.trim() === '');
  });

  readonly propertyIdHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().propertyId || this.formData().propertyId.trim() === '');
  });

  ngOnInit(): void {
    // Check if we're in dialog mode
    if (this.dialogData?.keyId) {
      // Dialog mode - use keyId from dialog data
      this.keyId.set(this.dialogData.keyId);
      this.loadKey(this.dialogData.keyId);
    } else if (!this.isDialogMode()) {
      // Page mode - check route params
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'add') {
        this.keyId.set(id);
        this.loadKey(id);
      }

      // Listen to route changes (only in page mode)
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const updatedId = params.get('id');
        if (updatedId && updatedId !== 'add') {
          if (updatedId !== this.keyId()) {
            this.keyId.set(updatedId);
            this.loadKey(updatedId);
          }
        } else {
          this.keyId.set(null);
          this.resetForm();
        }
      });
    }

    // Load properties
    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadKey(id: string): void {
    this.isLoading.set(true);
    
    this.keyService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (key) => {
          this.populateFormFromKey(key);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading key:', error);
          this.isLoading.set(false);
        },
      });
  }

  private populateFormFromKey(key: Key): void {
    this.formData.set({
      name: key.name || '',
      description: key.description || '',
      propertyId: key.propertyId || '',
    });
    
    // Populate existing image from defaultAttachmentUrl (like BuildingService)
    if (key.defaultAttachmentUrl && key.defaultAttachmentId) {
      this.existingImages.set([{
        id: key.defaultAttachmentId,
        url: key.defaultAttachmentUrl,
        fileName: 'Key image',
        isDefault: true,
      }]);
    } else {
      this.existingImages.set([]);
    }
  }

  private resetForm(): void {
    this.formData.set({
      name: '',
      description: '',
      propertyId: '',
    });
    this.formSubmitted.set(false);
    this.uploadedImages.set([]);
    this.existingImages.set([]);
    this.imagesToDelete.set(new Set());
  }

  loadProperties(): void {
    this.isLoadingProperties.set(true);
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: false,
    };
    
    this.propertyService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.properties.set(response.result);
        // Convert properties to combobox options
        const options: ZardComboboxOption[] = response.result.map(property => ({
          value: property.id,
          label: this.getPropertyDisplayName(property),
        }));
        this.propertyOptions.set(options);
        this.isLoadingProperties.set(false);
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.isLoadingProperties.set(false);
      },
    });
  }

  getPropertyDisplayName(property: PropertyModel): string {
    let name = property.name || property.identifier || 'Unnamed Property';
    
    // Add identifier if available and different from name
    if (property.identifier && property.identifier !== name) {
      return `${name} (${property.identifier})`;
    }
    return name;
  }

  // Helper to get key image URL for header avatar
  getKeyImageUrl(): string | null {
    const images = this.allImages();
    if (images.length > 0) {
      return images[0].url;
    }
    return null;
  }


  // Image handlers
  onImageClick(): void {
    this.imageInput()?.nativeElement.click();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      // Since keys only support a single image, clear existing images when a new one is uploaded
      // Mark all existing images for deletion
      const existingImgs = this.existingImages();
      if (existingImgs.length > 0) {
        const existingIds = new Set(existingImgs.map(img => img.id));
        this.imagesToDelete.update(set => {
          const newSet = new Set(set);
          existingIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }
      
      // Clear any previously uploaded images
      this.uploadedImages.set([]);

      // Process the first file only (keys support single image)
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image. Please select image files only.`);
        input.value = '';
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Image "${file.name}" is too large. Maximum size is 10MB.`);
        input.value = '';
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const imageId = `img-${Date.now()}`;
        
        const uploadedImage = {
          id: imageId,
          file: file,
          preview: preview,
          name: file.name,
          size: file.size,
          isDefault: true, // Always default since it's the only image
        };

        // Set as the only uploaded image
        this.uploadedImages.set([uploadedImage]);
      };
      reader.readAsDataURL(file);
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

  // Helper to convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Form submission
  async onSave(): Promise<void> {
    // Mark form as submitted to show validation errors
    this.formSubmitted.set(true);

    // Guard: prevent execution if form is invalid
    if (!this.isFormValid()) {
      return;
    }

    // Set loading state
    this.isSaving.set(true);

    const data = this.formData();
    const keyId = this.keyId();

    // Check if we're in edit mode
    if (keyId && this.isEditMode()) {
      // Prepare image (single image like BuildingService)
      let image: KeyImageInput | undefined;
      const uploadedImgs = this.uploadedImages();
      
      if (uploadedImgs.length > 0) {
        // Use the first uploaded image
        const img = uploadedImgs[0];
        const base64 = await this.fileToBase64(img.file);
        image = {
          fileName: img.name,
          base64Content: base64,
        };
      }

      // Update existing key
      const request: UpdateKeyRequest = {
        id: keyId,
        name: data.name.trim(),
        description: data.description.trim() || '',
        propertyId: data.propertyId,
        image: image,
      };

      this.keyService.update(keyId, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedKey) => {
            // Reset form submitted state on successful submission
            this.formSubmitted.set(false);
            this.isSaving.set(false);
            
            // If in dialog mode, close dialog
            if (this.dialogRef) {
              this.dialogRef.close({ keyId: updatedKey.id });
            } else {
              // Navigate back to list
              this.router.navigate(['/keys']);
            }
          },
          error: (error) => {
            console.error('Error updating key:', error);
            this.isSaving.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
    } else {
      // Prepare image for create (single image like BuildingService)
      let image: KeyImageInput | undefined;
      const uploadedImgs = this.uploadedImages();
      
      if (uploadedImgs.length > 0) {
        // Use the first uploaded image
        const img = uploadedImgs[0];
        const base64 = await this.fileToBase64(img.file);
        image = {
          fileName: img.name,
          base64Content: base64,
        };
      }

      // Create new key
      const request: CreateKeyRequest = {
        name: data.name.trim(),
        description: data.description.trim() || '',
        propertyId: data.propertyId,
        image: image,
      };

      this.keyService.create(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdKey) => {
            // Reset form submitted state on successful submission
            this.formSubmitted.set(false);
            this.isSaving.set(false);
            
            // If in dialog mode, close dialog
            if (this.dialogRef) {
              this.dialogRef.close({ keyId: createdKey.id });
            } else {
              // Navigate back to list
              this.router.navigate(['/keys']);
            }
          },
          error: (error) => {
            console.error('Error creating key:', error);
            this.isSaving.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
    }
  }

  onCancel(): void {
    // If in dialog mode, close dialog
    if (this.isDialogMode() && this.dialogRef) {
      this.dialogRef.close();
    } else {
      // Navigate back to list
      this.router.navigate(['/keys']);
    }
  }


  // Update form field helper
  updateField<K extends keyof KeyFormData>(field: K, value: KeyFormData[K]): void {
    this.formData.update(data => ({
      ...data,
      [field]: value,
    }));
  }
}

