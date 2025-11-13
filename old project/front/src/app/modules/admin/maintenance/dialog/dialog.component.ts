import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MaintenanceService } from '../maintenance.service';
import { Maintenance, CreateMaintenanceDto, UpdateMaintenanceDto, MaintenancePriority, MaintenanceStatus } from '../maintenance.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { ContactsService } from '../../contacts/contacts.service';
import { Contact, ContactTypeEnum } from '../../contacts/contacts.types';
import { PropertyService } from '../../property/property.service';
import { Property } from '../../property/property.types';

@Component({
    selector: 'maintenance-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule
    ]
})
export class MaintenanceDialogComponent implements OnInit {
    maintenanceForm: FormGroup;
    mode: 'create' | 'edit';
    maintenance: Maintenance;
    maintenanceId: string;
    isLoading: boolean = false;
    isLoadingDetails: boolean = false;
    serviceContacts: Contact[] = [];
    filteredServiceContacts: Contact[] = [];
    loadingContacts: boolean = false;
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    loadingProperties: boolean = false;
    propertySearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    isEditingProperty: boolean = false;
    formFieldHelpers: string[] = [''];
    
    // Element reference for click outside detection
    @ViewChild('propertyDropdownContainer', { read: ElementRef }) propertyDropdownContainer?: ElementRef;
    
    // Enums for templates
    MaintenancePriority = MaintenancePriority;
    MaintenanceStatus = MaintenanceStatus;
    
    priorities = [
        { value: MaintenancePriority.Low, label: 'Low', color: 'blue' },
        { value: MaintenancePriority.Medium, label: 'Medium', color: 'yellow' },
        { value: MaintenancePriority.Urgent, label: 'Urgent', color: 'red' }
    ];
    
    statuses = [
        { value: MaintenanceStatus.Waiting, label: 'Waiting', color: 'amber' },
        { value: MaintenanceStatus.InProgress, label: 'In Progress', color: 'blue' },
        { value: MaintenanceStatus.Done, label: 'Done', color: 'green' },
        { value: MaintenanceStatus.Cancelled, label: 'Cancelled', color: 'gray' }
    ];

    constructor(
        public dialogRef: MatDialogRef<MaintenanceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; maintenance?: Maintenance; maintenanceId?: string },
        private _formBuilder: FormBuilder,
        private _maintenanceService: MaintenanceService,
        private _contactsService: ContactsService,
        private _propertyService: PropertyService,
        private _errorHandlerService: ErrorHandlerService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef
    ) {
        this.mode = data.mode;
        this.maintenanceId = data.maintenanceId || data.maintenance?.id;
    }
    
    /**
     * Handle clicks outside dropdown to close it
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        // Check if click is outside property dropdown
        if (this.showPropertyDropdown && this.propertyDropdownContainer) {
            const clickedInside = this.propertyDropdownContainer.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.showPropertyDropdown = false;
                this.isEditingProperty = false;
                this._changeDetectorRef.detectChanges();
            }
        }
    }

    ngOnInit(): void {
        // Initialize form with empty values
        this.maintenanceForm = this._formBuilder.group({
            propertyId: ['', [Validators.required]],
            propertySearch: [''], // For the search input
            contactId: ['', [Validators.required]],
            priority: [MaintenancePriority.Medium, [Validators.required]],
            status: [MaintenanceStatus.Waiting, [Validators.required]],
            subject: ['', [Validators.required, Validators.maxLength(200)]],
            description: ['', [Validators.maxLength(2000)]],
            scheduledDateTime: [new Date(), [Validators.required]]
        });

        // Load properties and service contacts
        this.loadProperties();
        this.loadServiceContacts();

        // If edit mode, fetch the maintenance details
        if (this.mode === 'edit' && this.maintenanceId) {
            this.loadMaintenanceDetails();
        }
    }

    /**
     * Load maintenance details for editing
     */
    loadMaintenanceDetails(): void {
        this.isLoadingDetails = true;
        this._changeDetectorRef.detectChanges();

        this._maintenanceService.getMaintenanceById(this.maintenanceId).subscribe({
            next: (maintenance) => {
                this.maintenance = maintenance;
                
                // Convert priority and status to numbers
                const priority = this.convertPriorityToNumber(maintenance.priority);
                const status = this.convertStatusToNumber(maintenance.status);

                // Patch the form with the fetched data
                this.maintenanceForm.patchValue({
                    propertyId: maintenance.propertyId,
                    propertySearch: maintenance.propertyName || '',
                    contactId: maintenance.contactId,
                    priority: priority,
                    status: status,
                    subject: maintenance.subject,
                    description: maintenance.description || '',
                    scheduledDateTime: maintenance.scheduledDateTime ? new Date(maintenance.scheduledDateTime) : new Date()
                });

                this.isLoadingDetails = false;
                this._changeDetectorRef.detectChanges();
            },
            error: (error) => {
                console.error('Error loading maintenance details:', error);
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load maintenance details');
                this.isLoadingDetails = false;
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * Convert priority string/number to enum number
     */
    convertPriorityToNumber(priority: any): number {
        // If already a number, return it
        if (typeof priority === 'number') {
            return priority;
        }
        
        // If string, map to enum value
        const priorityStr = String(priority).toLowerCase();
        switch (priorityStr) {
            case 'low':
                return MaintenancePriority.Low;
            case 'medium':
                return MaintenancePriority.Medium;
            case 'urgent':
                return MaintenancePriority.Urgent;
            default:
                // Try to parse as number
                const num = Number(priority);
                return isNaN(num) ? MaintenancePriority.Medium : num;
        }
    }

    /**
     * Convert status string/number to enum number
     */
    convertStatusToNumber(status: any): number {
        // If already a number, return it
        if (typeof status === 'number') {
            return status;
        }
        
        // If string, map to enum value
        const statusStr = String(status).toLowerCase();
        switch (statusStr) {
            case 'waiting':
                return MaintenanceStatus.Waiting;
            case 'inprogress':
                return MaintenanceStatus.InProgress;
            case 'done':
                return MaintenanceStatus.Done;
            case 'cancelled':
                return MaintenanceStatus.Cancelled;
            default:
                // Try to parse as number
                const num = Number(status);
                return isNaN(num) ? MaintenanceStatus.Waiting : num;
        }
    }

    /**
     * Compare function for mat-select to properly match values
     */
    compareValues(v1: any, v2: any): boolean {
        return Number(v1) === Number(v2);
    }

    /**
     * Load properties
     */
    loadProperties(): void {
        this.loadingProperties = true;
        this._changeDetectorRef.detectChanges();
        
        this._propertyService.getProperties({
            currentPage: 1,
            pageSize: 1000,
            searchQuery: '',
            ignore: true
        }).subscribe({
            next: (result) => {
                this.properties = result.result || [];
                this.filteredProperties = [...this.properties];
                this.loadingProperties = false;
                this._changeDetectorRef.detectChanges();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load properties');
                console.error('Error loading properties:', error);
                this.loadingProperties = false;
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * Filter properties based on search term
     */
    filterProperties(): void {
        const searchTerm = this.propertySearchTerm.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredProperties = [...this.properties];
        } else {
            this.filteredProperties = this.properties.filter(property => 
                property.name?.toLowerCase().includes(searchTerm) ||
                property.identifier?.toLowerCase().includes(searchTerm) ||
                property.address?.toLowerCase().includes(searchTerm)
            );
        }
        this._changeDetectorRef.detectChanges();
    }

    /**
     * Handle property input events
     */
    onPropertyInput(event: any): void {
        const value = event.target.value;
        this.propertySearchTerm = value;
        this.isEditingProperty = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            this.maintenanceForm.patchValue({ propertyId: '' });
        }
        
        this.filterProperties();
        this.showPropertyDropdown = true;
    }

    /**
     * Handle property focus
     */
    onPropertyFocus(): void {
        this.propertySearchTerm = '';
        this.isEditingProperty = true;
        this.showPropertyDropdown = true;
        this.filterProperties();
    }

    /**
     * Handle property blur (keep for compatibility but don't close dropdown immediately)
     */
    onPropertyBlur(): void {
        // Don't close dropdown on blur - let click-outside handler manage it
        // This prevents premature closing when clicking on dropdown items
    }

    /**
     * Select property
     */
    selectProperty(property: Property): void {
        this.maintenanceForm.patchValue({ 
            propertyId: property.id,
            propertySearch: this.getPropertyDisplayName(property)
        });
        this.propertySearchTerm = '';
        this.isEditingProperty = false;
        this.showPropertyDropdown = false;
        this._changeDetectorRef.detectChanges();
    }

    /**
     * Get selected property name for display
     */
    getSelectedPropertyDisplayName(): string {
        const propertyId = this.maintenanceForm.get('propertyId')?.value;
        if (!propertyId) {
            return '';
        }
        const property = this.properties.find(p => p.id === propertyId);
        return property ? this.getPropertyDisplayName(property) : '';
    }

    /**
     * Load service type contacts
     */
    loadServiceContacts(): void {
        this.loadingContacts = true;
        this._changeDetectorRef.detectChanges();
        
        this._contactsService.getContacts({
            currentPage: 1,
            pageSize: 1000,
            searchQuery: '',
            ignore: true,
            type: ContactTypeEnum.Service
        }).subscribe({
            next: (result) => {
                this.serviceContacts = result.result || [];
                this.filteredServiceContacts = [...this.serviceContacts];
                this.loadingContacts = false;
                this._changeDetectorRef.detectChanges();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load service contacts');
                console.error('Error loading service contacts:', error);
                this.loadingContacts = false;
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * Get property display name
     */
    getPropertyDisplayName(property: Property): string {
        if (property.name) {
            return `${property.name}${property.identifier ? ' (' + property.identifier + ')' : ''}`;
        }
        return property.identifier || property.address || 'Unnamed Property';
    }

    /**
     * Get contact display name
     */
    getContactDisplayName(contact: Contact): string {
        return contact.isACompany 
            ? contact.companyName 
            : `${contact.firstName} ${contact.lastName}`;
    }

    /**
     * Save maintenance
     */
    save(): void {
        if (this.maintenanceForm.invalid) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please fill in all required fields');
            return;
        }

        this.isLoading = true;

        const formValue = this.maintenanceForm.value;
        
        // Convert date to ISO string
        const scheduledDateTime = formValue.scheduledDateTime instanceof Date 
            ? formValue.scheduledDateTime.toISOString()
            : formValue.scheduledDateTime;

        if (this.mode === 'create') {
            const dto: CreateMaintenanceDto = {
                propertyId: formValue.propertyId,
                companyId: null, // Will be set by backend from session
                contactId: formValue.contactId,
                priority: Number(formValue.priority),
                status: Number(formValue.status),
                subject: formValue.subject,
                description: formValue.description,
                scheduledDateTime: scheduledDateTime
            };

            this._maintenanceService.createMaintenance(dto).subscribe({
                next: (result) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Maintenance request created successfully');
                    this.dialogRef.close(result);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error creating maintenance:', error);
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to create maintenance request');
                    this.isLoading = false;
                    this._changeDetectorRef.detectChanges();
                }
            });
        } else {
            const dto: UpdateMaintenanceDto = {
                id: this.maintenance.id,
                propertyId: formValue.propertyId,
                companyId: this.maintenance.companyId,
                contactId: formValue.contactId,
                priority: Number(formValue.priority),
                status: Number(formValue.status),
                subject: formValue.subject,
                description: formValue.description,
                scheduledDateTime: scheduledDateTime
            };

            this._maintenanceService.updateMaintenance(this.maintenance.id, dto).subscribe({
                next: (result) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Maintenance request updated successfully');
                    this.dialogRef.close(result);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error updating maintenance:', error);
                    console.error('Error details:', error.error);
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to update maintenance request');
                    this.isLoading = false;
                    this._changeDetectorRef.detectChanges();
                }
            });
        }
    }

    /**
     * Cancel and close dialog
     */
    cancel(): void {
        this.dialogRef.close();
    }
}

