import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
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
import type { CreateKeyRequest } from '@shared/models/key/create-key-request.model';
import type { UpdateKeyRequest } from '@shared/models/key/update-key-request.model';
import type { Property as PropertyModel } from '@shared/models/property/property.model';

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
  }

  private resetForm(): void {
    this.formData.set({
      name: '',
      description: '',
      propertyId: '',
    });
    this.formSubmitted.set(false);
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

  // Form submission
  onSave(): void {
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
      // Update existing key
      const request: UpdateKeyRequest = {
        id: keyId,
        name: data.name.trim(),
        description: data.description.trim() || '',
        propertyId: data.propertyId,
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
      // Create new key
      const request: CreateKeyRequest = {
        name: data.name.trim(),
        description: data.description.trim() || '',
        propertyId: data.propertyId,
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

