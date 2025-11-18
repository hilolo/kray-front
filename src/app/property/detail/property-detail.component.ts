import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { imageSlideAnimation } from '@shared/animations/image-swap.animations';
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
import type { Key } from '@shared/models/key/key.model';
import { LeasingStatus } from '@shared/models/lease/lease.model';
import { catchError, of } from 'rxjs';
import { ZardImageViewerComponent, type ImageItem } from '@shared/image-viewer/image-viewer.component';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { generateICalFile, downloadICalFile, shareICalViaWhatsApp, shareTextViaWhatsApp, type ICalEventData } from '@shared/utils/ical.util';
import { ToastService } from '@shared/services/toast.service';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardReservationCalendarComponent } from '@shared/components/reservation-calendar/reservation-calendar.component';
import { ReservationService } from '@shared/services/reservation.service';
import type { Reservation } from '@shared/models/reservation/reservation.model';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';

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
    ZardReservationCalendarComponent,
    ZardImageHoverPreviewDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-detail.component.html',
  animations: [imageSlideAnimation],
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly toastService = inject(ToastService);
  private readonly reservationService = inject(ReservationService);

  // Property data
  readonly property = signal<Property | null>(null);
  readonly isLoading = signal(false);
  readonly currentImageIndex = signal(0);
  readonly isImageViewerOpen = signal(false);
  readonly imageViewerIndex = signal(0);
  readonly imageAnimationDirection = signal<'next' | 'prev' | ''>('');
  readonly reservations = signal<Reservation[]>([]);
  readonly isLoadingReservations = signal(false);
  
  // Key image viewer state
  readonly isKeyImageViewerOpen = signal(false);
  readonly keyImageViewerIndex = signal(0);
  readonly selectedKeyForImageViewer = signal<Key | null>(null);
  
  // Current month/year for calendar
  readonly currentCalendarMonth = signal<number | undefined>(undefined);
  readonly currentCalendarYear = signal<number | undefined>(undefined);

  // Template references
  readonly calendarCopyButtonTemplate = viewChild<TemplateRef<void>>('calendarCopyButtonTemplate');
  readonly publicProfileCopyButtonTemplate = viewChild<TemplateRef<void>>('publicProfileCopyButtonTemplate');
  
  readonly calendarCopyButtonTemplateRef = computed(() => this.calendarCopyButtonTemplate() ?? undefined);
  readonly publicProfileCopyButtonTemplateRef = computed(() => this.publicProfileCopyButtonTemplate() ?? undefined);

  // Sharing settings
  readonly enableSharing = signal(false);
  readonly enableAddressSharing = signal(false);
  readonly enableReservationShow = signal(false);
  private isUpdatingSharing = false;

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
    return `http://localhost:4200/property/detail/${prop.id}/public`;
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
          // Debug: Log leases to check if they're being returned
          console.log('Property loaded:', property);
          console.log('Leases from property:', property.leases);
          console.log('Leases count:', property.leases?.length || 0);
          
          // Reset image index to 0 when property loads (default image will be first after sorting)
          this.currentImageIndex.set(0);
          // Initialize sharing settings from property
          this.enableSharing.set(property.isPublic || false);
          this.enableAddressSharing.set(property.isPublicAdresse || false);
          this.enableReservationShow.set(property.isReservationShow || false);
          // Load reservations if location vacante
          if (property.category === PropertyCategory.LocationVacances) {
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            this.currentCalendarMonth.set(month);
            this.currentCalendarYear.set(year);
            this.loadReservations(property.id, month, year);
          }
        }
      });
  }

  private loadReservations(propertyId: string, month?: number, year?: number): void {
    this.isLoadingReservations.set(true);

    // Calculate date range for the selected month
    let startDateFrom: string | undefined;
    let startDateTo: string | undefined;
    
    if (month !== undefined && year !== undefined) {
      // Create dates in UTC to avoid timezone issues
      // First day of the month at 00:00:00 UTC
      const firstDay = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      startDateFrom = firstDay.toISOString();
      
      // Last day of the month at 23:59:59.999 UTC
      // month + 1 gives us the next month, day 0 gives us the last day of current month
      const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      startDateTo = lastDay.toISOString();
    }

    this.reservationService
      .list({
        currentPage: 1,
        pageSize: 1000,
        ignore: false,
        propertyId: propertyId,
        startDateFrom: startDateFrom,
        startDateTo: startDateTo,
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading reservations:', error);
          this.isLoadingReservations.set(false);
          return of({ result: [], totalPages: 0, totalItems: 0 });
        }),
      )
      .subscribe((response) => {
        this.reservations.set(response.result);
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
    
    // Load reservations for the new month
    this.loadReservations(property.id, event.month, event.year);
  }

  // Computed signal to get keys from property
  readonly keys = computed(() => {
    return this.property()?.keys || [];
  });

  // Key image helper methods
  getKeyAttachments(key: Key): ImageItem[] {
    if (!key.attachments || key.attachments.length === 0) {
      return [];
    }
    
    // Sort attachments: default image first
    const defaultId = key.defaultAttachmentId;
    if (!defaultId) {
      return key.attachments.map(att => ({
        url: att.url,
        name: att.fileName || 'Image',
        size: 0,
      }));
    }
    
    const sorted = [...key.attachments];
    const defaultIndex = sorted.findIndex(att => att.id === defaultId);
    
    if (defaultIndex > 0) {
      const defaultAttachment = sorted.splice(defaultIndex, 1)[0];
      sorted.unshift(defaultAttachment);
    }
    
    return sorted.map(att => ({
      url: att.url,
      name: att.fileName || 'Image',
      size: 0,
    }));
  }

  getKeyImageUrl(key: Key): string | null {
    const attachments = this.getKeyAttachments(key);
    if (attachments.length > 0) {
      return attachments[0].url;
    }
    return key.defaultAttachmentUrl || null;
  }

  hasKeyImages(key: Key): boolean {
    return (key.attachments && key.attachments.length > 0) || !!key.defaultAttachmentUrl;
  }

  openKeyImageViewer(key: Key, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const images = this.getKeyAttachments(key);
    if (images.length > 0) {
      this.selectedKeyForImageViewer.set(key);
      this.keyImageViewerIndex.set(0);
      this.isKeyImageViewerOpen.set(true);
    }
  }

  closeKeyImageViewer(): void {
    this.isKeyImageViewerOpen.set(false);
    this.selectedKeyForImageViewer.set(null);
  }

  onKeyImageChanged(index: number): void {
    this.keyImageViewerIndex.set(index);
  }

  // Computed signal to get leases from property
  readonly leases = computed(() => {
    const prop = this.property();
    if (!prop) return [];
    // Ensure leases array exists and is not null/undefined
    const leasesArray = Array.isArray(prop.leases) ? prop.leases : [];
    console.log('Computed leases:', leasesArray);
    return leasesArray;
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
    
    // Update index first
    const newIndex = (this.currentImageIndex() + 1) % atts.length;
    this.currentImageIndex.set(newIndex);
    
    // Set animation direction - use requestAnimationFrame for smooth state change
    requestAnimationFrame(() => {
      this.imageAnimationDirection.set('next');
      // Reset direction after animation completes (450ms)
      setTimeout(() => {
        this.imageAnimationDirection.set('');
      }, 450);
    });
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
    
    // Update index first
    const newIndex = (this.currentImageIndex() - 1 + atts.length) % atts.length;
    this.currentImageIndex.set(newIndex);
    
    // Set animation direction - use requestAnimationFrame for smooth state change
    requestAnimationFrame(() => {
      this.imageAnimationDirection.set('prev');
      // Reset direction after animation completes (450ms)
      setTimeout(() => {
        this.imageAnimationDirection.set('');
      }, 450);
    });
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
    this.router.navigate(['/contact/owners', prop.contactId, 'detail']);
  }

  viewTenantProfile(lease: Lease): void {
    if (!lease.contactId) return;
    this.router.navigate(['/contact/tenants', lease.contactId, 'detail']);
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

  getLeaseStatusLabel(status: number): string {
    switch (status) {
      case LeasingStatus.Active:
        return 'Active';
      case LeasingStatus.Expired:
        return 'Expired';
      case LeasingStatus.Terminated:
        return 'Terminated';
      case LeasingStatus.Pending:
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  getLeaseStatusBadgeType(status: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case LeasingStatus.Active:
        return 'default';
      case LeasingStatus.Expired:
        return 'secondary';
      case LeasingStatus.Terminated:
        return 'destructive';
      case LeasingStatus.Pending:
        return 'outline';
      default:
        return 'outline';
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

  // Share public profile link via WhatsApp
  sharePublicProfileViaWhatsApp(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const property = this.property();
    if (!property) {
      this.toastService.error('Property information is required');
      return;
    }

    const link = this.publicProfileLink();
    if (!link) {
      this.toastService.error('No link available to share');
      return;
    }

    // Build message with property name, reference, and link
    const propertyName = property.name || 'Property';
    const propertyReference = property.identifier || 'N/A';
    const message = `Property: ${propertyName}\nReference: ${propertyReference}\nLink: ${link}`;

    shareTextViaWhatsApp(message);
    this.toastService.success('Opening WhatsApp to share property link');
  }

  // Helper method to copy text to clipboard
  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
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
    const property = this.property();
    if (!property) return;

    // Prevent duplicate updates
    if (this.isUpdatingSharing) return;

    this.enableSharing.set(value);
    
    // If sharing is disabled, also disable address sharing and reservation show, and send all updates
    if (!value) {
      this.enableAddressSharing.set(false);
      if (this.isVacationLocation()) {
        this.enableReservationShow.set(false);
      }
      // Send all updates: disable isPublic, isPublicAdresse, and isReservationShow
      this.updatePropertySharingAndAddressAndReservation(value, false, false);
    } else {
      // Only update isPublic when enabling
      this.updatePropertySharing(value);
    }
  }

  updateEnableAddressSharing(value: boolean): void {
    const property = this.property();
    if (!property) return;

    // Prevent duplicate updates
    if (this.isUpdatingSharing) return;

    // Address sharing can only be enabled if sharing is enabled
    if (!this.enableSharing()) {
      return;
    }

    this.enableAddressSharing.set(value);
    // Update backend for isSharingAdresse
    this.updatePropertySharingAdresse(value);
  }

  updateEnableReservationShow(value: boolean): void {
    const property = this.property();
    if (!property) return;

    // Prevent duplicate updates
    if (this.isUpdatingSharing) return;

    // Reservation show can only be enabled if sharing is enabled and property is location vacance
    if (!this.enableSharing() || !this.isVacationLocation()) {
      return;
    }

    this.enableReservationShow.set(value);
    // Update backend for isReservationShow
    this.updatePropertyReservationShow(value);
  }

  private updatePropertySharing(isPublic: boolean): void {
    const property = this.property();
    if (!property) return;

    // Prevent duplicate updates
    if (this.isUpdatingSharing) return;
    this.isUpdatingSharing = true;

    // Preserve existing related data
    const existingLeases = property.leases || [];
    const existingKeys = property.keys || [];
    const existingMaintenances = property.maintenances || [];
    const existingAttachments = property.attachments || [];

    this.propertyService
      .updatePropertySharing({
        propertyId: property.id,
        isPublic: isPublic,
      })
      .pipe(
        catchError((error) => {
          console.error('Error updating property sharing:', error);
          this.toastService.error('Failed to update sharing settings');
          // Revert to previous value on error
          this.enableSharing.set(property.isPublic || false);
          this.isUpdatingSharing = false;
          return of(null);
        }),
      )
      .subscribe((updatedProperty) => {
        this.isUpdatingSharing = false;
        if (updatedProperty) {
          // Merge updated property with existing related data
          // Since visibility updates don't affect related entities, preserve them if backend didn't include them
          const mergedProperty: Property = {
            ...updatedProperty,
            // Preserve existing leases if backend returned empty array but we had leases before
            // or if leases are undefined/null
            leases: (updatedProperty.leases !== undefined && updatedProperty.leases !== null && updatedProperty.leases.length > 0)
              ? updatedProperty.leases 
              : (existingLeases.length > 0 ? existingLeases : (updatedProperty.leases || [])),
            keys: (updatedProperty.keys !== undefined && updatedProperty.keys !== null && updatedProperty.keys.length > 0)
              ? updatedProperty.keys
              : (existingKeys.length > 0 ? existingKeys : (updatedProperty.keys || [])),
            maintenances: (updatedProperty.maintenances !== undefined && updatedProperty.maintenances !== null && updatedProperty.maintenances.length > 0)
              ? updatedProperty.maintenances
              : (existingMaintenances.length > 0 ? existingMaintenances : (updatedProperty.maintenances || [])),
            attachments: (updatedProperty.attachments !== undefined && updatedProperty.attachments !== null && updatedProperty.attachments.length > 0)
              ? updatedProperty.attachments
              : (existingAttachments.length > 0 ? existingAttachments : (updatedProperty.attachments || [])),
          };
          this.property.set(mergedProperty);
          this.toastService.success('Sharing settings updated successfully');
        }
      });
  }

  private updatePropertySharingAdresse(isPublicAdresse: boolean): void {
    const property = this.property();
    if (!property) return;

    // Prevent duplicate updates
    if (this.isUpdatingSharing) return;
    this.isUpdatingSharing = true;

    // Preserve existing related data
    const existingLeases = property.leases || [];
    const existingKeys = property.keys || [];
    const existingMaintenances = property.maintenances || [];
    const existingAttachments = property.attachments || [];

    this.propertyService
      .updatePropertySharingAdresse({
        propertyId: property.id,
        isPublicAdresse: isPublicAdresse,
      })
      .pipe(
        catchError((error) => {
          console.error('Error updating property address sharing:', error);
          this.toastService.error('Failed to update address sharing settings');
          // Revert to previous value on error
          this.enableAddressSharing.set(property.isPublicAdresse || false);
          this.isUpdatingSharing = false;
          return of(null);
        }),
      )
      .subscribe((updatedProperty) => {
        this.isUpdatingSharing = false;
        if (updatedProperty) {
          // Merge updated property with existing related data
          // Since visibility updates don't affect related entities, preserve them if backend didn't include them
          const mergedProperty: Property = {
            ...updatedProperty,
            // Preserve existing leases if backend returned empty array but we had leases before
            // or if leases are undefined/null
            leases: (updatedProperty.leases !== undefined && updatedProperty.leases !== null && updatedProperty.leases.length > 0)
              ? updatedProperty.leases 
              : (existingLeases.length > 0 ? existingLeases : (updatedProperty.leases || [])),
            keys: (updatedProperty.keys !== undefined && updatedProperty.keys !== null && updatedProperty.keys.length > 0)
              ? updatedProperty.keys
              : (existingKeys.length > 0 ? existingKeys : (updatedProperty.keys || [])),
            maintenances: (updatedProperty.maintenances !== undefined && updatedProperty.maintenances !== null && updatedProperty.maintenances.length > 0)
              ? updatedProperty.maintenances
              : (existingMaintenances.length > 0 ? existingMaintenances : (updatedProperty.maintenances || [])),
            attachments: (updatedProperty.attachments !== undefined && updatedProperty.attachments !== null && updatedProperty.attachments.length > 0)
              ? updatedProperty.attachments
              : (existingAttachments.length > 0 ? existingAttachments : (updatedProperty.attachments || [])),
          };
          this.property.set(mergedProperty);
          this.toastService.success('Address sharing settings updated successfully');
        }
      });
  }

  private updatePropertyReservationShow(isReservationShow: boolean): void {
    const property = this.property();
    if (!property) return;

    // Prevent duplicate updates
    if (this.isUpdatingSharing) return;
    this.isUpdatingSharing = true;

    // Preserve existing related data
    const existingLeases = property.leases || [];
    const existingKeys = property.keys || [];
    const existingMaintenances = property.maintenances || [];
    const existingAttachments = property.attachments || [];

    this.propertyService
      .updatePropertyVisibility({
        propertyId: property.id,
        isReservationShow: isReservationShow,
      })
      .pipe(
        catchError((error) => {
          console.error('Error updating property reservation show:', error);
          this.toastService.error('Failed to update reservation show settings');
          // Revert to previous value on error
          this.enableReservationShow.set(property.isReservationShow || false);
          this.isUpdatingSharing = false;
          return of(null);
        }),
      )
      .subscribe((updatedProperty) => {
        this.isUpdatingSharing = false;
        if (updatedProperty) {
          // Merge updated property with existing related data
          const mergedProperty: Property = {
            ...updatedProperty,
            leases: (updatedProperty.leases !== undefined && updatedProperty.leases !== null && updatedProperty.leases.length > 0)
              ? updatedProperty.leases 
              : (existingLeases.length > 0 ? existingLeases : (updatedProperty.leases || [])),
            keys: (updatedProperty.keys !== undefined && updatedProperty.keys !== null && updatedProperty.keys.length > 0)
              ? updatedProperty.keys
              : (existingKeys.length > 0 ? existingKeys : (updatedProperty.keys || [])),
            maintenances: (updatedProperty.maintenances !== undefined && updatedProperty.maintenances !== null && updatedProperty.maintenances.length > 0)
              ? updatedProperty.maintenances
              : (existingMaintenances.length > 0 ? existingMaintenances : (updatedProperty.maintenances || [])),
            attachments: (updatedProperty.attachments !== undefined && updatedProperty.attachments !== null && updatedProperty.attachments.length > 0)
              ? updatedProperty.attachments
              : (existingAttachments.length > 0 ? existingAttachments : (updatedProperty.attachments || [])),
          };
          this.property.set(mergedProperty);
          this.toastService.success('Reservation show settings updated successfully');
        }
      });
  }

  private updatePropertySharingAndAddressAndReservation(isPublic: boolean, isPublicAdresse: boolean, isReservationShow: boolean): void {
    const property = this.property();
    if (!property) return;

    // Prevent duplicate updates
    if (this.isUpdatingSharing) return;
    this.isUpdatingSharing = true;

    // Preserve existing related data
    const existingLeases = property.leases || [];
    const existingKeys = property.keys || [];
    const existingMaintenances = property.maintenances || [];
    const existingAttachments = property.attachments || [];

    // Send all fields in a single request
    this.propertyService
      .updatePropertyVisibility({
        propertyId: property.id,
        isPublic: isPublic,
        isPublicAdresse: isPublicAdresse,
        isReservationShow: isReservationShow,
      })
      .pipe(
        catchError((error) => {
          console.error('Error updating property sharing settings:', error);
          this.toastService.error('Failed to update sharing settings');
          // Revert to previous values on error
          this.enableSharing.set(property.isPublic || false);
          this.enableAddressSharing.set(property.isPublicAdresse || false);
          this.enableReservationShow.set(property.isReservationShow || false);
          this.isUpdatingSharing = false;
          return of(null);
        }),
      )
      .subscribe((updatedProperty) => {
        this.isUpdatingSharing = false;
        if (updatedProperty) {
          // Merge updated property with existing related data
          const mergedProperty: Property = {
            ...updatedProperty,
            leases: (updatedProperty.leases !== undefined && updatedProperty.leases !== null && updatedProperty.leases.length > 0)
              ? updatedProperty.leases 
              : (existingLeases.length > 0 ? existingLeases : (updatedProperty.leases || [])),
            keys: (updatedProperty.keys !== undefined && updatedProperty.keys !== null && updatedProperty.keys.length > 0)
              ? updatedProperty.keys
              : (existingKeys.length > 0 ? existingKeys : (updatedProperty.keys || [])),
            maintenances: (updatedProperty.maintenances !== undefined && updatedProperty.maintenances !== null && updatedProperty.maintenances.length > 0)
              ? updatedProperty.maintenances
              : (existingMaintenances.length > 0 ? existingMaintenances : (updatedProperty.maintenances || [])),
            attachments: (updatedProperty.attachments !== undefined && updatedProperty.attachments !== null && updatedProperty.attachments.length > 0)
              ? updatedProperty.attachments
              : (existingAttachments.length > 0 ? existingAttachments : (updatedProperty.attachments || [])),
          };
          this.property.set(mergedProperty);
          this.toastService.success('Sharing settings updated successfully');
        }
      });
  }

  private updatePropertySharingAndAddress(isPublic: boolean, isPublicAdresse: boolean): void {
    const property = this.property();
    if (!property) return;

    // Prevent duplicate updates
    if (this.isUpdatingSharing) return;
    this.isUpdatingSharing = true;

    // Preserve existing related data
    const existingLeases = property.leases || [];
    const existingKeys = property.keys || [];
    const existingMaintenances = property.maintenances || [];
    const existingAttachments = property.attachments || [];

    // Send both fields in a single request
    this.propertyService
      .updatePropertyVisibility({
        propertyId: property.id,
        isPublic: isPublic,
        isPublicAdresse: isPublicAdresse,
      })
      .pipe(
        catchError((error) => {
          console.error('Error updating property sharing settings:', error);
          this.toastService.error('Failed to update sharing settings');
          // Revert to previous values on error
          this.enableSharing.set(property.isPublic || false);
          this.enableAddressSharing.set(property.isPublicAdresse || false);
          this.isUpdatingSharing = false;
          return of(null);
        }),
      )
      .subscribe((updatedProperty) => {
        this.isUpdatingSharing = false;
        if (updatedProperty) {
          // Merge updated property with existing related data
          // Since visibility updates don't affect related entities, preserve them if backend didn't include them
          const mergedProperty: Property = {
            ...updatedProperty,
            // Preserve existing leases if backend returned empty array but we had leases before
            // or if leases are undefined/null
            leases: (updatedProperty.leases !== undefined && updatedProperty.leases !== null && updatedProperty.leases.length > 0)
              ? updatedProperty.leases 
              : (existingLeases.length > 0 ? existingLeases : (updatedProperty.leases || [])),
            keys: (updatedProperty.keys !== undefined && updatedProperty.keys !== null && updatedProperty.keys.length > 0)
              ? updatedProperty.keys
              : (existingKeys.length > 0 ? existingKeys : (updatedProperty.keys || [])),
            maintenances: (updatedProperty.maintenances !== undefined && updatedProperty.maintenances !== null && updatedProperty.maintenances.length > 0)
              ? updatedProperty.maintenances
              : (existingMaintenances.length > 0 ? existingMaintenances : (updatedProperty.maintenances || [])),
            attachments: (updatedProperty.attachments !== undefined && updatedProperty.attachments !== null && updatedProperty.attachments.length > 0)
              ? updatedProperty.attachments
              : (existingAttachments.length > 0 ? existingAttachments : (updatedProperty.attachments || [])),
          };
          this.property.set(mergedProperty);
          this.toastService.success('Sharing settings updated successfully');
        }
      });
  }
}
