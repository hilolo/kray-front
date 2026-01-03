import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { PropertyRequestService } from '@shared/services/property-request.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import type { PropertyRequest } from '@shared/models/property-request/property-request.model';
import type { CreatePropertyRequestRequest, UpdatePropertyRequestRequest } from '@shared/models/property-request/property-request.model';
import { PropertyCategory } from '@shared/models/property/property.model';

type PropertyRequestFormData = {
  clientName: string;
  contactId: string;
  category: PropertyCategory | null;
  budget: number | null;
  pieces: number | null;
  bathrooms: number | null;
  isFurnished: boolean;
  price: number | null;
  surface: number | null;
  zone: string;
  ville: string;
  description: string;
};

@Component({
  selector: 'app-edit-property-request',
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
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardCheckboxComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-property-request.component.html',
})
export class EditPropertyRequestComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly propertyRequestService = inject(PropertyRequestService);
  private readonly translateService = inject(TranslateService);
  readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly dialogData = inject<{ propertyRequestId?: string; viewMode?: boolean }>(Z_MODAL_DATA, { optional: true });
  private readonly destroy$ = new Subject<void>();

  readonly propertyRequestId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.propertyRequestId() !== null);
  readonly isViewMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isDialogMode = computed(() => this.dialogRef !== null);
  readonly formSubmitted = signal(false);

  // Form data
  readonly formData = signal<PropertyRequestFormData>({
    clientName: '',
    contactId: '',
    category: null,
    budget: null,
    pieces: null,
    bathrooms: null,
    isFurnished: false,
    price: null,
    surface: null,
    zone: '',
    ville: '',
    description: '',
  });

  // Category enum for template
  readonly PropertyCategory = PropertyCategory;

  /**
   * Get translated category label
   */
  getCategoryLabel(): string {
    const category = this.formData().category;
    if (category === null) return '';
    
    switch (category) {
      case PropertyCategory.Location:
        return this.translateService.instant('property.categories.location');
      case PropertyCategory.Vente:
        return this.translateService.instant('property.categories.vente');
      case PropertyCategory.LocationVacances:
        return this.translateService.instant('property.categories.locationVacances');
      default:
        return '';
    }
  }

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.clientName.trim() !== '' &&
      data.category !== null &&
      data.budget !== null &&
      data.budget > 0 &&
      data.pieces !== null &&
      data.pieces > 0
    );
  });

  // Error messages
  readonly clientNameError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().clientName;
    if (!value || value.trim() === '') {
      return this.translateService.instant('propertyRequest.edit.clientRequired');
    }
    return '';
  });

  readonly categoryError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().category;
    if (value === null) {
      return this.translateService.instant('propertyRequest.edit.categoryRequired');
    }
    return '';
  });

  readonly clientNameHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().clientName || this.formData().clientName.trim() === '');
  });

  readonly categoryHasError = computed(() => {
    return this.formSubmitted() && this.formData().category === null;
  });

  readonly budgetError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().budget;
    if (value === null || value <= 0) {
      return this.translateService.instant('propertyRequest.edit.budgetRequired');
    }
    return '';
  });

  readonly piecesError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().pieces;
    if (value === null || value <= 0) {
      return this.translateService.instant('propertyRequest.edit.piecesRequired');
    }
    return '';
  });

  readonly budgetHasError = computed(() => {
    const value = this.formData().budget;
    return this.formSubmitted() && (value === null || value <= 0);
  });

  readonly piecesHasError = computed(() => {
    const value = this.formData().pieces;
    return this.formSubmitted() && (value === null || value <= 0);
  });

  ngOnInit(): void {
    if (this.dialogData?.propertyRequestId) {
      this.propertyRequestId.set(this.dialogData.propertyRequestId);
      this.isViewMode.set(this.dialogData.viewMode || false);
      this.loadPropertyRequest(this.dialogData.propertyRequestId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPropertyRequest(id: string): void {
    this.isLoading.set(true);
    
    this.propertyRequestService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (propertyRequest) => {
          this.populateFormFromPropertyRequest(propertyRequest);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private populateFormFromPropertyRequest(propertyRequest: PropertyRequest): void {
    this.formData.set({
      clientName: propertyRequest.client || '',
      contactId: '', // No longer used
      category: propertyRequest.category,
      budget: propertyRequest.budget || null,
      pieces: propertyRequest.pieces || null,
      bathrooms: propertyRequest.bathrooms || null,
      isFurnished: propertyRequest.isFurnished || false,
      price: propertyRequest.price || null,
      surface: propertyRequest.surface || null,
      zone: propertyRequest.zone || '',
      ville: propertyRequest.ville || '',
      description: propertyRequest.description || '',
    });
  }

  updateClientName(value: string): void {
    this.formData.update(data => ({ ...data, clientName: value }));
  }

  updateCategory(value: PropertyCategory): void {
    this.formData.update(data => ({ ...data, category: value }));
  }

  updateBudget(value: string): void {
    const numValue = value ? parseFloat(value) : null;
    this.formData.update(data => ({ ...data, budget: numValue }));
  }

  updatePieces(value: string): void {
    const numValue = value ? parseFloat(value) : null;
    this.formData.update(data => ({ ...data, pieces: numValue }));
  }

  updateBathrooms(value: string): void {
    const numValue = value ? parseFloat(value) : null;
    this.formData.update(data => ({ ...data, bathrooms: numValue }));
  }

  updateIsFurnished(value: boolean): void {
    this.formData.update(data => ({ ...data, isFurnished: value }));
  }

  updatePrice(value: string): void {
    const numValue = value ? parseFloat(value) : null;
    this.formData.update(data => ({ ...data, price: numValue }));
  }

  updateSurface(value: string): void {
    const numValue = value ? parseFloat(value) : null;
    this.formData.update(data => ({ ...data, surface: numValue }));
  }

  updateZone(value: string): void {
    this.formData.update(data => ({ ...data, zone: value }));
  }

  updateVille(value: string): void {
    this.formData.update(data => ({ ...data, ville: value }));
  }

  updateDescription(value: string): void {
    this.formData.update(data => ({ ...data, description: value }));
  }

  onSave(): void {
    this.formSubmitted.set(true);

    if (!this.isFormValid()) {
      return;
    }

    this.isSaving.set(true);
    const data = this.formData();

    if (this.isEditMode()) {
      const updateRequest: UpdatePropertyRequestRequest = {
        id: this.propertyRequestId()!,
        client: data.clientName.trim() || undefined,
        category: data.category !== null ? data.category : undefined,
        budget: data.budget !== null ? data.budget : undefined,
        pieces: data.pieces !== null ? data.pieces : undefined,
        bathrooms: data.bathrooms !== null ? data.bathrooms : undefined,
        isFurnished: data.isFurnished,
        price: data.price !== null ? data.price : undefined,
        surface: data.surface !== null ? data.surface : undefined,
        zone: data.zone || undefined,
        ville: data.ville || undefined,
        description: data.description || undefined,
      };

      this.propertyRequestService.update(this.propertyRequestId()!, updateRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            if (this.isDialogMode()) {
              this.dialogRef?.close({ propertyRequestId: this.propertyRequestId() });
            } else {
              this.router.navigate(['/property-request']);
            }
          },
          error: () => {
            this.isSaving.set(false);
          },
        });
    } else {
      const createRequest: CreatePropertyRequestRequest = {
        client: data.clientName.trim(),
        category: data.category!,
        budget: data.budget || 0,
        pieces: data.pieces || 0,
        bathrooms: data.bathrooms || 0,
        isFurnished: data.isFurnished,
        price: data.price || 0,
        surface: data.surface || 0,
        zone: data.zone,
        ville: data.ville,
        description: data.description,
        isCollaborate: false,
      };

      this.propertyRequestService.create(createRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.isSaving.set(false);
            if (this.isDialogMode()) {
              this.dialogRef?.close({ propertyRequestId: result.id });
            } else {
              this.router.navigate(['/property-request']);
            }
          },
          error: () => {
            this.isSaving.set(false);
          },
        });
    }
  }

  onCancel(): void {
    if (this.isDialogMode()) {
      this.dialogRef?.close();
    } else {
      this.router.navigate(['/property-request']);
    }
  }
}

