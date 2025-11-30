import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardImageViewerComponent, type ImageItem } from '@shared/image-viewer/image-viewer.component';
import { PropertyService } from '@shared/services/property.service';
import type { PublicProperty } from '@shared/models/property/public-property.model';
import { PropertyCategory, TypePaiment } from '@shared/models/property/property.model';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { catchError, of } from 'rxjs';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { ContentComponent } from '@shared/components/layout/content.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { DarkModeService } from '@shared/services/darkmode.service';
import { ZardReservationCalendarComponent } from '@shared/components/reservation-calendar/reservation-calendar.component';
import { ReservationService } from '@shared/services/reservation.service';
import type { PublicReservation } from '@shared/models/reservation/public-reservation.model';
import type { Reservation } from '@shared/models/reservation/reservation.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-public-property',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    ContentComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardImageViewerComponent,
    PropertyPricePipe,
    ZardAvatarComponent,
    ZardReservationCalendarComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-property.component.html',
})
export class PublicPropertyComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly darkModeService = inject(DarkModeService);
  private readonly reservationService = inject(ReservationService);
  private readonly translateService = inject(TranslateService);

  // Property data
  readonly property = signal<PublicProperty | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentImageIndex = signal(0);
  readonly isImageViewerOpen = signal(false);
  readonly imageViewerIndex = signal(0);
  readonly reservations = signal<Reservation[]>([]);
  readonly isLoadingReservations = signal(false);
  readonly companyLogoError = signal(false);
  
  // Touch/swipe handling for mobile
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  
  // Current month/year for calendar
  readonly currentCalendarMonth = signal<number | undefined>(undefined);
  readonly currentCalendarYear = signal<number | undefined>(undefined);

  // Computed values
  readonly propertyName = computed(() => this.property()?.name || '');
  readonly propertyType = computed(() => this.property()?.typeProperty || '');
  readonly propertyLocation = computed(() => {
    const prop = this.property();
    if (!prop) return '';
    if (prop.isAddressPublic && prop.address) {
      return `${prop.address}${prop.city ? ', ' + prop.city : ''}`;
    }
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
    return !!(prop?.companyName || prop?.companyEmail || prop?.companyPhone || prop?.companyWebsite || prop?.companyAddress);
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
    // Try to detect image type from base64 content
    let mimeType = 'image/png'; // default
    if (logoUrl.startsWith('/9j/') || logoUrl.startsWith('iVBORw0KGgo')) {
      // JPEG starts with /9j/, PNG starts with iVBORw0KGgo
      mimeType = logoUrl.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
    } else if (logoUrl.startsWith('R0lGOD')) {
      mimeType = 'image/gif';
    } else if (logoUrl.startsWith('UklGR')) {
      mimeType = 'image/webp';
    }
    
    return `data:${mimeType};base64,${logoUrl}`;
  });
  readonly currentTheme = this.darkModeService.getCurrentThemeSignal();
  readonly shouldShowCalendar = computed(() => {
    const prop = this.property();
    return !!(prop?.isReservationShow && prop?.category === PropertyCategory.LocationVacances);
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
    this.propertyService
      .getPublicPropertyById(id)
      .pipe(
        catchError((error) => {
          console.error('Error loading public property:', error);
          this.isLoading.set(false);
          // Check if property is not shared
          if (error.status === 404 || error.error?.status === 'Failed') {
            this.error.set(this.translateService.instant('property.public.notPubliclyShared'));
          } else {
            this.error.set(this.translateService.instant('property.public.failedToLoad'));
          }
          return of(null);
        }),
      )
      .subscribe((property) => {
        this.isLoading.set(false);
        if (property) {
          this.property.set(property);
          this.currentImageIndex.set(0);
          this.companyLogoError.set(false); // Reset logo error when loading new property
          // Load public reservations if calendar should be shown
          if (property.isReservationShow && property.category === PropertyCategory.LocationVacances) {
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            this.currentCalendarMonth.set(month);
            this.currentCalendarYear.set(year);
            this.loadPublicReservations(property.id);
          }
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
    
    // Update index
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
    
    // Update index
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

  getPaymentTypeLabel(type: TypePaiment): string {
    switch (type) {
      case TypePaiment.Monthly:
        return 'per month';
      case TypePaiment.Daily:
        return 'per day';
      case TypePaiment.Weekly:
        return 'per week';
      case TypePaiment.Fixed:
        return 'fixed price';
      default:
        return '';
    }
  }

  getCategoryLabel(category: PropertyCategory): string {
    switch (category) {
      case PropertyCategory.Location:
        return 'Rental';
      case PropertyCategory.Vente:
        return 'Sale';
      case PropertyCategory.LocationVacances:
        return 'Holiday Rental';
      default:
        return 'Property';
    }
  }

  openCompanyWebsite(): void {
    const prop = this.property();
    if (prop?.companyWebsite) {
      let url = prop.companyWebsite.trim();
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  toggleTheme(): void {
    this.darkModeService.toggleTheme();
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

  onCompanyLogoError(): void {
    this.companyLogoError.set(true);
  }

  private loadPublicReservations(propertyId: string): void {
    this.isLoadingReservations.set(true);

    this.reservationService
      .getPublicReservations(propertyId)
      .pipe(
        catchError((error) => {
          console.error('Error loading public reservations:', error);
          this.isLoadingReservations.set(false);
          return of([]);
        }),
      )
      .subscribe((publicReservations) => {
        // Convert PublicReservation to Reservation format for the calendar component
        const reservations: Reservation[] = publicReservations.map((pr) => ({
          id: pr.id,
          contactId: '', // Not available in public reservations
          contactName: '', // Not available for privacy
          contactEmail: '', // Not available for privacy
          contactPhone: '', // Not available for privacy
          contactAvatarUrl: '', // Not available for privacy
          propertyId: pr.propertyId,
          propertyIdentifier: '',
          propertyName: '',
          propertyAddress: '',
          propertyImageUrl: '',
          startDate: pr.startDate,
          endDate: pr.endDate,
          durationDays: 0,
          numberOfNights: 0,
          totalAmount: 0,
          reason: '',
          description: '',
          requestDate: pr.startDate,
          status: pr.status,
          approvedBy: null,
          approvalDate: null,
          approvalNotes: '',
          privateNote: '',
          attachments: [],
          attachmentCount: 0,
          isArchived: false,
          companyId: '',
          createdAt: pr.startDate,
          updatedAt: null,
        }));
        this.reservations.set(reservations);
        this.isLoadingReservations.set(false);
      });
  }

  // Handle month change from calendar
  onMonthChange(event: { month: number; year: number }): void {
    const property = this.property();
    if (!property) return;
    
    // Update the calendar month/year signals
    this.currentCalendarMonth.set(event.month);
    this.currentCalendarYear.set(event.year);
    
    // Reload reservations for the new month (for now, we load all reservations)
    // The calendar component will filter by month
    this.loadPublicReservations(property.id);
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
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - previous image
        this.previousImage();
      } else {
        // Swipe left - next image
        this.nextImage();
      }
    }
  }
}

