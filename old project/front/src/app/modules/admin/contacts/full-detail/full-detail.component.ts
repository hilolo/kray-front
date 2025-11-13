import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { ContactsService } from '../contacts.service';
import { Contact, ContactTypeEnum } from '../contacts.types';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ImageViewerComponent } from 'app/core/image-viewer/image-viewer.component';
import { DocumentViewerComponent } from 'app/core/document-viewer/document-viewer.component';
import { PdfViewerComponent } from 'app/core/pdf-viewer/pdf-viewer.component';
import { FilenameDisplayComponent } from 'app/@fuse/components/filename-display/filename-display.component';
import { LeasingService } from 'app/modules/admin/leasing/leasing.service';
import { Leasing } from 'app/modules/admin/leasing/leasing.types';
import { ReservationService } from 'app/modules/admin/reservation/reservation.service';
import { Reservation } from 'app/modules/admin/reservation/reservation.types';
import { MaintenanceService } from 'app/modules/admin/maintenance/maintenance.service';
import { Maintenance, getMaintenanceStatusLabel, getMaintenanceStatusColor } from 'app/modules/admin/maintenance/maintenance.types';
import { PropertyService } from 'app/modules/admin/property/property.service';
import { Property } from 'app/modules/admin/property/property.types';
import { BanksService } from 'app/modules/admin/banks/banks.service';
import { Bank } from 'app/modules/admin/banks/banks.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'contacts-full-detail',
    templateUrl: './full-detail.component.html',
    styleUrls: ['./full-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        ImageViewerComponent,
        DocumentViewerComponent,
        PdfViewerComponent,
        FilenameDisplayComponent,
        TranslocoModule,
        DatePipe
    ]
})
export class ContactsFullDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    contact: Contact | null = null;
    isLoadingContact: boolean = true;
    
    // Attachments
    attachments: any[] = [];
    galleryImages: Array<{url: string, name: string, size: number}> = [];
    activeImageIndex: number = 0;
    mainImageUrl: string | null = null;
    hasGallery: boolean = false;
    
    // Leases
    leases: Leasing[] = [];
    isLoadingLeases: boolean = false;
    hasLeasingError: boolean = false;
    
    // Reservations
    reservations: Reservation[] = [];
    isLoadingReservations: boolean = false;
    hasReservationError: boolean = false;
    
    // Maintenance
    maintenances: Maintenance[] = [];
    isLoadingMaintenances: boolean = false;
    hasMaintenanceError: boolean = false;
    
    // Properties
    properties: Property[] = [];
    isLoadingProperties: boolean = false;
    hasPropertyError: boolean = false;
    
    // Banks
    banks: Bank[] = [];
    isLoadingBanks: boolean = false;
    hasBankError: boolean = false;
    
    // Document viewers
    isDocumentViewerOpen: boolean = false;
    isPdfViewerOpen: boolean = false;
    isImageViewerOpen: boolean = false;
    selectedDocumentUrl: string = '';
    selectedDocumentName: string = '';
    selectedDocumentType: string = 'pdf';
    selectedPdfUrl: string = '';
    selectedPdfName: string = '';
    selectedPdfSize: number = 0;
    selectedImageUrl: string = '';
    selectedImageName: string = '';
    selectedImageSize: number = 0;
    selectedImages: Array<{url: string, name: string, size: number}> = [];
    selectedImageIndex: number = 0;
    
    // Contact type
    isTenant: boolean = false;
    isOwner: boolean = false;
    isService: boolean = false;
    hasReservations: boolean = false;
    hasLeases: boolean = false;
    hasMaintenances: boolean = false;
    hasProperties: boolean = false;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Expose helper functions to template
    getMaintenanceStatusLabel = getMaintenanceStatusLabel;
    getMaintenanceStatusColor = getMaintenanceStatusColor;

    @ViewChild(MatTabGroup) tabGroup?: MatTabGroup;
    @ViewChildren('tabContent') tabContents?: QueryList<ElementRef>;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _contactsService: ContactsService,
        private _leasingService: LeasingService,
        private _reservationService: ReservationService,
        private _maintenanceService: MaintenanceService,
        private _propertyService: PropertyService,
        private _banksService: BanksService,
        private _errorHandlerService: ErrorHandlerService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Get ID from route params
        this._activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((params) => {
                const id = params['id'];
                if (id) {
                    this._fetchContact(id);
                }
            });
    }

    ngAfterViewInit(): void {
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private _fetchContact(id: string): void {
        this.isLoadingContact = true;
        this._cdr.markForCheck();

        // Pass includeRelated=true for detail mode to get all related entities
        this._contactsService.getContactById(id, true).subscribe({
            next: (contact) => {
                if (!contact) {
                    this._errorHandlerService.showErrorAlert(
                        'Contact Not Found',
                        'The requested contact could not be located.'
                    );
                    this._router.navigate(['/contacts']);
                    return;
                }

                this.contact = contact;
                this.isLoadingContact = false;
                
                // Determine contact type - handle both string and enum values
                let contactTypeEnum: ContactTypeEnum;
                if (typeof contact.type === 'string') {
                    // Case-insensitive comparison
                    const typeLower = contact.type.toLowerCase();
                    contactTypeEnum = typeLower === 'tenant' ? ContactTypeEnum.Tenant :
                                    typeLower === 'owner' ? ContactTypeEnum.Owner :
                                    typeLower === 'service' ? ContactTypeEnum.Service :
                                    typeLower === 'pro' ? ContactTypeEnum.Pro :
                                    ContactTypeEnum.Service;
                } else {
                    contactTypeEnum = contact.type as ContactTypeEnum;
                }
                
                this.isTenant = contactTypeEnum === ContactTypeEnum.Tenant;
                this.isOwner = contactTypeEnum === ContactTypeEnum.Owner || contactTypeEnum === ContactTypeEnum.Pro;
                this.isService = contactTypeEnum === ContactTypeEnum.Service || contactTypeEnum === ContactTypeEnum.Pro;
                
                // Prepare attachments
                this._prepareAttachments();
                
                // Use included data from contact response instead of separate API calls
                const contactDto = contact as any; // Cast to access properties, leases, banks
                
                // Load properties from included data
                // Check both 'properties' and 'Properties' (case-insensitive)
                const propertiesData = contactDto.properties || contactDto.Properties || [];
                
                if (propertiesData && Array.isArray(propertiesData) && propertiesData.length > 0) {
                    this.properties = propertiesData;
                     this.hasProperties = true;
                    this.isLoadingProperties = false;
                } else {
                    this.properties = [];
                    // For owners, always show the Properties tab (even if empty)
                    this.hasProperties = this.isOwner;
                    this.isLoadingProperties = false;
                }
                
                // Load leases from included data
                if (contactDto.leases && contactDto.leases.length > 0) {
                    this.leases = contactDto.leases;
                    this.hasLeases = this.leases.length > 0;
                    this.isLoadingLeases = false;
                } else {
                    this.leases = [];
                    this.hasLeases = false;
                    this.isLoadingLeases = false;
                }
                
                // Load banks from included data (for all contact types)
                if (contactDto.banks && contactDto.banks.length > 0) {
                    this.banks = contactDto.banks;
                    this.isLoadingBanks = false;
                } else {
                    this.banks = [];
                    this.isLoadingBanks = false;
                }
                
                // Load reservations for tenants
                if (this.isTenant) {
                    this._loadReservations(id);
                }
                
                // Load maintenances for service contacts
                if (this.isService) {
                    this._loadMaintenances(id);
                }
                
                this._cdr.markForCheck();
            },
            error: (error) => {
                this.isLoadingContact = false;
                this._errorHandlerService.showErrorAlert(
                    'Error Loading Contact',
                    'Failed to load contact details. Please try again.'
                );
                this._cdr.markForCheck();
            }
        });
    }

    private _prepareAttachments(): void {
        if (!this.contact?.attachments || this.contact.attachments.length === 0) {
            this.attachments = [];
            this.galleryImages = [];
            this.hasGallery = false;
            this.mainImageUrl = null;
            return;
        }

        this.attachments = this.contact.attachments;
        
        // Filter images for gallery
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        this.galleryImages = this.attachments
            .filter(att => {
                const ext = att.fileExtension?.toLowerCase() || '';
                return imageExtensions.some(imgExt => ext.includes(imgExt)) && att.url;
            })
            .map(att => ({
                url: att.url,
                name: att.originalFileName || att.fileName,
                size: att.fileSize || 0
            }));

        this.hasGallery = this.galleryImages.length > 0;
        this.mainImageUrl = this.galleryImages.length > 0 ? this.galleryImages[0].url : null;
        this.activeImageIndex = 0;
    }


    private _loadReservations(contactId: string): void {
        this.isLoadingReservations = true;
        this.hasReservationError = false;
        this._cdr.markForCheck();

        const filter = {
            currentPage: 1,
            pageSize: 100,
            ignore: true,
            contactId: contactId
        };

        this._reservationService.getReservations(filter).subscribe({
            next: (result) => {
                this.reservations = result.result || [];
                this.hasReservations = this.reservations.length > 0;
                this.isLoadingReservations = false;
                this._cdr.markForCheck();
            },
            error: (error) => {
                this.isLoadingReservations = false;
                this.hasReservationError = true;
                this.reservations = [];
                this.hasReservations = false;
                this._cdr.markForCheck();
            }
        });
    }

    private _loadMaintenances(contactId: string): void {
        this.isLoadingMaintenances = true;
        this.hasMaintenanceError = false;
        this._cdr.markForCheck();

        const filter = {
            currentPage: 1,
            pageSize: 100,
            ignore: true,
            contactId: contactId
        };

        this._maintenanceService.getMaintenances(filter).subscribe({
            next: (result) => {
                this.maintenances = result.result || [];
                this.hasMaintenances = this.maintenances.length > 0;
                this.isLoadingMaintenances = false;
                this._cdr.markForCheck();
            },
            error: (error) => {
                this.isLoadingMaintenances = false;
                this.hasMaintenanceError = true;
                this.maintenances = [];
                this.hasMaintenances = false;
                this._cdr.markForCheck();
            }
        });
    }

    get avatarUrl(): string | null {
        if (!this.contact?.avatar) {
            return null;
        }

        if (this.contact.avatar.startsWith('data:')) {
            return this.contact.avatar;
        }

        if (this.contact.avatar.startsWith('http')) {
            return this.contact.avatar;
        }

        return `data:image/png;base64,${this.contact.avatar}`;
    }

    get displayName(): string {
        if (!this.contact) return '';
        
        if (this.contact.isACompany && this.contact.companyName) {
            return this.contact.companyName;
        }
        
        return `${this.contact.firstName || ''} ${this.contact.lastName || ''}`.trim() || this.contact.name || '';
    }

    goBack(): void {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    }

    editContact(): void {
        if (this.contact?.id) {
            this._router.navigate(['edit'], { relativeTo: this._activatedRoute });
        }
    }

    viewLease(lease: Leasing): void {
        this._router.navigate(['/leasing', lease.id]);
    }

    viewReservation(reservation: Reservation): void {
        this._router.navigate(['/reservation', reservation.id]);
    }

    viewMaintenance(maintenance: Maintenance): void {
        this._router.navigate(['/maintenance', maintenance.id]);
    }

    viewProperty(propertyId: string): void {
        this._router.navigate(['/property', propertyId]);
    }

    // Image gallery methods
    selectImage(index: number): void {
        this.activeImageIndex = index;
        this.mainImageUrl = this.galleryImages[index]?.url || null;
        this._cdr.markForCheck();
    }

    previousImage(event: Event): void {
        event.stopPropagation();
        if (this.activeImageIndex > 0) {
            this.activeImageIndex--;
            this.mainImageUrl = this.galleryImages[this.activeImageIndex].url;
            this._cdr.markForCheck();
        }
    }

    nextImage(event: Event): void {
        event.stopPropagation();
        if (this.activeImageIndex < this.galleryImages.length - 1) {
            this.activeImageIndex++;
            this.mainImageUrl = this.galleryImages[this.activeImageIndex].url;
            this._cdr.markForCheck();
        }
    }

    openImageViewer(index: number): void {
        if (this.galleryImages.length === 0) return;
        
        this.selectedImages = this.galleryImages;
        this.selectedImageIndex = index >= 0 ? index : 0;
        const image = this.galleryImages[this.selectedImageIndex];
        this.selectedImageUrl = image.url;
        this.selectedImageName = image.name;
        this.selectedImageSize = image.size;
        this.isImageViewerOpen = true;
        this._cdr.markForCheck();
    }

    closeImageViewer(): void {
        this.isImageViewerOpen = false;
        this._cdr.markForCheck();
    }

    onImageChanged(index: number): void {
        this.selectedImageIndex = index;
        if (this.selectedImages && this.selectedImages[index]) {
            const image = this.selectedImages[index];
            this.selectedImageUrl = image.url;
            this.selectedImageName = image.name;
            this.selectedImageSize = image.size;
        }
        this._cdr.markForCheck();
    }

    // Document viewer methods
    viewAttachment(attachment: any): void {
        if (!attachment.url) return;

        const extension = attachment.fileExtension?.toLowerCase() || '';
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        const pdfExtension = '.pdf';
        const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

        if (imageExtensions.some(ext => extension.includes(ext))) {
            // Find the image in gallery images
            const imageIndex = this.galleryImages.findIndex(img => img.url === attachment.url);
            if (imageIndex >= 0) {
                // Image is in gallery, open with all images
                this.openImageViewer(imageIndex);
            } else {
                // Image not in gallery, create a single image viewer
                this.selectedImages = [{
                    url: attachment.url,
                    name: attachment.originalFileName || attachment.fileName || 'Image',
                    size: attachment.fileSize || 0
                }];
                this.selectedImageIndex = 0;
                this.selectedImageUrl = attachment.url;
                this.selectedImageName = attachment.originalFileName || attachment.fileName || 'Image';
                this.selectedImageSize = attachment.fileSize || 0;
                this.isImageViewerOpen = true;
                this._cdr.markForCheck();
            }
        } else if (extension.includes(pdfExtension)) {
            this.selectedPdfUrl = attachment.url;
            this.selectedPdfName = attachment.originalFileName || attachment.fileName;
            this.selectedPdfSize = attachment.fileSize || 0;
            this.isPdfViewerOpen = true;
            this._cdr.markForCheck();
        } else if (officeExtensions.some(ext => extension.includes(ext))) {
            this.selectedDocumentUrl = attachment.url;
            this.selectedDocumentName = attachment.originalFileName || attachment.fileName;
            this.selectedDocumentType = extension.includes('.doc') ? 'doc' :
                                       extension.includes('.xl') ? 'xl' :
                                       extension.includes('.ppt') ? 'ppt' : 'pdf';
            this.isDocumentViewerOpen = true;
            this._cdr.markForCheck();
        } else {
            // For other file types, try to open as document
            this.selectedDocumentUrl = attachment.url;
            this.selectedDocumentName = attachment.originalFileName || attachment.fileName;
            this.selectedDocumentType = 'pdf'; // Default to PDF viewer
            this.isDocumentViewerOpen = true;
            this._cdr.markForCheck();
        }
    }

    closeDocumentViewer(): void {
        this.isDocumentViewerOpen = false;
        this._cdr.markForCheck();
    }

    closePdfViewer(): void {
        this.isPdfViewerOpen = false;
        this._cdr.markForCheck();
    }

    getFileIcon(extension: string): string {
        if (!extension) return 'heroicons_outline:document';
        
        extension = extension.toLowerCase();
        
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => extension.includes(ext))) {
            return 'heroicons_outline:photo';
        }
        if (extension.includes('.pdf')) {
            return 'heroicons_outline:document-text';
        }
        if (['.doc', '.docx'].some(ext => extension.includes(ext))) {
            return 'heroicons_outline:document-text';
        }
        if (['.xls', '.xlsx'].some(ext => extension.includes(ext))) {
            return 'heroicons_outline:table-cells';
        }
        
        return 'heroicons_outline:document';
    }

    formatFileSize(bytes: number): string {
        if (!bytes || bytes === 0) return '0.00 MB';
        const mb = 1024 * 1024;
        const sizeInMB = bytes / mb;
        return sizeInMB.toFixed(2) + ' MB';
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    getLeasesForProperty(propertyId: string): Leasing[] {
        return this.leases.filter(lease => lease.propertyId === propertyId);
    }

    getActiveLeasesCount(): number {
        return this.leases.filter(lease => lease.status === 0 || lease.status === 'Active' || lease.status === 0).length;
    }

    getTotalMonthlyRent(): number {
        return this.leases
            .filter(lease => lease.status === 0 || lease.status === 'Active' || lease.status === 0)
            .reduce((total, lease) => {
                let monthlyRent = lease.rentPrice;
                // Convert to monthly based on payment type
                if (lease.paymentType === 1) { // Quarterly
                    monthlyRent = lease.rentPrice / 3;
                } else if (lease.paymentType === 2) { // Semi-Annually
                    monthlyRent = lease.rentPrice / 6;
                } else if (lease.paymentType === 3) { // Full
                    monthlyRent = lease.rentPrice / 12; // Assume 12 months
                }
                return total + monthlyRent;
            }, 0);
    }

    getTotalReservationRevenue(): number {
        return this.reservations
            .filter(res => res.status === 1 || res.status === 'Approved' || res.status === 1)
            .reduce((total, res) => total + (res.totalAmount || 0), 0);
    }

    getTotalPropertyValue(): number {
        return this.properties.reduce((total, prop) => total + (prop.price || 0), 0);
    }

}

