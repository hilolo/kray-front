import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, Inject, Optional, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LeasingService } from '../leasing.service';
import { PropertyService } from '../../property/property.service';
import { ContactsService } from '../../contacts/contacts.service';
import { 
    Leasing, 
    CreateLeasingDto, 
    UpdateLeasingDto, 
    PaymentType, 
    PaymentMethod,
    LeasingAttachment,
    calculateTenancyDuration,
    calculateDetailedTenancyDuration,
    formatTenancyDuration,
    TenancyDuration,
    getLeasingStatusLabel
} from '../leasing.types';
import { Property } from '../../property/property.types';
import { Contact } from '../../contacts/contacts.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatNativeDateModule } from '@angular/material/core';
import { ContactAddDialogComponent } from '../../property/add/contact-add-dialog.component';
import { PropertyWizardComponent } from '../../property/add/property-wizard.component';
import { DocumentViewerComponent } from 'app/core/document-viewer/document-viewer.component';
import { ImageViewerComponent } from 'app/core/image-viewer/image-viewer.component';
import { PdfViewerComponent } from 'app/core/pdf-viewer/pdf-viewer.component';
import { FilenameDisplayComponent } from 'app/@fuse/components/filename-display/filename-display.component';

@Component({
    selector: 'leasing-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatTabsModule,
        MatTooltipModule,
        MatDialogModule,
        DocumentViewerComponent,
        ImageViewerComponent,
        PdfViewerComponent,
        FilenameDisplayComponent
    ]
})
export class LeasingDetailComponent implements OnInit, OnDestroy {
    leasingForm: FormGroup;
    receiptsForm: FormGroup;
    additionalInfoForm: FormGroup;
    
    leasing: Leasing;
    isEditMode: boolean = false;
    isLoading: boolean = false;
    leasingId: string;
    detailedDuration: TenancyDuration | null = null;
    formattedDuration: string = '';
    formFieldHelpers: string[] = [''];

    // Stepper properties
    currentStep: number = 1;
    totalSteps: number = 4;
    steps = [
        { 
            number: 1, 
            title: 'Global Info', 
            description: 'Property and tenant details',
            icon: 'heroicons_outline:information-circle'
        },
        { 
            number: 2, 
            title: 'Receipts', 
            description: 'Configure receipt settings',
            icon: 'heroicons_outline:receipt-percent'
        },
        { 
            number: 3, 
            title: 'Additional Info', 
            description: 'Terms and notes',
            icon: 'heroicons_outline:document-plus'
        },
        { 
            number: 4, 
            title: 'Documents', 
            description: 'Upload attachments',
            icon: 'heroicons_outline:paper-clip'
        }
    ];

    // View mode properties
    isViewMode: boolean = false;
    editMode: boolean = false;
    isDialogMode: boolean = false; // Track if opened in dialog

    // Available options
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    tenants: Contact[] = [];
    filteredTenants: Contact[] = [];
    attachments: LeasingAttachment[] = [];
    attachmentsToAdd: any[] = [];
    attachmentsToDelete: string[] = [];
    
    // Search and dropdown state
    propertySearchTerm: string = '';
    tenantSearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    showTenantDropdown: boolean = false;
    selectedPropertyForDisplay: Property | null = null;
    selectedTenantForDisplay: Contact | null = null;
    
    // Element references for click outside detection
    @ViewChild('propertyDropdownContainer', { read: ElementRef }) propertyDropdownContainer?: ElementRef;
    @ViewChild('tenantDropdownContainer', { read: ElementRef }) tenantDropdownContainer?: ElementRef;

    // Enums for dropdowns
    paymentTypes = Object.keys(PaymentType).filter(k => !isNaN(Number(k))).map(k => ({ value: Number(k), label: PaymentType[k] }));
    paymentMethods = Object.keys(PaymentMethod).filter(k => !isNaN(Number(k))).map(k => ({ value: Number(k), label: PaymentMethod[k] }));
    
    // Payment dates (1-31)
    paymentDates: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

    // Expose Math to template
    Math = Math;

    // Document viewer properties
    isDocumentViewerOpen: boolean = false;
    selectedDocumentUrl: string = '';
    selectedDocumentName: string = '';
    selectedDocumentType: string = '';
    originalDocumentUrl: string = '';
    selectedFileSize: number = 0;

    // PDF viewer properties
    isPdfViewerOpen: boolean = false;
    selectedPdfUrl: string = '';
    selectedPdfName: string = '';
    selectedPdfSize: number = 0;

    // Image viewer properties
    isImageViewerOpen: boolean = false;
    selectedImageUrl: string = '';
    selectedImageName: string = '';
    selectedImageSize: number = 0;
    selectedImages: Array<{url: string, name: string, size: number}> = [];
    selectedImageIndex: number = 0;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _leasingService: LeasingService,
        private _propertyService: PropertyService,
        private _contactsService: ContactsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _errorHandlerService: ErrorHandlerService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _dialog: MatDialog,
        private _elementRef: ElementRef,
        @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
        @Optional() public _dialogRef: MatDialogRef<LeasingDetailComponent>
    ) {}
    
    /**
     * Handle clicks outside dropdowns to close them
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        // Check if click is outside property dropdown
        if (this.showPropertyDropdown && this.propertyDropdownContainer) {
            const clickedInside = this.propertyDropdownContainer.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.showPropertyDropdown = false;
                this._changeDetectorRef.markForCheck();
            }
        }
        
        // Check if click is outside tenant dropdown
        if (this.showTenantDropdown && this.tenantDropdownContainer) {
            const clickedInside = this.tenantDropdownContainer.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.showTenantDropdown = false;
                this._changeDetectorRef.markForCheck();
            }
        }
    }

    ngOnInit(): void {
        // Initialize forms
        this.initializeForms();
        
        // Load properties and tenants
        this.loadProperties();
        this.loadTenants();

        // Check if opened in dialog mode
        if (this.dialogData) {
            this.isDialogMode = true; // Mark as dialog mode
            if (this.dialogData.leasingId) {
                this.leasingId = this.dialogData.leasingId;
                this.isViewMode = this.dialogData.isViewMode !== false; // Default to view mode
                this.isEditMode = this.dialogData.isEditMode === true;
                this.editMode = this.dialogData.isEditMode === true;
                
                // Disable all form controls in dialog mode
                this.disableAllForms();
                
                this.loadLeasing(this.leasingId);
            }
        } else {
            // Check if we're in view/edit mode from route
            this._route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
                if (params['id'] && params['id'] !== 'add') {
                    this.leasingId = params['id'];
                    this.isEditMode = true;
                    this.isViewMode = true; // Set view mode for existing leasing
                    this.loadLeasing(this.leasingId);
                }
            });
        }

        // Listen to date changes to calculate duration
        this.leasingForm.get('tenancyStart').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => this.calculateDuration());
        
        this.leasingForm.get('tenancyEnd').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => this.calculateDuration());
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Initialize forms
     */
    initializeForms(): void {
        // Main leasing form
        this.leasingForm = this._formBuilder.group({
            propertyId: ['', [Validators.required]],
            contactId: ['', [Validators.required]],
            tenancyStart: ['', [Validators.required]],
            tenancyEnd: ['', [Validators.required]],
            tenancyDuration: [{ value: 0, disabled: true }],
            paymentType: [PaymentType.Monthly, [Validators.required]],
            paymentMethod: [PaymentMethod.Cash, [Validators.required]],
            paymentDate: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
            rentPrice: [0, [Validators.required, Validators.min(0)]]
        });

        // Receipts form
        this.receiptsForm = this._formBuilder.group({
            enableReceipts: [false],
            notificationWhatsapp: [false],
            notificationEmail: [false]
        });

        // Additional info form
        this.additionalInfoForm = this._formBuilder.group({
            specialTerms: [''],
            privateNote: ['']
        });
    }

    /**
     * Load properties (only rental properties)
     */
    loadProperties(): void {
        this._propertyService.getProperties({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            searchQuery: '',
            category: 0 // PropertyCategory.Location - Rental properties
        }).subscribe({
            next: (result) => {
                this.properties = result.result;
                
                // Re-apply filter if there's a search term
                if (this.propertySearchTerm && this.propertySearchTerm.trim()) {
                    this.filterProperties();
                } else {
                    this.filteredProperties = result.result;
                }
                
                // If we're in edit mode and property is already selected, populate search term
                if (this.isEditMode && this.leasingForm.get('propertyId')?.value) {
                    this.populateSearchTerms();
                }
                
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading properties:', error);
            }
        });
    }

    /**
     * Load tenants
     */
    loadTenants(): void {
        this._contactsService.getContactsByType('tenant', 1, 1000, true).subscribe({
            next: (contacts) => {
                this.tenants = contacts;
                
                // Re-apply filter if there's a search term
                if (this.tenantSearchTerm && this.tenantSearchTerm.trim()) {
                    this.filterTenants();
                } else {
                    this.filteredTenants = contacts;
                }
                
                // If we're in edit mode and tenant is already selected, populate search term
                if (this.isEditMode && this.leasingForm.get('contactId')?.value) {
                    this.populateSearchTerms();
                }
                
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading tenants:', error);
            }
        });
    }

    /**
     * Filter properties based on search term
     */
    filterProperties(): void {
        const searchTerm = this.propertySearchTerm.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredProperties = this.properties;
        } else {
            this.filteredProperties = this.properties.filter(property => 
                property.name?.toLowerCase().includes(searchTerm) ||
                property.identifier?.toLowerCase().includes(searchTerm) ||
                property.address?.toLowerCase().includes(searchTerm) ||
                property.ownerName?.toLowerCase().includes(searchTerm)
            );
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Filter tenants based on search term
     */
    filterTenants(): void {
        const searchTerm = this.tenantSearchTerm.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredTenants = this.tenants;
        } else {
            this.filteredTenants = this.tenants.filter(tenant => 
                tenant.name?.toLowerCase().includes(searchTerm) ||
                tenant.identifier?.toLowerCase().includes(searchTerm) ||
                tenant.email?.toLowerCase().includes(searchTerm) ||
                (tenant.firstName && tenant.lastName && 
                    `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(searchTerm))
            );
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Select a property
     */
    selectProperty(property: Property): void {
        this.leasingForm.patchValue({ propertyId: property.id });
        this.selectedPropertyForDisplay = property;
        this.propertySearchTerm = property.name || property.identifier || '';
        this.showPropertyDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Select a tenant
     */
    selectTenant(tenant: Contact): void {
        this.leasingForm.patchValue({ contactId: tenant.id });
        this.selectedTenantForDisplay = tenant;
        this.tenantSearchTerm = tenant.name || tenant.identifier || 
                                (tenant.firstName && tenant.lastName ? `${tenant.firstName} ${tenant.lastName}` : '') || '';
        this.showTenantDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Clear selected property
     */
    clearProperty(): void {
        this.leasingForm.patchValue({ propertyId: '' });
        this.selectedPropertyForDisplay = null;
        this.propertySearchTerm = '';
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Clear selected tenant
     */
    clearTenant(): void {
        this.leasingForm.patchValue({ contactId: '' });
        this.selectedTenantForDisplay = null;
        this.tenantSearchTerm = '';
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get selected property
     */
    getSelectedProperty(): Property | null {
        const propertyId = this.leasingForm.get('propertyId')?.value;
        if (!propertyId) return null;
        
        if (this.selectedPropertyForDisplay && this.selectedPropertyForDisplay.id === propertyId) {
            return this.selectedPropertyForDisplay;
        }
        
        const property = this.properties.find(p => p.id === propertyId);
        if (property) {
            this.selectedPropertyForDisplay = property;
        }
        return property || null;
    }

    /**
     * Get selected tenant
     */
    getSelectedTenant(): Contact | null {
        const tenantId = this.leasingForm.get('contactId')?.value;
        if (!tenantId) return null;
        
        if (this.selectedTenantForDisplay && this.selectedTenantForDisplay.id === tenantId) {
            return this.selectedTenantForDisplay;
        }
        
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (tenant) {
            this.selectedTenantForDisplay = tenant;
        }
        return tenant || null;
    }

    /**
     * Open add property dialog
     */
    openAddPropertyDialog(): void {
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
            const dialogRef = this._dialog.open(PropertyWizardComponent, {
                width: '95vw',
                maxWidth: '95vw',
                height: '95vh',
                maxHeight: '95vh',
                data: { mode: 'dialog' },
                disableClose: false
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result && result.id) {
                    // Extract property from response if wrapped in data
                    const property = result.data || result;
                    
                    // Check if property matches the category filter (category 0 = Location - Rental properties)
                    const propertyCategory = property.category;
                    const categoryMatch = propertyCategory === 0 || 
                                        propertyCategory === '0' || 
                                        propertyCategory === 'Location' ||
                                        Number(propertyCategory) === 0;
                    
                    // If property matches category, add it to the list immediately
                    if (categoryMatch) {
                        // Check if property doesn't already exist in the list
                        const existingIndex = this.properties.findIndex(p => p.id === property.id);
                        if (existingIndex === -1) {
                            // Add the new property to the beginning of the list
                            this.properties = [property, ...this.properties];
                        } else {
                            // Update existing property
                            this.properties[existingIndex] = property;
                        }
                        
                        // Update filtered list
                        if (this.propertySearchTerm && this.propertySearchTerm.trim()) {
                            this.filterProperties();
                        } else {
                            this.filteredProperties = [...this.properties];
                        }
                    }
                    
                    // Clear search term to show all properties including the new one
                    this.propertySearchTerm = '';
                    this.filteredProperties = [...this.properties];
                    
                    // Select the property immediately
                    this.leasingForm.patchValue({ propertyId: property.id });
                    this.selectedPropertyForDisplay = property;
                    this.propertySearchTerm = property.name || property.identifier || '';
                    this.showPropertyDropdown = true;
                    this._changeDetectorRef.markForCheck();
                    
                    // Then refresh from server to ensure we have the latest data
                    // Use a longer delay to give backend time to process
                    setTimeout(() => {
                        this.loadProperties();
                    }, 1000);
                }
            });
        }, 0);
    }

    /**
     * Open add tenant dialog
     */
    openAddTenantDialog(): void {
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
            const dialogRef = this._dialog.open(ContactAddDialogComponent, {
                width: '95vw',
                maxWidth: '95vw',
                height: '95vh',
                maxHeight: '95vh',
                data: { type: 'tenant' },
                disableClose: false
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result && result.id) {
                    // Extract tenant from response if wrapped in data
                    const tenant = result.data || result;
                    
                    // Check if tenant doesn't already exist in the list
                    const existingIndex = this.tenants.findIndex(t => t.id === tenant.id);
                    if (existingIndex === -1) {
                        // Add the new tenant to the beginning of the list
                        this.tenants = [tenant, ...this.tenants];
                    } else {
                        // Update existing tenant
                        this.tenants[existingIndex] = tenant;
                    }
                    
                    // Update filtered list
                    if (this.tenantSearchTerm && this.tenantSearchTerm.trim()) {
                        this.filterTenants();
                    } else {
                        this.filteredTenants = [...this.tenants];
                    }
                    
                    // Clear search term to show all tenants including the new one
                    this.tenantSearchTerm = '';
                    this.filteredTenants = [...this.tenants];
                    
                    // Select the tenant immediately
                    this.leasingForm.patchValue({ contactId: tenant.id });
                    this.selectedTenantForDisplay = tenant;
                    this.tenantSearchTerm = tenant.name || tenant.identifier || 
                                            (tenant.firstName && tenant.lastName ? `${tenant.firstName} ${tenant.lastName}` : '') || '';
                    this.showTenantDropdown = true;
                    this._changeDetectorRef.markForCheck();
                    
                    // Then refresh from server to ensure we have the latest data
                    // Use a longer delay to give backend time to process
                    setTimeout(() => {
                        this.loadTenants();
                    }, 1000);
                }
            });
        }, 0);
    }

    /**
     * Load leasing data
     */
    loadLeasing(id: string): void {
        this.isLoading = true;
        
        this._leasingService.getLeasingById(id).subscribe({
            next: (leasing) => {
                this.leasing = leasing;
                this.attachments = leasing.attachments || [];
                
                // Patch main form
                this.leasingForm.patchValue({
                    propertyId: leasing.propertyId,
                    contactId: leasing.contactId,
                    tenancyStart: new Date(leasing.tenancyStart),
                    tenancyEnd: new Date(leasing.tenancyEnd),
                    tenancyDuration: leasing.tenancyDuration || 0,
                    paymentType: leasing.paymentType,
                    paymentMethod: leasing.paymentMethod,
                    paymentDate: leasing.paymentDate,
                    rentPrice: leasing.rentPrice
                });

                // Patch receipts form
                this.receiptsForm.patchValue({
                    enableReceipts: leasing.enableReceipts || false,
                    notificationWhatsapp: leasing.notificationWhatsapp,
                    notificationEmail: leasing.notificationEmail || false
                });

                // Patch additional info form
                this.additionalInfoForm.patchValue({
                    specialTerms: leasing.specialTerms || '',
                    privateNote: leasing.privateNote || ''
                });

                // Calculate detailed duration
                if (leasing.tenancyStart && leasing.tenancyEnd) {
                    this.detailedDuration = calculateDetailedTenancyDuration(leasing.tenancyStart, leasing.tenancyEnd);
                    this.formattedDuration = formatTenancyDuration(this.detailedDuration);
                }

                // Populate search terms with selected property and tenant names
                this.populateSearchTerms();

                // Disable all forms again after patching (in case patching re-enabled them)
                if (this.isDialogMode) {
                    this.disableAllForms();
                }

                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load leasing');
                console.error('Error loading leasing:', error);
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Populate search terms with selected property and tenant names
     */
    populateSearchTerms(): void {
        // Find and set property search term
        const propertyId = this.leasingForm.get('propertyId')?.value;
        if (propertyId) {
            const property = this.properties.find(p => p.id === propertyId);
            if (property) {
                this.propertySearchTerm = property.name || property.identifier || '';
                this.selectedPropertyForDisplay = property;
            }
        }

        // Find and set tenant search term
        const tenantId = this.leasingForm.get('contactId')?.value;
        if (tenantId) {
            const tenant = this.tenants.find(t => t.id === tenantId);
            if (tenant) {
                this.tenantSearchTerm = tenant.name || tenant.identifier || 
                                        (tenant.firstName && tenant.lastName ? `${tenant.firstName} ${tenant.lastName}` : '') || '';
                this.selectedTenantForDisplay = tenant;
            }
        }
    }

    /**
     * Calculate tenancy duration
     */
    calculateDuration(): void {
        const start = this.leasingForm.get('tenancyStart').value;
        const end = this.leasingForm.get('tenancyEnd').value;
        
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            if (endDate > startDate) {
                // Calculate detailed duration
                this.detailedDuration = calculateDetailedTenancyDuration(startDate.toISOString(), endDate.toISOString());
                this.formattedDuration = formatTenancyDuration(this.detailedDuration);
                
                // Also set the old format for backward compatibility
                const duration = calculateTenancyDuration(startDate.toISOString(), endDate.toISOString());
                this.leasingForm.patchValue({ tenancyDuration: duration }, { emitEvent: false });
                
                this._changeDetectorRef.markForCheck();
            }
        }
    }

    /**
     * Save leasing
     */
    saveLeasing(): void {
        if (this.leasingForm.invalid) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please fill in all required fields in Global Info tab');
            return;
        }

        this.isLoading = true;
        const leasingValue = this.leasingForm.value;
        const receiptsValue = this.receiptsForm.value;
        const additionalValue = this.additionalInfoForm.value;

        // Ensure dates are set to midnight
        const tenancyStart = new Date(leasingValue.tenancyStart);
        tenancyStart.setHours(0, 0, 0, 0);
        
        const tenancyEnd = new Date(leasingValue.tenancyEnd);
        tenancyEnd.setHours(0, 0, 0, 0);

        // Check for overlapping leases before saving
        const excludeLeaseId = this.isEditMode ? this.leasingId : undefined;
        this._leasingService.checkOverlappingLeases(
            leasingValue.propertyId,
            tenancyStart.toISOString(),
            tenancyEnd.toISOString(),
            excludeLeaseId
        ).subscribe({
            next: (overlappingLeases) => {
                if (overlappingLeases && overlappingLeases.length > 0) {
                    // Build error message with list of overlapping leases
                    let errorMessage = `There are ${overlappingLeases.length} existing lease(s) that overlap with the selected dates:\n\n`;
                    
                    overlappingLeases.forEach((lease, index) => {
                        const leaseStartDate = new Date(lease.tenancyStart);
                        const leaseEndDate = new Date(lease.tenancyEnd);
                        const startDateStr = leaseStartDate.toLocaleDateString();
                        const endDateStr = leaseEndDate.toLocaleDateString();
                        const tenantName = lease.tenantName || 'Unknown';
                        const status = getLeasingStatusLabel(lease.status) || 'Unknown';
                        
                        errorMessage += `${index + 1}. ${tenantName} - ${startDateStr} to ${endDateStr} (Status: ${status})\n`;
                    });
                    
                    errorMessage += '\n\nPlease select different dates or contact the existing lease holders.';
                    
                    // Show persistent error alert
                    this._errorHandlerService.showPersistentErrorAlert('Overlapping Leases', errorMessage);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    return;
                }

                // No overlaps, proceed with save
                this.proceedWithSave(leasingValue, receiptsValue, additionalValue, tenancyStart, tenancyEnd);
            },
            error: (error) => {
                // If check fails, still proceed with save (don't block user)
                console.error('Error checking overlapping leases:', error);
                this.proceedWithSave(leasingValue, receiptsValue, additionalValue, tenancyStart, tenancyEnd);
            }
        });
    }

    /**
     * Proceed with saving the lease after overlap check
     */
    private proceedWithSave(leasingValue: any, receiptsValue: any, additionalValue: any, tenancyStart: Date, tenancyEnd: Date): void {
        const leasingData = {
            propertyId: leasingValue.propertyId,
            contactId: leasingValue.contactId,
            tenancyStart: tenancyStart.toISOString(),
            tenancyEnd: tenancyEnd.toISOString(),
            paymentType: leasingValue.paymentType,
            paymentMethod: leasingValue.paymentMethod,
            paymentDate: leasingValue.paymentDate,
            rentPrice: leasingValue.rentPrice,
            enableReceipts: receiptsValue.enableReceipts || false,
            notificationWhatsapp: receiptsValue.notificationWhatsapp || false,
            notificationEmail: receiptsValue.notificationEmail || false,
            specialTerms: additionalValue.specialTerms,
            privateNote: additionalValue.privateNote
        };

        if (this.isEditMode) {
            const updateDto: UpdateLeasingDto = {
                id: this.leasingId,
                ...leasingData,
                attachmentsToAdd: this.attachmentsToAdd.length > 0 ? this.attachmentsToAdd : undefined,
                attachmentsToDelete: this.attachmentsToDelete.length > 0 ? this.attachmentsToDelete : undefined
            };

            this._leasingService.updateLeasing(this.leasingId, updateDto).subscribe({
                next: (response) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Leasing updated successfully');
                    this.isLoading = false;
                    // Clear the tracking arrays
                    this.attachmentsToAdd = [];
                    this.attachmentsToDelete = [];
                    // Exit edit mode and return to view mode
                    this.editMode = false;
                    this.loadLeasing(this.leasingId);
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to update leasing');
                    console.error('Error updating leasing:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
        } else {
            // Prepare attachments for creation from attachmentsToAdd array
            const createDto: CreateLeasingDto = {
                ...leasingData as CreateLeasingDto,
                attachments: this.attachmentsToAdd.length > 0 ? this.attachmentsToAdd : undefined
            };

            this._leasingService.createLeasing(createDto).subscribe({
                next: (response) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Leasing created successfully');
                    this.isLoading = false;
                    // Clear the attachments queue
                    this.attachmentsToAdd = [];
                    
                    const newLeasingId = response.id;
                    if (newLeasingId) {
                        this._router.navigate(['/leasing', newLeasingId]);
                    } else {
                        this._router.navigate(['/leasing']);
                    }
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to create leasing');
                    console.error('Error creating leasing:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
        }
    }

    /**
     * Cancel and go back
     */
    cancel(): void {
        this._router.navigate(['/leasing']);
    }

    /**
     * Upload file(s) - supports multiple files
     */
    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const files = Array.from(input.files);
            const maxSize = 100; // MB - increased to match contact module
            const validFiles: File[] = [];
            const invalidFiles: string[] = [];

            // Validate all files first
            for (const file of files) {
                const fileSizeInMB = file.size / (1024 * 1024);
                if (fileSizeInMB > maxSize) {
                    invalidFiles.push(`${file.name} (${fileSizeInMB.toFixed(2)} MB)`);
                } else {
                    validFiles.push(file);
                }
            }

            // Show error for invalid files
            if (invalidFiles.length > 0) {
                this._errorHandlerService.showErrorAlert(
                    'Files Too Large', 
                    `The following files exceed the ${maxSize} MB limit:\n${invalidFiles.join('\n')}`
                );
            }

            // Process valid files
            if (validFiles.length > 0) {
                try {
                    for (const file of validFiles) {
                        const base64 = await this.fileToBase64(file);
                        
                        // Add to attachmentsToAdd tracking array
                        this.attachmentsToAdd.push({
                            fileName: file.name,
                            base64Content: base64
                        });
                    }
                    
                    const message = `${validFiles.length} ${validFiles.length === 1 ? 'file' : 'files'} added to upload queue`;
                    
                    this._errorHandlerService.showSuccessAlert('Success', message);
                    this._changeDetectorRef.markForCheck();
                } catch (error) {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to process documents');
                    console.error('Error processing documents:', error);
                }
            }
            
            // Reset input
            input.value = '';
        }
    }

    /**
     * Generate temporary ID for new attachments
     */
    private generateTempId(): string {
        return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get file extension
     */
    private getFileExtension(filename: string): string {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    /**
     * Convert file to base64
     */
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Mark document for deletion
     */
    markDocumentForDeletion(documentId: string): void {
        if (!this.attachmentsToDelete.includes(documentId)) {
            this.attachmentsToDelete.push(documentId);
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Cancel document deletion
     */
    cancelDocumentDeletion(documentId: string): void {
        const index = this.attachmentsToDelete.indexOf(documentId);
        if (index > -1) {
            this.attachmentsToDelete.splice(index, 1);
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if document is marked for deletion
     */
    isDocumentMarkedForDeletion(documentId: string): boolean {
        return this.attachmentsToDelete.includes(documentId);
    }

    /**
     * Remove document from upload queue
     */
    removeDocumentFromQueue(index: number): void {
        if (index >= 0 && index < this.attachmentsToAdd.length) {
            this.attachmentsToAdd.splice(index, 1);
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * View/Open attachment
     */
    viewAttachment(attachment: LeasingAttachment): void {
        if (!attachment.url) {
            return;
        }

        const extension = attachment.fileExtension?.toLowerCase() || '';
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const pdfExtension = '.pdf';
        const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

        if (imageExtensions.includes(extension)) {
            // Open image in image viewer
            this.openImageViewer(attachment.url, attachment.originalFileName || attachment.fileName, attachment.fileSize || 0);
        } else if (extension === pdfExtension) {
            // Open PDF in dedicated PDF viewer
            this.openPdfViewer(attachment.url, attachment.originalFileName || attachment.fileName, attachment.fileSize || 0);
        } else if (officeExtensions.includes(extension)) {
            // Open Office attachments in document viewer
            this.openDocumentViewer(attachment.url, attachment.originalFileName || attachment.fileName, extension, attachment.fileSize || 0);
        } else {
            // For other file types, open in new tab
            window.open(attachment.url, '_blank');
        }
    }

    /**
     * Download attachment
     */
    downloadAttachment(attachment: LeasingAttachment, event: Event): void {
        event.stopPropagation();
        if (attachment.url) {
            window.open(attachment.url, '_blank');
        }
    }

    /**
     * Open document viewer
     */
    openDocumentViewer(url: string, name: string, type: string, size: number): void {
        this.selectedDocumentUrl = url;
        this.originalDocumentUrl = url;
        this.selectedDocumentName = name;
        this.selectedDocumentType = type;
        this.selectedFileSize = size;
        this.isDocumentViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close document viewer
     */
    closeDocumentViewer(): void {
        this.isDocumentViewerOpen = false;
        this.selectedDocumentUrl = '';
        this.originalDocumentUrl = '';
        this.selectedDocumentName = '';
        this.selectedDocumentType = '';
        this.selectedFileSize = 0;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open PDF viewer
     */
    openPdfViewer(url: string, name: string, size: number): void {
        this.selectedPdfUrl = url;
        this.selectedPdfName = name;
        this.selectedPdfSize = size;
        this.isPdfViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close PDF viewer
     */
    closePdfViewer(): void {
        this.isPdfViewerOpen = false;
        this.selectedPdfUrl = '';
        this.selectedPdfName = '';
        this.selectedPdfSize = 0;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open image viewer
     */
    openImageViewer(url: string, name: string, size: number): void {
        // Get all images from attachments
        this.selectedImages = this.getAllImagesFromAttachments();
        
        // Find the index of the clicked image
        this.selectedImageIndex = this.selectedImages.findIndex(img => img.url === url);
        if (this.selectedImageIndex === -1) {
            this.selectedImageIndex = 0;
        }
        
        this.selectedImageUrl = url;
        this.selectedImageName = name;
        this.selectedImageSize = size;
        this.isImageViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close image viewer
     */
    closeImageViewer(): void {
        this.isImageViewerOpen = false;
        this.selectedImageUrl = '';
        this.selectedImageName = '';
        this.selectedImageSize = 0;
        this.selectedImages = [];
        this.selectedImageIndex = 0;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get all images from lease attachments
     */
    getAllImagesFromAttachments(): Array<{url: string, name: string, size: number}> {
        if (!this.attachments || this.attachments.length === 0) {
            return [];
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico'];
        
        return this.attachments
            .filter(attachment => {
                const extension = attachment.fileExtension?.toLowerCase() || '';
                return imageExtensions.includes(extension) && attachment.url;
            })
            .map(attachment => ({
                url: attachment.url,
                name: attachment.originalFileName || attachment.fileName,
                size: attachment.fileSize || 0
            }));
    }

    /**
     * Handle image change in viewer
     */
    onImageChanged(index: number): void {
        this.selectedImageIndex = index;
        if (this.selectedImages && this.selectedImages[index]) {
            this.selectedImageUrl = this.selectedImages[index].url;
            this.selectedImageName = this.selectedImages[index].name;
            this.selectedImageSize = this.selectedImages[index].size;
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get file icon based on extension
     */
    getFileIcon(extension: string): string {
        const ext = extension.toLowerCase().replace('.', '');
        switch (ext) {
            case 'pdf':
                return 'heroicons_outline:document-text';
            case 'doc':
            case 'docx':
                return 'heroicons_outline:document';
            case 'xls':
            case 'xlsx':
                return 'heroicons_outline:table-cells';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'heroicons_outline:photo';
            default:
                return 'heroicons_outline:document';
        }
    }

    /**
     * Format file size
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // =============================================
    // Stepper Navigation Methods
    // =============================================

    /**
     * Get step title
     */
    getStepTitle(): string {
        return this.steps[this.currentStep - 1]?.title || '';
    }

    /**
     * Get step description
     */
    getStepDescription(): string {
        return this.steps[this.currentStep - 1]?.description || '';
    }

    /**
     * Get progress percentage
     */
    getProgressPercentage(): number {
        return (this.currentStep / this.totalSteps) * 100;
    }

    /**
     * Navigate to next step
     */
    nextStep(): void {
        if (this.isViewMode && !this.editMode) {
            // In read-only view mode, just navigate to next step without validation
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
            }
        } else {
            // In create or edit mode, validate and submit if on last step
            if (this.isCurrentStepValid()) {
                if (this.currentStep < this.totalSteps) {
                    this.currentStep++;
                } else {
                    this.saveLeasing();
                }
            }
        }
    }

    /**
     * Navigate to previous step
     */
    previousStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    /**
     * Check if current step is valid
     */
    isCurrentStepValid(): boolean {
        switch (this.currentStep) {
            case 1: // Global Info
                return this.leasingForm.valid;
            case 2: // Receipts
                return true; // Optional fields
            case 3: // Additional Info
                return true; // Optional fields
            case 4: // Documents
                return true; // Optional fields
            default:
                return false;
        }
    }

    // =============================================
    // Edit Mode and Readonly Methods
    // =============================================

    /**
     * Toggle edit mode
     */
    toggleEditMode(enable: boolean): void {
        this.editMode = enable;
        
        // If enabling edit mode, go to first step
        if (enable) {
            this.currentStep = 1;
        }
        
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if fields should be read-only
     */
    isReadOnly(): boolean {
        // In dialog mode, always read-only (view-only)
        if (this.isDialogMode) {
            return true;
        }
        return this.isViewMode && !this.editMode;
    }

    /**
     * Disable all form controls when in dialog mode (view-only)
     */
    disableAllForms(): void {
        if (this.isDialogMode) {
            this.leasingForm.disable();
            this.receiptsForm.disable();
            this.additionalInfoForm.disable();
        }
    }

    /**
     * Check if property and tenant fields should be read-only
     * These fields cannot be edited once the lease is created
     */
    isPropertyTenantReadOnly(): boolean {
        return this.isEditMode; // Always read-only if editing existing lease
    }

    /**
     * Show alert when trying to edit while not in edit mode
     */
    onInputClick(): void {
        if (this.isViewMode && !this.editMode) {
            this._errorHandlerService.showInfoAlert(
                'Edit Mode Required',
                'You cannot modify this field in view mode. Please enable edit mode to make changes.'
            );
        }
    }

    /**
     * Handle click on disabled elements (like checkboxes, radio buttons)
     */
    onDisabledElementClick(event: Event): void {
        if (this.isViewMode && !this.editMode) {
            event.preventDefault();
            event.stopPropagation();
            this._errorHandlerService.showInfoAlert(
                'Edit Mode Required',
                'You cannot modify this field in view mode. Please enable edit mode to make changes.'
            );
        }
    }

    /**
     * Archive leasing
     */
    archiveLeasing(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Archive Leasing',
            message: 'Are you sure you want to make this lease archived?',
            icon: {
                show: true,
                name: 'heroicons_outline:archive-box',
                color: 'warn'
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Archive',
                    color: 'warn'
                },
                cancel: {
                    show: true,
                    label: 'Cancel'
                }
            },
            dismissible: true
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._leasingService.archiveLeasing(this.leasingId).subscribe({
                    next: () => {
                        this._errorHandlerService.showSuccessAlert('Success', 'Leasing archived successfully');
                        this._router.navigate(['/leasing']);
                    },
                    error: (error) => {
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to archive leasing');
                        console.error('Error archiving leasing:', error);
                    }
                });
            }
        });
    }

    /**
     * Activate archived leasing
     */
    activateLeasing(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Activate Leasing',
            message: 'Are you sure you want to reactivate this lease?',
            icon: {
                show: true,
                name: 'heroicons_outline:check-circle',
                color: 'primary'
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Activate',
                    color: 'primary'
                },
                cancel: {
                    show: true,
                    label: 'Cancel'
                }
            },
            dismissible: true
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._leasingService.activateLeasing(this.leasingId).subscribe({
                    next: () => {
                        this._errorHandlerService.showSuccessAlert('Success', 'Leasing activated successfully');
                        // Reload the leasing to show updated status
                        this.loadLeasing(this.leasingId);
                    },
                    error: (error) => {
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to activate leasing');
                        console.error('Error activating leasing:', error);
                    }
                });
            }
        });
    }
}

