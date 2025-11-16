import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { BuildingService } from '@shared/services/building.service';
import { PropertyService } from '@shared/services/property.service';
import { UserService } from '@shared/services/user.service';
import { ToastService } from '@shared/services/toast.service';
import type { Building } from '@shared/models/building/building.model';
import type { CreateBuildingRequest } from '@shared/models/building/create-building-request.model';
import type { UpdateBuildingRequest } from '@shared/models/building/update-building-request.model';
import type { Property } from '@shared/models/property/property.model';

type BuildingFormData = {
  name: string;
  address: string;
  city: string;
  description: string;
  construction: number;
  year: number;
  floor: number;
};

@Component({
  selector: 'app-edit-building',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputGroupComponent,
    ZardCardComponent,
    ZardImageHoverPreviewDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-building.component.html',
})
export class EditBuildingComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly buildingService = inject(BuildingService);
  private readonly propertyService = inject(PropertyService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();

  readonly buildingId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.buildingId() !== null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly formSubmitted = signal(false);

  // Properties without building
  readonly unattachedProperties = signal<Property[]>([]);
  readonly isLoadingProperties = signal(false);
  readonly attachingPropertyId = signal<string | null>(null);

  // Associated properties (properties already attached to this building)
  readonly associatedProperties = signal<Property[]>([]);
  readonly isLoadingAssociatedProperties = signal(false);
  readonly detachingPropertyId = signal<string | null>(null);

  // Form data
  readonly formData = signal<BuildingFormData>({
    name: '',
    address: '',
    city: '',
    description: '',
    construction: 0,
    year: new Date().getFullYear(),
    floor: 0,
  });

  // Image
  readonly imageUrl = signal<string | null>(null);
  readonly imageFile = signal<File | null>(null);
  readonly imageInput = viewChild<ElementRef<HTMLInputElement>>('imageInput');

  // Icon templates
  readonly buildingIconTemplate = viewChild.required<TemplateRef<void>>('buildingIconTemplate');
  readonly mapPinIconTemplate = viewChild.required<TemplateRef<void>>('mapPinIconTemplate');
  readonly calendarIconTemplate = viewChild.required<TemplateRef<void>>('calendarIconTemplate');
  readonly layersIconTemplate = viewChild.required<TemplateRef<void>>('layersIconTemplate');

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.name.trim() !== '' &&
      data.construction > 0 &&
      data.year > 0 &&
      data.floor > 0
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

  readonly constructionError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().construction;
    if (value <= 0) {
      return 'Construction must be greater than 0';
    }
    return '';
  });

  readonly yearError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().year;
    if (value <= 0) {
      return 'Year must be greater than 0';
    }
    return '';
  });

  readonly floorError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().floor;
    if (value <= 0) {
      return 'Floor must be greater than 0';
    }
    return '';
  });

  // Error states
  readonly nameHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().name || this.formData().name.trim() === '');
  });

  readonly constructionHasError = computed(() => {
    return this.formSubmitted() && this.formData().construction <= 0;
  });

  readonly yearHasError = computed(() => {
    return this.formSubmitted() && this.formData().year <= 0;
  });

  readonly floorHasError = computed(() => {
    return this.formSubmitted() && this.formData().floor <= 0;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'add') {
      this.buildingId.set(id);
      this.loadBuilding(id);
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const updatedId = params.get('id');
      if (updatedId && updatedId !== 'add') {
        if (updatedId !== this.buildingId()) {
          this.buildingId.set(updatedId);
          this.loadBuilding(updatedId);
        }
      } else {
        this.buildingId.set(null);
        this.resetForm();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBuilding(id: string): void {
    this.isLoading.set(true);
    
    this.buildingService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (building) => {
          this.populateFormFromBuilding(building);
          this.isLoading.set(false);
          // Load unattached and associated properties when in edit mode
          if (this.isEditMode()) {
            this.loadUnattachedProperties();
            this.loadAssociatedProperties();
          }
        },
        error: (error) => {
          console.error('Error loading building:', error);
          this.isLoading.set(false);
        },
      });
  }

  private loadUnattachedProperties(): void {
    this.isLoadingProperties.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    
    if (!companyId) {
      this.isLoadingProperties.set(false);
      return;
    }

    this.propertyService.list({
      currentPage: 1,
      pageSize: 100, // Load a reasonable number of properties
      ignore: false,
      unattachedOnly: true,
      companyId: companyId,
      isArchived: false,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.unattachedProperties.set(response.result);
          this.isLoadingProperties.set(false);
        },
        error: (error) => {
          console.error('Error loading unattached properties:', error);
          this.isLoadingProperties.set(false);
        },
      });
  }

  private loadAssociatedProperties(): void {
    const buildingId = this.buildingId();
    if (!buildingId) {
      return;
    }

    this.isLoadingAssociatedProperties.set(true);
    const companyId = this.userService.getCurrentUser()?.companyId;
    
    if (!companyId) {
      this.isLoadingAssociatedProperties.set(false);
      return;
    }

    this.propertyService.list({
      currentPage: 1,
      pageSize: 100, // Load a reasonable number of properties
      ignore: false,
      buildingId: buildingId,
      companyId: companyId,
      isArchived: false,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.associatedProperties.set(response.result);
          this.isLoadingAssociatedProperties.set(false);
        },
        error: (error) => {
          console.error('Error loading associated properties:', error);
          this.isLoadingAssociatedProperties.set(false);
        },
      });
  }

  onAttachProperty(property: Property): void {
    if (!this.buildingId()) {
      return;
    }

    this.attachingPropertyId.set(property.id);
    
    this.propertyService.updatePropertyBuilding(property.id, this.buildingId()!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(`Property "${property.name || property.identifier}" attached successfully`);
          // Remove from unattached list
          this.unattachedProperties.update(properties => 
            properties.filter(p => p.id !== property.id)
          );
          // Reload associated properties to include the newly attached one
          this.loadAssociatedProperties();
          this.attachingPropertyId.set(null);
        },
        error: (error) => {
          console.error('Error attaching property:', error);
          this.toastService.error('Failed to attach property');
          this.attachingPropertyId.set(null);
        },
      });
  }

  onDetachProperty(property: Property): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Detach Property',
      zDescription: `Are you sure you want to detach "${property.name || property.identifier}" from this building?`,
      zOkText: 'Detach',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.detachingPropertyId.set(property.id);
        
        this.propertyService.updatePropertyBuilding(property.id, null)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastService.success(`Property "${property.name || property.identifier}" detached successfully`);
              // Remove from associated list
              this.associatedProperties.update(properties => 
                properties.filter(p => p.id !== property.id)
              );
              // Reload unattached properties to include the newly detached one
              this.loadUnattachedProperties();
              this.detachingPropertyId.set(null);
            },
            error: (error) => {
              console.error('Error detaching property:', error);
              this.toastService.error('Failed to detach property');
              this.detachingPropertyId.set(null);
            },
          });
      }
    });
  }

  private populateFormFromBuilding(building: Building): void {
    this.formData.set({
      name: building.name || '',
      address: building.address || '',
      city: building.city || '',
      description: building.description || '',
      construction: building.construction || 0,
      year: building.year || new Date().getFullYear(),
      floor: building.floor || 0,
    });

    if (building.defaultAttachmentUrl) {
      this.imageUrl.set(building.defaultAttachmentUrl);
    }
  }

  private resetForm(): void {
    this.formData.set({
      name: '',
      address: '',
      city: '',
      description: '',
      construction: 0,
      year: new Date().getFullYear(),
      floor: 0,
    });
    this.imageUrl.set(null);
    this.imageFile.set(null);
    this.formSubmitted.set(false);
  }

  // Image handlers
  onImageClick(): void {
    this.imageInput()?.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      this.imageFile.set(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.imageUrl.set(result);
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  onRemoveImage(): void {
    this.imageUrl.set(null);
    this.imageFile.set(null);
  }

  getInitials(): string {
    const name = this.formData().name;
    if (!name) return 'B';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
    const buildingId = this.buildingId();

    if (buildingId && this.isEditMode()) {
      this.prepareUpdateRequest(data, buildingId)
        .then((request) => {
          this.buildingService.update(buildingId, request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.formSubmitted.set(false);
                this.isSaving.set(false);
                this.toastService.success('Building updated successfully');
                this.router.navigate(['/building']);
              },
              error: (error) => {
                console.error('Error updating building:', error);
                this.isSaving.set(false);
              },
            });
        })
        .catch((error) => {
          console.error('Error preparing update request:', error);
          this.isSaving.set(false);
        });
    } else {
      this.prepareCreateRequest(data, currentUser.companyId)
        .then((request) => {
          this.buildingService.create(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.formSubmitted.set(false);
                this.isSaving.set(false);
                this.toastService.success('Building created successfully');
                this.router.navigate(['/building']);
              },
              error: (error) => {
                console.error('Error creating building:', error);
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
    formData: BuildingFormData,
    companyId: string
  ): Promise<CreateBuildingRequest> {
    const request: CreateBuildingRequest = {
      name: formData.name.trim(),
      address: formData.address?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      construction: formData.construction,
      year: formData.year,
      floor: formData.floor,
      companyId: companyId,
    };

    const imageFile = this.imageFile();
    if (imageFile) {
      try {
        const base64Content = await this.fileToBase64(imageFile);
        request.image = {
          fileName: imageFile.name,
          base64Content: base64Content,
        };
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }

    return request;
  }

  private async prepareUpdateRequest(
    formData: BuildingFormData,
    buildingId: string
  ): Promise<UpdateBuildingRequest> {
    const request: UpdateBuildingRequest = {
      id: buildingId,
      name: formData.name.trim() || undefined,
      address: formData.address?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      construction: formData.construction || undefined,
      year: formData.year || undefined,
      floor: formData.floor || undefined,
    };

    const imageFile = this.imageFile();
    const currentImageUrl = this.imageUrl();
    
    if (imageFile) {
      try {
        const base64Content = await this.fileToBase64(imageFile);
        request.image = {
          fileName: imageFile.name,
          base64Content: base64Content,
        };
        request.removeImage = false;
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    } else if (!currentImageUrl) {
      request.removeImage = true;
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
    this.router.navigate(['/building']);
  }

  updateField<K extends keyof BuildingFormData>(
    field: K,
    value: BuildingFormData[K]
  ): void {
    this.formData.update(data => ({
      ...data,
      [field]: value,
    }));
  }
}

