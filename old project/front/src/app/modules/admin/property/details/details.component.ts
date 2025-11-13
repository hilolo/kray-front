import { DatePipe, LowerCasePipe, NgClass, NgFor, NgIf, NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { Subject, takeUntil } from 'rxjs';
import { ImageViewerComponent } from 'app/core/image-viewer/image-viewer.component';
import { Contact } from '../../contacts/contacts.types';
import { Leasing, LeasingStatus, PaymentType, PaymentMethod, calculateDetailedTenancyDuration, formatTenancyDuration, getLeasingStatusLabel, getPaymentMethodLabel, getPaymentTypeLabel } from '../../leasing/leasing.types';
import { LeasingDetailComponent } from '../../leasing/detail/detail.component';
import { ReservationService } from '../../reservation/reservation.service';
import { Reservation, ReservationStatus, ReservationStatusColors, calculateNumberOfNights, getReservationStatusLabel } from '../../reservation/reservation.types';
import { PropertyService } from '../property.service';
import { AttachmentDetails, Property, PropertyCategory, PropertyMaintenanceSummary, UpdatePropertyVisibilityDto, getPropertyCategoryLabel } from '../property.types';
import { PrintService } from './print.service';
import { MaintenancePriority, MaintenanceStatus, getMaintenancePriorityColor, getMaintenancePriorityLabel, getMaintenanceStatusColor, getMaintenanceStatusLabel } from '../../maintenance/maintenance.types';
import { PricePaymentTypePipe } from '@fuse/pipes/price-payment-type/price-payment-type.pipe';

@Component({
    selector       : 'property-details',
    templateUrl    : './details.component.html',
    styleUrls      : ['./details.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        NgClass,
        NgFor,
        NgIf,
        NgOptimizedImage,
        UpperCasePipe,
        MatButtonModule,
        MatChipsModule,
        MatDividerModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatTabsModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatDialogModule,
        ImageViewerComponent,
        PricePaymentTypePipe,
    ],
    providers      : [
        DatePipe,
    ],
})
export class PropertyDetailsComponent implements OnInit, OnDestroy
{
    property: Property | null = null;
    leases: Leasing[] = [];
    reservations: Reservation[] = [];
    isLoadingProperty = true;
    isLoadingLeases = false;
    isLoadingReservations = false;
    hasLeasingError = false;
    hasReservationError = false;
    activeImageIndex = 0;

    viewerImages: Array<{ url: string; name: string; size: number }> = [];
    isImageViewerOpen = false;
    viewerIndex = 0;

    ownerContact: Contact | null = null;
    ownerContactLoading = false; // No longer used, kept for backward compatibility
    isUpdatingVisibility = false;
    publicLink: string | null = null;
    canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard;

    get publicLinkDisplay(): string | null
    {
        if (!this.publicLink)
        {
            return null;
        }

        const truncate = (value: string): string =>
        {
            const limit = 48;

            if (value.length <= limit)
            {
                return value;
            }

            return `${value.slice(0, 28)}…${value.slice(-12)}`;
        };

        try
        {
            const url = new URL(this.publicLink);
            const formatted = `${url.host}${url.pathname}`.replace(/\/$/, '');

            return truncate(formatted);
        }
        catch
        {
            return truncate(this.publicLink);
        }
    }

    get publicLinkDomain(): string | null
    {
        if (!this.publicLink)
        {
            return null;
        }

        try
        {
            const url = new URL(this.publicLink);
            return url.hostname;
        }
        catch
        {
            return null;
        }
    }

    // Calendar properties
    currentMonth: Date = new Date();
    calendarDays: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; reservations: Reservation[] }> = [];

    private _galleryCache: AttachmentDetails[] = [];
    private _destroy$: Subject<void> = new Subject<void>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _propertyService: PropertyService,
            private _reservationService: ReservationService,
        private _errorHandlerService: ErrorHandlerService,
        private _cdr: ChangeDetectorRef,
        private _datePipe: DatePipe,
        private _dialog: MatDialog,
        private _printService: PrintService,
        @Optional() @Inject(MAT_DIALOG_DATA) private _dialogData?: { propertyId: string },
        @Optional() private _dialogRef?: MatDialogRef<PropertyDetailsComponent>,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void
    {
        // Initialize calendar
        this._generateCalendar();
        
        // Check if opened in dialog
        if (this._dialogData && this._dialogData.propertyId) {
            this._fetchProperty(this._dialogData.propertyId);
            return;
        }
        
        // Otherwise, get from route
        this._activatedRoute.params
            .pipe(takeUntil(this._destroy$))
            .subscribe(params =>
            {
                const propertyId = params['id'];

                if (!propertyId)
                {
                    this._errorHandlerService.showErrorAlert(
                        'Property Not Found',
                        'The requested property identifier is missing. Returning to the property list.'
                    );
                    if (this._dialogRef) {
                        this._dialogRef.close();
                    } else {
                        this._router.navigate(['/property']);
                    }
                    return;
                }

                this._fetchProperty(propertyId);
            });
    }

    ngOnDestroy(): void
    {
        this._destroy$.next();
        this._destroy$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Data loading
    // -----------------------------------------------------------------------------------------------------

    private _fetchProperty(id: string): void
    {
        this.isLoadingProperty = true;
        this.isLoadingLeases = true; // Leases are loaded with property
        this.property = null;
        this.leases = [];
        this._galleryCache = [];
        this.viewerImages = [];
        this.activeImageIndex = 0;
        this.viewerIndex = 0;
        this.isImageViewerOpen = false;
        this._cdr.markForCheck();

        // Pass includeRelated=true for detail mode to get all related entities
        this._propertyService
            .getPropertyById(id, true)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (property) =>
                {
                    if (!property)
                    {
                        this._errorHandlerService.showErrorAlert(
                            'Property Not Found',
                            'The requested property could not be located.'
                        );
                        if (this._dialogRef) {
                            this._dialogRef.close();
                        } else {
                            this._router.navigate(['/property']);
                        }
                        return;
                    }

                    this.property = property;
                    this.activeImageIndex = 0;
                    this.isLoadingProperty = false;
                    this._setPublicLink(property.id);

                    this._prepareImageViewerSources();
                    // Use contact from property object instead of making separate API call
                    if (property.contact)
                    {
                        this.ownerContact = property.contact as any;
                    }

                    // Use leases from property object (already included in backend response)
                    this.leases = property.leases || [];
                    this.isLoadingLeases = false;
                    this.hasLeasingError = false;

                    if (this.showReservationsTab)
                    {
                        this._loadReservations(property.id);
                    }

                    this._cdr.markForCheck();
                },
                error: (error) =>
                {
                    this.isLoadingProperty = false;
                    this._errorHandlerService.showErrorAlert(
                        'Failed to Load Property',
                        error?.error?.message || 'An unexpected error occurred while loading the property details.'
                    );
                    if (this._dialogRef) {
                        this._dialogRef.close();
                    } else {
                        this._router.navigate(['/property']);
                    }
                    this.ownerContact = null;
                    this._cdr.markForCheck();
                },
            });
    }


    private _loadReservations(propertyId: string): void
    {
        this.isLoadingReservations = true;
        this.hasReservationError = false;
        this._cdr.markForCheck();

        // Calculate date range for the current month (same as reservation module)
        const startDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const endDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);

        this._reservationService
            .getReservations({
                currentPage: 1,
                pageSize   : 1000, // Use larger page size like calendar view in reservation module
                ignore     : true,
                propertyId,
                startDateFrom: startDate.toISOString(),
                startDateTo: endDate.toISOString(),
            })
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (result) =>
                {
                    this.reservations = result?.result || [];
                    this.isLoadingReservations = false;
                    this._generateCalendar();
                    this._cdr.markForCheck();
                },
                error: (error) =>
                {
                    this.isLoadingReservations = false;
                    this.hasReservationError = true;
                    this._errorHandlerService.showErrorAlert(
                        'Failed to Load Reservations',
                        error?.error?.message || 'We could not retrieve reservation information for this property.'
                    );
                    this._cdr.markForCheck();
                },
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Template helpers
    // -----------------------------------------------------------------------------------------------------

    get galleryImages(): AttachmentDetails[]
    {
        return this._galleryCache;
    }

    get mainImageUrl(): string | null
    {
        if (this.galleryImages.length === 0)
        {
            return null;
        }

        const index = this.activeImageIndex >= 0 && this.activeImageIndex < this.galleryImages.length
            ? this.activeImageIndex
            : 0;

        return this.getImageUrl(this.galleryImages[index]?.url);
    }

    getPropertyCategoryLabel(category: PropertyCategory | string | null | undefined): string
    {
        if (category === null || category === undefined)
        {
            return 'Non spécifié';
        }

        // Handle string values from backend
        if (typeof category === 'string')
        {
            const normalized = category.replace(/\s+/g, '').toLowerCase();
            switch (normalized)
            {
                case 'location':
                    return 'Location';
                case 'vente':
                    return 'Vente';
                case 'locationvacances':
                    return 'Location vacances';
                default:
                    return category;
            }
        }

        return getPropertyCategoryLabel(category);
    }

    get showLeasesTab(): boolean
    {
        return this.isCategory(PropertyCategory.Location);
    }

    get showReservationsTab(): boolean
    {
        return this.isCategory(PropertyCategory.LocationVacances);
    }

    get maintenanceRequests(): PropertyMaintenanceSummary[]
    {
        if (!this.property?.maintenances || this.property.maintenances.length === 0)
        {
            return [];
        }

        return [...this.property.maintenances].sort((a, b) =>
        {
            const aTime = a?.scheduledDateTime ? new Date(a.scheduledDateTime as any).getTime() : 0;
            const bTime = b?.scheduledDateTime ? new Date(b.scheduledDateTime as any).getTime() : 0;
            return bTime - aTime;
        });
    }

    get hasMaintenanceRequests(): boolean
    {
        return this.maintenanceRequests.length > 0;
    }

    getDefaultTabIndex(): number
    {
        // Leases is always first when available, so default to index 0
        return 0;
    }

    isCategory(category: PropertyCategory): boolean
    {
        if (!this.property || this.property.category === null || this.property.category === undefined)
        {
            return false;
        }

        if (typeof this.property.category === 'number')
        {
            return Number(this.property.category) === category;
        }

        const normalized = String(this.property.category).replace(/\s+/g, '').toLowerCase();
        if (category === PropertyCategory.Location)
        {
            return normalized === 'location';
        }

        if (category === PropertyCategory.Vente)
        {
            return normalized === 'vente';
        }

        return normalized === 'locationvacances';
    }

    get hasGallery(): boolean
    {
        return this.galleryImages.length > 0;
    }

    get features(): string[]
    {
        return this.property?.features || [];
    }

    get equipment(): string[]
    {
        return this.property?.equipment || [];
    }

    get ownerDisplayName(): string
    {
        const contact = this.ownerContact || this.property?.contact;
        if (contact)
        {
            if (contact.isACompany)
            {
                return contact.companyName || (contact as any).name;
            }

            const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
            return fullName || (contact as any).name;
        }

        return this.property?.ownerName || 'Owner';
    }

    get ownerIdentifier(): string | null
    {
        const contact = this.ownerContact || this.property?.contact;
        return contact?.identifier || null;
    }

    get ownerEmail(): string | null
    {
        const contact = this.ownerContact || this.property?.contact;
        return contact?.email || (contact as any)?.emails?.[0]?.email || null;
    }

    get ownerPhone(): string | null
    {
        const contact = this.ownerContact || this.property?.contact;
        if (contact?.phones?.length)
        {
            return contact.phones[0];
        }

        if ((contact as any)?.phoneNumbers?.length)
        {
            return (contact as any).phoneNumbers[0].phoneNumber;
        }

        return null;
    }

    get ownerAddress(): string | null
    {
        const contact = this.ownerContact || this.property?.contact;
        return (contact as any)?.address || null;
    }

    get ownerAvatarUrl(): string | null
    {
        const contact = this.ownerContact || this.property?.contact;
        const avatar = contact?.avatar;
        if (!avatar)
        {
            return null;
        }

        // If it's already a full URL (http/https) or data URL, return as is
        if (avatar.startsWith('data:') || avatar.startsWith('http://') || avatar.startsWith('https://'))
        {
            return avatar;
        }

        // If it's just a filename (backward compatibility), return null to show initial
        // The backend should now always return full URLs, but handle this case gracefully
        return null;
    }

    get hasOwnerDetails(): boolean
    {
        return Boolean(this.ownerIdentifier || this.ownerEmail || this.ownerPhone || this.ownerAddress);
    }

    formatAmount(amount: number | null | undefined): string
    {
        if (amount === null || amount === undefined)
        {
            return '—';
        }

        return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)} MAD`;
    }

    formatArea(area: number | null | undefined): string
    {
        if (area === null || area === undefined)
        {
            return '—';
        }

        return `${area} m²`;
    }

    formatDate(date: string | null | undefined): string
    {
        if (!date)
        {
            return '—';
        }

        return this._datePipe.transform(date, 'dd MMM yyyy') || '—';
    }

    formatDateTime(date: string | Date | null | undefined): string
    {
        if (!date)
        {
            return '—';
        }

        const parsed = typeof date === 'string' || date instanceof String
            ? new Date(date as string)
            : (date as Date);

        if (Number.isNaN(parsed.getTime()))
        {
            return '—';
        }

        const formattedDate = this._datePipe.transform(parsed, 'dd MMM yyyy');
        const formattedTime = this._datePipe.transform(parsed, 'HH:mm');

        if (!formattedDate || !formattedTime)
        {
            return '—';
        }

        return `${formattedDate} · ${formattedTime}`;
    }

    getImageUrl(url: string | null | undefined): string | null
    {
        if (!url)
        {
            return null;
        }

        if (url.startsWith('data:') || url.startsWith('http'))
        {
            return url;
        }

        return `data:image/png;base64,${url}`;
    }

    selectImage(index: number): void
    {
        if (index < 0 || index >= this.galleryImages.length)
        {
            return;
        }

        this.activeImageIndex = index;
        this.viewerIndex = this.viewerImages.length ? Math.min(index, this.viewerImages.length - 1) : 0;
        this._cdr.markForCheck();
    }

    previousImage(event?: Event): void
    {
        if (event)
        {
            event.stopPropagation();
            event.preventDefault();
        }

        if (this.galleryImages.length <= 1)
        {
            return;
        }

        this.activeImageIndex = (this.activeImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        this.viewerIndex = this.viewerImages.length ? Math.min(this.activeImageIndex, this.viewerImages.length - 1) : 0;
        this._cdr.markForCheck();
    }

    nextImage(event?: Event): void
    {
        if (event)
        {
            event.stopPropagation();
            event.preventDefault();
        }

        if (this.galleryImages.length <= 1)
        {
            return;
        }

        this.activeImageIndex = (this.activeImageIndex + 1) % this.galleryImages.length;
        this.viewerIndex = this.viewerImages.length ? Math.min(this.activeImageIndex, this.viewerImages.length - 1) : 0;
        this._cdr.markForCheck();
    }

    openImageViewer(index: number): void
    {
        if (!this.viewerImages.length)
        {
            return;
        }

        this.viewerIndex = Math.min(Math.max(index, 0), this.viewerImages.length - 1);
        this.isImageViewerOpen = true;
        this._cdr.markForCheck();
    }

    closeImageViewer(): void
    {
        this.isImageViewerOpen = false;
        this._cdr.markForCheck();
    }

    onViewerImageChanged(index: number): void
    {
        this.viewerIndex = index;
        if (this.galleryImages.length > 0)
        {
            this.activeImageIndex = Math.min(index, this.galleryImages.length - 1);
        }
        this._cdr.markForCheck();
    }

    onVisibilityToggle(flag: 'isPublic' | 'isPublicAdresse', event: MatSlideToggleChange): void
    {
        if (!this.property || this.isUpdatingVisibility)
        {
            return;
        }

        const newValue = event.checked;
        const previousIsPublic = this.property.isPublic ?? false;
        const previousIsPublicAdresse = this.property.isPublicAdresse ?? false;

        const payload: UpdatePropertyVisibilityDto = {
            propertyId: this.property.id
        };

        if (flag === 'isPublic')
        {
            payload.isPublic = newValue;
            // If property is being made private, ensure address becomes private too
            if (!newValue && previousIsPublicAdresse)
            {
                payload.isPublicAdresse = false;
            }

            this.property = {
                ...this.property,
                isPublic: newValue,
                isPublicAdresse: !newValue ? false : this.property.isPublicAdresse
            };
        }
        else
        {
            payload.isPublicAdresse = newValue;
            this.property = {
                ...this.property,
                isPublicAdresse: newValue
            };
        }

        this.isUpdatingVisibility = true;
        this._cdr.markForCheck();

        this._propertyService
            .updatePropertyVisibility(payload)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (updatedProperty) =>
                {
                    if (updatedProperty)
                    {
                        this.property = {
                            ...this.property,
                            ...updatedProperty
                        };
                        this._setPublicLink(updatedProperty.id);
                        this._errorHandlerService.showSuccessAlert(
                            'Visibility updated',
                            flag === 'isPublic'
                                ? 'Public visibility preference saved successfully.'
                                : 'Address visibility preference saved successfully.'
                        );
                    }
                    this.isUpdatingVisibility = false;
                    this._cdr.markForCheck();
                },
                error: (error) =>
                {
                    this.property = {
                        ...this.property,
                        isPublic: previousIsPublic,
                        isPublicAdresse: previousIsPublicAdresse
                    };
                    this.isUpdatingVisibility = false;
                    this._errorHandlerService.showErrorAlert(
                        'Update failed',
                        error?.error?.message || 'Unable to update the visibility settings. Please try again.'
                    );
                    this._cdr.markForCheck();
                },
            });
    }

    openPublicLink(): void
    {
        if (!this.publicLink)
        {
            return;
        }

        window.open(this.publicLink, '_blank', 'noopener');
    }

    copyPublicLink(): void
    {
        if (!this.publicLink || !this.canCopy)
        {
            return;
        }

        navigator.clipboard.writeText(this.publicLink)
            .then(() => {
                this._errorHandlerService.showSuccessAlert('Link copied', 'The public link was copied to your clipboard.');
            })
            .catch(() => {
                this._errorHandlerService.showErrorAlert('Copy failed', 'Unable to copy the link. Please copy it manually.');
            });
    }

    sharePublicLinkViaWhatsApp(): void
    {
        if (!this.publicLink || typeof window === 'undefined')
        {
            return;
        }

        const message = `Découvrez ce bien immobilier : ${this.publicLink}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank', 'noopener');
    }

    private _setPublicLink(propertyId: string): void
    {
        if (typeof window === 'undefined')
        {
            this.publicLink = null;
            return;
        }

        this.publicLink = `${window.location.origin}/property/${propertyId}/public`;
    }

    trackById(index: number, item: any): string | number
    {
        if (item && typeof item === 'object' && 'id' in item && item.id)
        {
            return item.id as string;
        }

        if (typeof item === 'string' || typeof item === 'number')
        {
            return item;
        }

        return index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Leasing helpers
    // -----------------------------------------------------------------------------------------------------

    getLeasingStatusChipClass(status: LeasingStatus | string | number | undefined | null): string
    {
        const value = typeof status === 'string' ? status.toLowerCase() : status;

        switch (value)
        {
            case LeasingStatus.Active:
            case 'active':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            case LeasingStatus.Pending:
            case 'pending':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case LeasingStatus.Terminated:
            case 'terminated':
                return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
            case LeasingStatus.Expired:
            case 'expired':
                return 'bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';
            default:
                return 'bg-gray-200 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300';
        }
    }

    getLeasingStatusLabel(status: LeasingStatus | string | number | undefined | null): string
    {
        return getLeasingStatusLabel(status as any);
    }

    getPaymentTypeLabel(type: PaymentType | string | number | undefined | null): string
    {
        return getPaymentTypeLabel(type as any);
    }

    getPaymentMethodLabel(method: PaymentMethod | string | number | undefined | null): string
    {
        return getPaymentMethodLabel(method as any);
    }

    getLeasingDuration(leasing: Leasing): string
    {
        const duration = calculateDetailedTenancyDuration(leasing.tenancyStart, leasing.tenancyEnd);
        return formatTenancyDuration(duration);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Reservation helpers
    // -----------------------------------------------------------------------------------------------------

    getReservationStatusBadge(status: ReservationStatus | string | number | null | undefined): string
    {
        if (status === null || status === undefined) {
            return 'bg-gray-500';
        }
        
        // If it's already a number, use it directly
        if (typeof status === 'number') {
            return ReservationStatusColors[status as ReservationStatus] || 'bg-gray-500';
        }
        
        // If it's a string, try to parse it as a number first
        if (typeof status === 'string') {
            // Try parsing as number
            const statusNum = parseInt(status, 10);
            if (!isNaN(statusNum) && ReservationStatusColors[statusNum as ReservationStatus]) {
                return ReservationStatusColors[statusNum as ReservationStatus];
            }
            
            // Try matching by enum name (case-insensitive)
            const enumKey = Object.keys(ReservationStatus).find(key => 
                key.toLowerCase() === status.toLowerCase()
            ) as keyof typeof ReservationStatus;
            
            if (enumKey && ReservationStatus[enumKey] !== undefined) {
                const enumValue = ReservationStatus[enumKey] as ReservationStatus;
                return ReservationStatusColors[enumValue] || 'bg-gray-500';
            }
        }
        
        return 'bg-gray-500';
    }

    getReservationStatusLabel(status: ReservationStatus | string | number): string
    {
        return getReservationStatusLabel(status);
    }

    private _parseReservationStatus(status: ReservationStatus | string | number | null | undefined): ReservationStatus | null
    {
        if (status === null || status === undefined) {
            return null;
        }
        
        // Parse status to number
        let statusNum: number;
        if (typeof status === 'number') {
            statusNum = status;
        } else if (typeof status === 'string') {
            statusNum = parseInt(status, 10);
            if (isNaN(statusNum)) {
                // Try matching by enum name
                const enumKey = Object.keys(ReservationStatus).find(key => 
                    key.toLowerCase() === status.toLowerCase()
                ) as keyof typeof ReservationStatus;
                if (enumKey && ReservationStatus[enumKey] !== undefined) {
                    statusNum = ReservationStatus[enumKey] as ReservationStatus;
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }
        
        return statusNum as ReservationStatus;
    }

    getReservationDotColor(status: ReservationStatus | string | number | null | undefined): string
    {
        const statusNum = this._parseReservationStatus(status);
        
        if (statusNum === null) {
            return 'bg-pink-600';
        }
        
        // Return color based on status
        switch (statusNum) {
            case ReservationStatus.Pending:
                return 'bg-yellow-400 dark:bg-yellow-600';
            case ReservationStatus.Approved:
            case ReservationStatus.Completed:
                return 'bg-pink-600';
            case ReservationStatus.Rejected:
            case ReservationStatus.Cancelled:
                return 'bg-gray-500';
            default:
                return 'bg-pink-600';
        }
    }

    getReservationDuration(reservation: Reservation): string
    {
        const nights = calculateNumberOfNights(reservation.startDate, reservation.endDate);
        return `${nights} ${nights === 1 ? 'night' : 'nights'}`;
    }

    trackByMaintenance(index: number, maintenance: PropertyMaintenanceSummary): string
    {
        return maintenance?.id ?? index.toString();
    }

    getMaintenanceStatusBadge(status: MaintenanceStatus | string | number): string
    {
        const color = getMaintenanceStatusColor(status);
        switch (color)
        {
            case 'amber':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'blue':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'green':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'gray':
            default:
                return 'bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';
        }
    }

    getMaintenancePriorityBadge(priority: MaintenancePriority | string | number): string
    {
        const color = getMaintenancePriorityColor(priority);
        switch (color)
        {
            case 'blue':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'yellow':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'red':
                return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
            case 'gray':
            default:
                return 'bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';
        }
    }

    getMaintenanceStatusLabelText(status: MaintenanceStatus | string | number): string
    {
        return getMaintenanceStatusLabel(status);
    }

    getMaintenancePriorityLabelText(priority: MaintenancePriority | string | number): string
    {
        return getMaintenancePriorityLabel(priority);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lease helpers
    // -----------------------------------------------------------------------------------------------------

    viewLease(lease: Leasing): void
    {
        if (!lease?.id)
        {
            return;
        }

        const dialogRef = this._dialog.open(LeasingDetailComponent, {
            width: '90vw',
            maxWidth: '1400px',
            height: '90vh',
            maxHeight: '900px',
            panelClass: 'leasing-detail-dialog',
            data: {
                leasingId: lease.id,
                isViewMode: true,
                isEditMode: false
            },
            disableClose: false,
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(() =>
        {
            // Optionally refresh lease data if needed
            this._cdr.markForCheck();
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Calendar helpers
    // -----------------------------------------------------------------------------------------------------

    private _generateCalendar(): void
    {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Get first day of month and last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Get first day of week (0 = Sunday, 1 = Monday, etc.)
        // We want to start from Monday, so we adjust: Monday = 0, Sunday = 6
        const firstDayOfWeek = firstDay.getDay();
        const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        // Get last day of month
        const daysInMonth = lastDay.getDate();
        
        // Get days from previous month
        const prevMonth = new Date(year, month - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; reservations: Reservation[] }> = [];
        
        // Add previous month's trailing days (including all days, no skipping)
        for (let i = startOffset - 1; i >= 0; i--)
        {
            const date = new Date(year, month - 1, daysInPrevMonth - i);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: this._isToday(date),
                reservations: this._getReservationsForDate(date),
            });
        }
        
        // Add current month's days (including all days, no skipping)
        for (let day = 1; day <= daysInMonth; day++)
        {
            const date = new Date(year, month, day);
            days.push({
                date,
                isCurrentMonth: true,
                isToday: this._isToday(date),
                reservations: this._getReservationsForDate(date),
            });
        }
        
        // Add next month's leading days to fill complete rows (7 days per row)
        const daysPerRow = 7;
        const currentRows = Math.ceil(days.length / daysPerRow);
        const targetDays = currentRows * daysPerRow;
        let daysAdded = 0;
        
        for (let day = 1; daysAdded < (targetDays - days.length); day++)
        {
            const date = new Date(year, month + 1, day);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: this._isToday(date),
                reservations: this._getReservationsForDate(date),
            });
            daysAdded++;
        }
        
        this.calendarDays = days;
    }

    private _isToday(date: Date): boolean
    {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    private _getReservationsForDate(date: Date): Reservation[]
    {
        if (!this.reservations || this.reservations.length === 0)
        {
            return [];
        }

        // Normalize dates to midnight for comparison (ignore time)
        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        return this.reservations.filter(reservation =>
        {
            // Exclude cancelled reservations from calendar
            const status = this._parseReservationStatus(reservation.status);
            if (status === ReservationStatus.Cancelled)
            {
                return false;
            }
            
            const startDate = new Date(reservation.startDate);
            const endDate = new Date(reservation.endDate);
            
            // Normalize to midnight
            const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            
            // Check if the date falls within the reservation range (inclusive)
            // OR if it's the day after the end date (to show end marker on day 11 for reservation ending on day 10)
            const dayAfterEnd = new Date(end);
            dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
            
            return checkDate >= start && (checkDate <= end || checkDate.getTime() === dayAfterEnd.getTime());
        });
    }

    getDayStatusClass(day: { date: Date; isCurrentMonth: boolean; isToday: boolean; reservations: Reservation[] }): string
    {
        if (!day.isCurrentMonth)
        {
            return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500';
        }

        // Existing reservations
        if (day.reservations.length === 0)
        {
            return 'bg-green-100 dark:bg-green-900/40 text-gray-900 dark:text-gray-100';
        }

        // Check if there are any pending reservations
        const hasPendingReservation = day.reservations.some(r => {
            const status = this._parseReservationStatus(r.status);
            return status === ReservationStatus.Pending;
        });

        // Check if it's a start date of a reservation (bottom-right half pink/yellow)
        const isReservationStart = day.reservations.some(r => 
        {
            const startDate = new Date(r.startDate);
            const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const normalizedDay = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
            return normalizedStart.getTime() === normalizedDay.getTime();
        });
        
        // Check if it's the day after the end date (to show end marker on first half of day 11)
        // The actual end date (day 10) should show as fully reserved (middle day), not as an end marker
        const normalizedDay = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
        const previousDay = new Date(normalizedDay);
        previousDay.setDate(previousDay.getDate() - 1);
        
        const isReservationEnd = day.reservations.some(r => 
        {
            const endDate = new Date(r.endDate);
            const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            
            // Only check if it's the day after the end date (to show end marker on first half of day 11)
            // The actual end date itself will be treated as a middle day
            const dayAfterEnd = new Date(normalizedEnd);
            dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
            return dayAfterEnd.getTime() === normalizedDay.getTime();
        });
        
        // Check if the reservation that ended on the previous day was pending
        const hasEndingPendingReservation = this.reservations?.some(r => {
            const status = this._parseReservationStatus(r.status);
            if (status !== ReservationStatus.Pending) {
                return false;
            }
            const endDate = new Date(r.endDate);
            const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            return normalizedEnd.getTime() === previousDay.getTime();
        }) || false;

        // Check if there's an approved/reserved reservation ending on the previous day
        const hasEndingReservation = this.reservations?.some(r => {
            const status = this._parseReservationStatus(r.status);
            if (status === ReservationStatus.Cancelled || status === ReservationStatus.Pending) {
                return false;
            }
            const endDate = new Date(r.endDate);
            const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            return normalizedEnd.getTime() === previousDay.getTime();
        }) || false;

        // Check if there's a pending reservation starting on this day
        const hasStartingPendingReservation = day.reservations.some(r => {
            const status = this._parseReservationStatus(r.status);
            if (status !== ReservationStatus.Pending) {
                return false;
            }
            const startDate = new Date(r.startDate);
            const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            return normalizedStart.getTime() === normalizedDay.getTime();
        });

        // Special case: day is both end marker (from previous day's approved reservation) 
        // and start marker (for pending reservation on this day)
        // Show top-left pink/red (end) and bottom-right yellow (start)
        if (hasEndingReservation && hasStartingPendingReservation)
        {
            return 'calendar-day-end-start-mixed';
        }

        // If it's both start and end (same day reservation)
        if (isReservationStart && isReservationEnd)
        {
            if (hasPendingReservation) {
                return 'bg-yellow-400 dark:bg-yellow-900/60 text-white dark:text-yellow-100';
            }
            return 'bg-pink-400 dark:bg-pink-900/60 text-white dark:text-pink-100';
        }

        // If it's a start date, show bottom-right half pink/yellow
        if (isReservationStart)
        {
            if (hasPendingReservation) {
                return 'calendar-day-selected-start-yellow';
            }
            return 'calendar-day-selected-start';
        }

        // If it's an end date, show top-left half pink/yellow
        if (isReservationEnd)
        {
            // Check if the reservation that ended was pending (not if there's a pending reservation on this day)
            if (hasEndingPendingReservation) {
                return 'calendar-day-selected-end-yellow';
            }
            return 'calendar-day-selected-end';
        }

        // Middle of reservation (fully pink/yellow)
        if (hasPendingReservation) {
            return 'bg-yellow-200 dark:bg-yellow-900/40 text-gray-900 dark:text-yellow-100';
        }
        return 'bg-pink-300 dark:bg-pink-900/50 text-white dark:text-pink-100';
    }

    getMonthYearLabel(): string
    {
        return this._datePipe.transform(this.currentMonth, 'MMMM yyyy', 'fr-FR') || '';
    }

    previousMonth(): void
    {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
        this._generateCalendar();
        // Reload reservations for the new month
        if (this.property?.id)
        {
            this._loadReservations(this.property.id);
        }
        this._cdr.markForCheck();
    }

    nextMonth(): void
    {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
        this._generateCalendar();
        // Reload reservations for the new month
        if (this.property?.id)
        {
            this._loadReservations(this.property.id);
        }
        this._cdr.markForCheck();
    }

    goToToday(): void
    {
        this.currentMonth = new Date();
        this._generateCalendar();
        // Reload reservations for the current month
        if (this.property?.id)
        {
            this._loadReservations(this.property.id);
        }
        this._cdr.markForCheck();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Actions
    // -----------------------------------------------------------------------------------------------------

    goBack(): void
    {
        if (this._dialogRef) {
            this._dialogRef.close();
        } else {
            this._router.navigate(['/property']);
        }
    }

    editProperty(): void
    {
        if (!this.property)
        {
            return;
        }

        this._router.navigate(['/property', this.property.id, 'edit']);
    }

    viewOwner(): void
    {
        if (!this.property?.contactId)
        {
            return;
        }

        this._router.navigate(['/contacts/owners', this.property.contactId]);
    }


    private _prepareImageViewerSources(): void
    {
        const attachments: AttachmentDetails[] = [];

        if (this.property?.attachments?.length)
        {
            attachments.push(...this.property.attachments);
        }
        else if (this.property?.defaultAttachmentId && this.property?.defaultAttachmentUrl)
        {
            attachments.push({
                id      : this.property.defaultAttachmentId,
                url     : this.property.defaultAttachmentUrl,
                fileName: 'default-image',
            });
        }

        this._galleryCache = attachments;

        const viewerImages = attachments
            .map((attachment, index) =>
            {
                const imageUrl = this.getImageUrl(attachment?.url);
                if (!imageUrl)
                {
                    return null;
                }

                return {
                    url : imageUrl,
                    name: attachment?.fileName || `Property image ${index + 1}`,
                    size: 0,
                };
            })
            .filter((image): image is { url: string; name: string; size: number } => !!image?.url);

        this.viewerImages = viewerImages;

        if (this.viewerImages.length === 0)
        {
            this.isImageViewerOpen = false;
        }

        if (this._galleryCache.length === 0)
        {
            this.activeImageIndex = 0;
            this.viewerIndex = 0;
            return;
        }

        this.activeImageIndex = Math.min(this.activeImageIndex, this._galleryCache.length - 1);
        this.viewerIndex = Math.min(this.viewerIndex, Math.max(this.viewerImages.length - 1, 0));
    }

    trackByReservation(index: number, reservation: Reservation): string
    {
        return reservation.id || `${index}`;
    }

    trackByLease(index: number, lease: Leasing): string
    {
        return lease.id || `${index}`;
    }

    trackByDate(index: number, day: { date: Date; isCurrentMonth: boolean; isToday: boolean; reservations: Reservation[] }): string
    {
        return day.date.toISOString();
    }

    getDayTooltip(day: { date: Date; isCurrentMonth: boolean; isToday: boolean; reservations: Reservation[] }): string
    {
        if (day.reservations.length === 0)
        {
            return 'Available';
        }

        const reservationList = day.reservations.map(r => 
            `${r.contactName || 'Guest'}: ${this.formatDate(r.startDate)} - ${this.formatDate(r.endDate)}`
        ).join('\n');

        return reservationList;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Print functionality
    // -----------------------------------------------------------------------------------------------------

    printCalendarAndReservations(): void
    {
        this._printService.printCalendarAndReservations({
            property: this.property,
            monthYearLabel: this.getMonthYearLabel(),
            reservations: this.reservations,
            formatDate: (date: string | null | undefined) => this.formatDate(date),
            formatAmount: (amount: number | null | undefined) => this.formatAmount(amount),
            getReservationStatusLabel: (status: any) => this.getReservationStatusLabel(status),
            getReservationDuration: (reservation: Reservation) => this.getReservationDuration(reservation)
        });
    }
}

