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
import type { Property } from '@shared/models/property/property.model';
import { PropertyCategory } from '@shared/models/property/property.model';
import type { Lease } from '@shared/models/property/property.model';
import { catchError, of } from 'rxjs';
import { ZardImageViewerComponent, type ImageItem } from '@shared/image-viewer/image-viewer.component';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { generateICalFile, downloadICalFile, shareICalViaWhatsApp, type ICalEventData } from '@shared/utils/ical.util';
import { ToastService } from '@shared/services/toast.service';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';

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
    ZardAvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-detail.component.html',
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly toastService = inject(ToastService);

  // Property data
  readonly property = signal<Property | null>(null);
  readonly isLoading = signal(false);
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
  readonly features = computed(() => this.property()?.features || []);
  readonly equipment = computed(() => this.property()?.equipment || []);
  readonly attachments = computed(() => {
    const prop = this.property();
    if (!prop || !prop.attachments || prop.attachments.length === 0) {
      return [];
    }
    
    // Sort attachments: default image first, then others
    const defaultId = prop.defaultAttachmentId;
    if (!defaultId) {
      return prop.attachments;
    }
    
    const sorted = [...prop.attachments];
    const defaultIndex = sorted.findIndex(att => att.id === defaultId);
    
    if (defaultIndex > 0) {
      // Move default image to first position
      const defaultAttachment = sorted.splice(defaultIndex, 1)[0];
      sorted.unshift(defaultAttachment);
    }
    
    return sorted;
  });
  readonly currentImage = computed(() => {
    const atts = this.attachments();
    const index = this.currentImageIndex();
    return atts[index]?.url || null;
  });
  readonly isCurrentImageDefault = computed(() => {
    const prop = this.property();
    const atts = this.attachments();
    const index = this.currentImageIndex();
    if (!prop || !prop.defaultAttachmentId || atts.length === 0 || index >= atts.length) {
      return false;
    }
    return atts[index]?.id === prop.defaultAttachmentId;
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
  readonly isVacationLocation = computed(() => {
    const prop = this.property();
    return prop?.category === PropertyCategory.LocationVacances;
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
          // Reset image index to 0 when property loads (default image will be first after sorting)
          this.currentImageIndex.set(0);
        }
      });
  }

  // Computed signal to get keys from property
  readonly keys = computed(() => {
    return this.property()?.keys || [];
  });

  // Computed signal to get leases from property
  readonly leases = computed(() => {
    return this.property()?.leases || [];
  });

  // Methods
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  }

  nextImage(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Prevent text selection
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    const atts = this.attachments();
    if (atts.length === 0) return;
    this.currentImageIndex.update((index) => (index + 1) % atts.length);
  }

  previousImage(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Prevent text selection
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    const atts = this.attachments();
    if (atts.length === 0) return;
    this.currentImageIndex.update((index) => (index - 1 + atts.length) % atts.length);
  }

  getLeaseType(lease: Lease): string {
    // Map payment type to lease type description
    // This is a simplified mapping - adjust based on your business logic
    return 'Assured shorthold tenancy';
  }

  getPaymentMethodLabel(method: number): string {
    switch (method) {
      case 0: // PaymentMethod.Cash
        return 'Cash';
      case 1: // PaymentMethod.BankTransfer
        return 'Bank Transfer';
      case 2: // PaymentMethod.Check
        return 'Check';
      default:
        return 'Unknown';
    }
  }

  // Owner information helpers
  getOwnerName(): string {
    const prop = this.property();
    if (!prop) return '';
    
    // First try ownerName from property
    if (prop.ownerName) {
      return prop.ownerName;
    }
    
    // Then try contact object
    if (prop.contact) {
      // If companyName exists and is not empty, it's a company
      if (prop.contact.companyName && prop.contact.companyName.trim() !== '') {
        return prop.contact.companyName;
      } else {
        // Otherwise, it's a person - use firstName and lastName
        const firstName = prop.contact.firstName || '';
        const lastName = prop.contact.lastName || '';
        return `${firstName} ${lastName}`.trim();
      }
    }
    
    return 'Unknown Owner';
  }

  getOwnerInitials(): string {
    const prop = this.property();
    if (!prop || !prop.contact) return 'UO';
    
    if (prop.contact.companyName && prop.contact.companyName.trim() !== '') {
      // Company: use first 2 letters of company name
      return prop.contact.companyName.substring(0, 2).toUpperCase();
    } else {
      // Person: use first letter of first and last name
      const firstName = prop.contact.firstName || '';
      const lastName = prop.contact.lastName || '';
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName.charAt(0).toUpperCase();
      return (firstInitial + lastInitial) || 'UO';
    }
  }

  getOwnerEmail(): string {
    const prop = this.property();
    return prop?.contact?.email || '';
  }

  getOwnerPhones(): string[] {
    const prop = this.property();
    return prop?.contact?.phones || [];
  }

  getOwnerIdentifier(): string {
    const prop = this.property();
    return prop?.contact?.identifier || '';
  }

  getOwnerAvatarUrl(): string | null {
    const prop = this.property();
    return prop?.contact?.avatar || null;
  }

  viewOwnerProfile(): void {
    const prop = this.property();
    if (!prop || !prop.contactId) return;
    this.router.navigate(['/contact/owners', prop.contactId]);
  }

  getTenantInitials(lease: Lease): string {
    const name = lease.tenantName || '';
    if (!name) return 'TN';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatLeasePrice(price: number, paymentType: number): string {
    if (!price || price === 0) {
      return '-';
    }

    const formattedPrice = price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    switch (paymentType) {
      case 0: // TypePaimentLease.Monthly
        return `${formattedPrice} MAD/month`;
      case 1: // TypePaimentLease.Quarterly
        return `${formattedPrice} MAD/quarter`;
      case 2: // TypePaimentLease.SemiAnnually
        return `${formattedPrice} MAD/6 months`;
      case 3: // TypePaimentLease.Fully
        return `${formattedPrice} MAD (full payment)`;
      default:
        return `${formattedPrice} MAD`;
    }
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
