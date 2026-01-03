import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardImageViewerComponent, type ImageItem } from '@shared/image-viewer/image-viewer.component';
import { CollaborationService } from '@shared/services/collaboration.service';
import type { CollaborationProperty } from '@shared/models/collaboration/collaboration-property.model';
import { PropertyCategory, TypePaiment } from '@shared/models/property/property.model';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { catchError, of } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-collaboration-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardImageViewerComponent,
    PropertyPricePipe,
    ZardAvatarComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collaboration-detail.component.html',
})
export class CollaborationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly collaborationService = inject(CollaborationService);
  private readonly translateService = inject(TranslateService);

  // Property data
  readonly property = signal<CollaborationProperty | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentImageIndex = signal(0);
  readonly isImageViewerOpen = signal(false);
  readonly imageViewerIndex = signal(0);
  readonly companyLogoError = signal(false);
  
  // Touch/swipe handling for mobile
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;

  // Computed values
  readonly propertyName = computed(() => this.property()?.name || '');
  readonly propertyType = computed(() => this.property()?.typeProperty || '');
  readonly propertyLocation = computed(() => {
    const prop = this.property();
    if (!prop) return '';
    // Only show city, never show address for collaboration properties
    return prop.city || '';
  });
  readonly price = computed(() => this.property()?.price || 0);
  readonly typePaiment = computed(() => this.property()?.typePaiment ?? TypePaiment.Monthly);
  readonly description = computed(() => this.property()?.description || '');
  readonly features = computed(() => this.property()?.features || []);
  readonly equipment = computed(() => this.property()?.equipment || []);
  readonly attachments = computed(() => {
    const prop = this.property();
    if (!prop || !prop.attachments || prop.attachments.length === 0) {
      return [];
    }
    
    // Sort attachments: default image first
    const defaultUrl = prop.defaultAttachmentUrl;
    if (!defaultUrl) {
      return prop.attachments;
    }
    
    const sorted = [...prop.attachments];
    const defaultIndex = sorted.findIndex(att => att.url === defaultUrl);
    
    if (defaultIndex > 0) {
      const defaultAttachment = sorted.splice(defaultIndex, 1)[0];
      sorted.unshift(defaultAttachment);
    }
    
    return sorted;
  });
  readonly currentImage = computed(() => {
    const atts = this.attachments();
    const index = this.currentImageIndex();
    return atts[index]?.url || this.property()?.defaultAttachmentUrl || null;
  });
  readonly imageItems = computed<ImageItem[]>(() => {
    const atts = this.attachments();
    return atts.map(att => ({
      url: att.url,
      name: att.fileName || 'Image',
      size: 0,
    }));
  });
  readonly hasCompanyInfo = computed(() => {
    const prop = this.property();
    return !!(prop?.companyName || prop?.companyEmail || prop?.companyPhone || prop?.companyLogoUrl);
  });
  readonly companyLogoDataUrl = computed(() => {
    const logoUrl = this.property()?.companyLogoUrl;
    if (!logoUrl) return null;
    
    // If it already has data URL prefix, return as is
    if (logoUrl.startsWith('data:')) {
      return logoUrl;
    }
    
    // If it's a regular HTTP/HTTPS URL, return as is
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    
    // Otherwise, assume it's a base64 string and add the prefix
    let mimeType = 'image/png'; // default
    if (logoUrl.startsWith('/9j/') || logoUrl.startsWith('iVBORw0KGgo')) {
      mimeType = logoUrl.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
    } else if (logoUrl.startsWith('R0lGOD')) {
      mimeType = 'image/gif';
    } else if (logoUrl.startsWith('UklGR')) {
      mimeType = 'image/webp';
    }
    
    return `data:${mimeType};base64,${logoUrl}`;
  });

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (!propertyId) {
      this.error.set('Property ID is required');
      return;
    }

    this.loadProperty(propertyId);
  }

  private loadProperty(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.collaborationService
      .getCollaborationPropertyById(id)
      .pipe(
        catchError((error) => {
          console.error('Error loading collaboration property:', error);
          this.isLoading.set(false);
          if (error.status === 404 || error.error?.status === 'Failed') {
            this.error.set('Property not found');
          } else {
            this.error.set('Failed to load property');
          }
          return of(null);
        }),
      )
      .subscribe((property) => {
        this.isLoading.set(false);
        if (property) {
          this.property.set(property);
          this.currentImageIndex.set(0);
          this.companyLogoError.set(false);
        }
      });
  }

  nextImage(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    const atts = this.attachments();
    if (atts.length === 0) return;
    
    const newIndex = (this.currentImageIndex() + 1) % atts.length;
    this.currentImageIndex.set(newIndex);
  }

  previousImage(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    const atts = this.attachments();
    if (atts.length === 0) return;
    
    const newIndex = (this.currentImageIndex() - 1 + atts.length) % atts.length;
    this.currentImageIndex.set(newIndex);
  }

  openImageViewer(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.imageItems().length > 0) {
      this.imageViewerIndex.set(this.currentImageIndex());
      this.isImageViewerOpen.set(true);
    }
  }

  closeImageViewer(): void {
    this.isImageViewerOpen.set(false);
  }

  onImageChanged(index: number): void {
    this.imageViewerIndex.set(index);
    this.currentImageIndex.set(index);
  }

  getCategoryLabel(category: PropertyCategory): string {
    switch (category) {
      case PropertyCategory.Location:
        return this.translateService.instant('property.categories.location');
      case PropertyCategory.Vente:
        return this.translateService.instant('property.categories.vente');
      case PropertyCategory.LocationVacances:
        return this.translateService.instant('property.categories.locationVacances');
      default:
        return 'Property';
    }
  }

  callCompany(): void {
    const prop = this.property();
    if (prop?.companyPhone) {
      window.location.href = `tel:${prop.companyPhone}`;
    }
  }

  emailCompany(): void {
    const prop = this.property();
    if (prop?.companyEmail) {
      window.location.href = `mailto:${prop.companyEmail}`;
    }
  }

  contactViaWhatsApp(): void {
    const prop = this.property();
    if (prop?.companyPhone) {
      const phone = prop.companyPhone.replace(/[^\d+]/g, '');
      const whatsappUrl = `https://wa.me/${phone}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  onCompanyLogoError(): void {
    this.companyLogoError.set(true);
  }

  backToApp(): void {
    this.router.navigate(['/collaboration']);
  }

  // Touch event handlers for mobile swipe
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        this.previousImage();
      } else {
        this.nextImage();
      }
    }
  }
}

