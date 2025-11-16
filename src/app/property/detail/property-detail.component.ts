import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardTabGroupComponent, ZardTabComponent } from '@shared/components/tabs/tabs.component';
import { ZardAccordionComponent } from '@shared/components/accordion/accordion.component';
import { ZardAccordionItemComponent } from '@shared/components/accordion/accordion-item.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '@shared/services/property.service';
import { LeaseService } from '@shared/services/lease.service';
import type { Property } from '@shared/models/property/property.model';
import type { Lease } from '@shared/models/lease/lease.model';
import { catchError, of } from 'rxjs';
import { ZardImageViewerComponent, type ImageItem } from '@shared/image-viewer/image-viewer.component';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { generateICalFile, downloadICalFile, shareICalViaWhatsApp, type ICalEventData } from '@shared/utils/ical.util';
import { ToastService } from '@shared/services/toast.service';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ZardPageComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardTabGroupComponent,
    ZardTabComponent,
    ZardAccordionComponent,
    ZardAccordionItemComponent,
    ZardInputGroupComponent,
    ZardInputDirective,
    ZardImageViewerComponent,
    PropertyPricePipe,
    TranslateModule,
    ZardSwitchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-detail.component.html',
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly leaseService = inject(LeaseService);
  private readonly toastService = inject(ToastService);

  // Property data
  readonly property = signal<Property | null>(null);
  readonly isLoading = signal(false);
  readonly isLoadingLeases = signal(false);
  readonly leases = signal<Lease[]>([]);
  readonly currentImageIndex = signal(0);
  readonly isImageViewerOpen = signal(false);
  readonly imageViewerIndex = signal(0);

  // Template references
  readonly calendarCopyButtonTemplate = viewChild<TemplateRef<void>>('calendarCopyButtonTemplate');
  readonly publicProfileCopyButtonTemplate = viewChild<TemplateRef<void>>('publicProfileCopyButtonTemplate');
  
  readonly calendarCopyButtonTemplateRef = computed(() => this.calendarCopyButtonTemplate() ?? undefined);
  readonly publicProfileCopyButtonTemplateRef = computed(() => this.publicProfileCopyButtonTemplate() ?? undefined);

  // Sharing settings
  readonly enableSharing = signal(false);
  readonly enableAddressSharing = signal(false);

  // Computed values
  readonly propertyName = computed(() => this.property()?.name || '');
  readonly propertyType = computed(() => this.property()?.typeProperty || '');
  readonly propertyLocation = computed(() => {
    const prop = this.property();
    if (!prop) return '';
    return `${prop.address}${prop.city ? ', ' + prop.city : ''}`;
  });
  readonly totalRent = computed(() => this.property()?.price || 0);
  readonly serviceCharges = computed(() => 0); // Not in property model, defaulting to 0
  readonly address = computed(() => {
    const prop = this.property();
    if (!prop) return '';
    return `${prop.address}${prop.city ? ', ' + prop.city : ''}`;
  });
  readonly description = computed(() => this.property()?.description || '');
  readonly additionalInfo = computed(() => {
    const prop = this.property();
    if (!prop) return [];
    const info: string[] = [];
    if (prop.furnished) info.push('furnished');
    return info;
  });
  readonly features = computed(() => this.property()?.features || []);
  readonly equipment = computed(() => this.property()?.equipment || []);
  readonly attachments = computed(() => this.property()?.attachments || []);
  readonly currentImage = computed(() => {
    const atts = this.attachments();
    const index = this.currentImageIndex();
    return atts[index]?.url || null;
  });
  readonly imageItems = computed<ImageItem[]>(() => {
    const atts = this.attachments();
    return atts.map(att => ({
      url: att.url,
      name: att.fileName || 'Image',
      size: 0, // Size not available in AttachmentDetails
    }));
  });
  readonly calendarLink = computed(() => {
    const prop = this.property();
    if (!prop) return '';
    return `https://www.rentila.co.uk/reservations/${prop.id}`;
  });
  readonly publicProfileLink = computed(() => {
    const prop = this.property();
    if (!prop) return '';
    // If address sharing is enabled, include address in the link, otherwise just the ID
    if (this.enableAddressSharing() && prop.address) {
      // You might want to encode the address for URL
      return `https://www.rentila.co.uk/${prop.id}`;
    }
    return `https://www.rentila.co.uk/${prop.id}`;
  });

  readonly isPublicProfileDisabled = computed(() => {
    return !this.enableSharing();
  });
  readonly validationErrors = computed(() => {
    // Validation errors removed as per requirements
    return [];
  });

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (!propertyId) {
      this.router.navigate(['/property']);
      return;
    }

    this.loadProperty(propertyId);
    this.loadLeases(propertyId);
  }

  private loadProperty(id: string): void {
    this.isLoading.set(true);
    this.propertyService
      .getById(id, true)
      .pipe(
        catchError((error) => {
          console.error('Error loading property:', error);
          this.router.navigate(['/property']);
          return of(null);
        }),
      )
      .subscribe((property) => {
        this.isLoading.set(false);
        if (property) {
          this.property.set(property);
        }
      });
  }

  private loadLeases(propertyId: string): void {
    this.isLoadingLeases.set(true);
    this.leaseService
      .list({
        currentPage: 1,
        pageSize: 100,
        ignore: false,
        propertyId: propertyId,
        isArchived: false,
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading leases:', error);
          return of({ result: [], totalPages: 0, totalItems: 0 });
        }),
      )
      .subscribe((response) => {
        this.isLoadingLeases.set(false);
        this.leases.set(response.result || []);
      });
  }

  // Methods
  removeAdditionalInfo(item: string): void {
    // This would need to update the property via API
    // For now, just update the local signal
    const prop = this.property();
    if (!prop) return;
    
    if (item === 'furnished') {
      // Would need API call to update furnished status
      return;
    }
    
    // Remove from features
    const updatedFeatures = prop.features.filter(f => f !== item);
    // Would need API call to update features
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  }

  nextImage(): void {
    const atts = this.attachments();
    if (atts.length === 0) return;
    this.currentImageIndex.update((index) => (index + 1) % atts.length);
  }

  previousImage(): void {
    const atts = this.attachments();
    if (atts.length === 0) return;
    this.currentImageIndex.update((index) => (index - 1 + atts.length) % atts.length);
  }

  getLeaseType(lease: Lease): string {
    // Map payment type to lease type description
    // This is a simplified mapping - adjust based on your business logic
    return 'Assured shorthold tenancy';
  }

  openImageViewer(): void {
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
    // Also update the current image index in the card
    this.currentImageIndex.set(index);
  }

  // Generate and download iCal file for property calendar
  generateICalFile(): void {
    const property = this.property();
    if (!property) {
      this.toastService.error('Property information is required');
      return;
    }

    // For property calendar, we create a simple event showing the calendar link
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(9, 0, 0, 0);
    
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 365); // One year from now
    endDate.setHours(17, 0, 0, 0);

    const summary = `Property Calendar: ${property.name || 'Property'}`;
    const description = `Calendar availability for ${property.name || 'Property'}\n\nView reservations: ${this.calendarLink()}`;
    const location = property.address || '';

    const eventData: ICalEventData = {
      summary,
      description,
      location,
      startDate,
      endDate,
      url: this.calendarLink(),
    };

    const icalContent = generateICalFile(eventData);
    const filename = `property-calendar-${property.id}.ics`;
    downloadICalFile(icalContent, filename);
    this.toastService.success('Calendar file downloaded successfully');
  }

  // Share calendar link via WhatsApp
  shareICalViaWhatsApp(): void {
    const property = this.property();
    if (!property) {
      this.toastService.error('Property information is required');
      return;
    }

    // Generate the iCal file
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(9, 0, 0, 0);
    
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 365);
    endDate.setHours(17, 0, 0, 0);

    const summary = `Property Calendar: ${property.name || 'Property'}`;
    const description = `Calendar availability for ${property.name || 'Property'}\n\nView reservations: ${this.calendarLink()}`;
    const location = property.address || '';

    const eventData: ICalEventData = {
      summary,
      description,
      location,
      startDate,
      endDate,
      url: this.calendarLink(),
    };

    const icalContent = generateICalFile(eventData);
    const message = `Property Calendar: ${property.name || 'Property'}\n\nCalendar Link: ${this.calendarLink()}\n\nLocation: ${location}`;
    shareICalViaWhatsApp(icalContent, message);
    this.toastService.success('Opening WhatsApp to share calendar file');
  }

  // Copy calendar link to clipboard
  copyCalendarLink(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const link = this.calendarLink();
    if (!link) {
      this.toastService.error('No link available to copy');
      return;
    }

    this.copyToClipboard(link);
  }

  // Copy public profile link to clipboard
  copyPublicProfileLink(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const link = this.publicProfileLink();
    if (!link) {
      this.toastService.error('No link available to copy');
      return;
    }

    this.copyToClipboard(link);
  }

  // Helper method to copy text to clipboard
  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Link copied to clipboard:', text);
      this.toastService.success('Link copied to clipboard!');
    }).catch((error) => {
      console.error('Clipboard API failed, trying fallback:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          console.log('Link copied to clipboard (fallback):', text);
          this.toastService.success('Link copied to clipboard!');
        } else {
          throw new Error('Copy command failed');
        }
      } catch (err) {
        console.error('Failed to copy link:', err);
        this.toastService.error('Failed to copy link. Please try again.');
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }

  updateEnableSharing(value: boolean): void {
    this.enableSharing.set(value);
    if (!value) {
      // If sharing is disabled, also disable address sharing
      this.enableAddressSharing.set(false);
    }
  }

  updateEnableAddressSharing(value: boolean): void {
    this.enableAddressSharing.set(value);
  }
}
