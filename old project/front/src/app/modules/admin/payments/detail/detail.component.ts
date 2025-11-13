import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewEncapsulation, inject, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentsService } from '../payments.service';
import { Payment, PaymentType, PaymentStatus, RevenueCategory, ExpenseCategory, CreatePaymentDto, UpdatePaymentDto, getRevenueCategoryLabel, getExpenseCategoryLabel } from '../payments.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { PropertyService } from '../../property/property.service';
import { ContactsService } from '../../contacts/contacts.service';
import { Property } from '../../property/property.types';
import { Contact } from '../../contacts/contacts.types';
import { LeasingService } from '../../leasing/leasing.service';
import { Leasing } from '../../leasing/leasing.types';
import { ContactAddDialogComponent } from '../../property/add/contact-add-dialog.component';

@Component({
    selector: 'payment-detail',
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
        MatOptionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDialogModule
    ]
})
export class PaymentDetailComponent implements OnInit, OnDestroy {
    paymentForm: FormGroup;
    payment: Payment | null = null;
    paymentId: string | null = null;
    isEditMode: boolean = false;
    isLoading: boolean = false;
    currentType: PaymentType = PaymentType.Revenue;

    // Payment types
    PaymentType = PaymentType;
    PaymentStatus = PaymentStatus;
    RevenueCategory = RevenueCategory;
    ExpenseCategory = ExpenseCategory;

    // Category options
    revenueCategories = [
        { value: RevenueCategory.Loyer, label: getRevenueCategoryLabel(RevenueCategory.Loyer) },
        { value: RevenueCategory.Caution, label: getRevenueCategoryLabel(RevenueCategory.Caution) },
        { value: RevenueCategory.FraisAgence, label: getRevenueCategoryLabel(RevenueCategory.FraisAgence) },
        { value: RevenueCategory.VocationFull, label: getRevenueCategoryLabel(RevenueCategory.VocationFull) },
        { value: RevenueCategory.VocationPart, label: getRevenueCategoryLabel(RevenueCategory.VocationPart) },
        { value: RevenueCategory.Maintenance, label: getRevenueCategoryLabel(RevenueCategory.Maintenance) },
        { value: RevenueCategory.Autre, label: getRevenueCategoryLabel(RevenueCategory.Autre) }
    ];

    expenseCategories = [
        { value: ExpenseCategory.Maintenance, label: getExpenseCategoryLabel(ExpenseCategory.Maintenance) },
        { value: ExpenseCategory.Contact, label: getExpenseCategoryLabel(ExpenseCategory.Contact) },
        { value: ExpenseCategory.Charge, label: getExpenseCategoryLabel(ExpenseCategory.Charge) },
        { value: ExpenseCategory.Autre, label: getExpenseCategoryLabel(ExpenseCategory.Autre) }
    ];

    statusOptions = [
        { value: PaymentStatus.Paid, label: 'Paid' },
        { value: PaymentStatus.Overdue, label: 'Overdue' },
        { value: PaymentStatus.Waiting, label: 'Waiting' }
    ];

    // Calculated values
    subtotal: number = 0;
    vatTotal: number = 0;
    total: number = 0;

    // Property and Contact selection
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    contacts: Contact[] = [];
    filteredContacts: Contact[] = [];
    leasings: Leasing[] = [];
    filteredLeasings: Leasing[] = [];
    
    propertySearchTerm: string = '';
    contactSearchTerm: string = '';
    leasingSearchTerm: string = '';
    statusSearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    showContactDropdown: boolean = false;
    showLeasingDropdown: boolean = false;
    showStatusDropdown: boolean = false;
    isEditingProperty: boolean = false;
    isEditingContact: boolean = false;
    isEditingLeasing: boolean = false;
    isEditingStatus: boolean = false;
    filteredStatusOptions: any[] = [];

    @ViewChild('propertyDropdownContainer', { read: ElementRef }) propertyDropdownContainer?: ElementRef;
    @ViewChild('contactDropdownContainer', { read: ElementRef }) contactDropdownContainer?: ElementRef;
    @ViewChild('leasingDropdownContainer', { read: ElementRef }) leasingDropdownContainer?: ElementRef;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Inject services
    private _formBuilder = inject(FormBuilder);
    private _paymentsService = inject(PaymentsService);
    private _propertyService = inject(PropertyService);
    private _contactsService = inject(ContactsService);
    private _leasingService = inject(LeasingService);
    private _dialog = inject(MatDialog);
    private _router = inject(Router);
    private _route = inject(ActivatedRoute);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _errorHandlerService = inject(ErrorHandlerService);

    ngOnInit(): void {
        // Initialize filtered lists
        this.filteredStatusOptions = [...this.statusOptions];
        
        // Get type from route
        this._route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
            const typeParam = params['type'];
            let paymentType: PaymentType;
            
            // Determine type from route
            if (typeParam === 'revenue') {
                paymentType = PaymentType.Revenue;
            } else if (typeParam === 'expense') {
                paymentType = PaymentType.Expense;
            } else {
                // Default to revenue if not specified
                paymentType = PaymentType.Revenue;
            }

            this.currentType = paymentType;

            // Initialize form with type from route
            this.initializeForm(paymentType);

            // Load properties, contacts, and leasings
            this.loadProperties();
            this.loadContacts();
            this.loadLeasings();

            // Check if we're in edit mode
            if (params['id'] && params['id'] !== 'add') {
                this.paymentId = params['id'];
                this.isEditMode = true;
                this.loadPayment(this.paymentId);
            } else {
                // Add mode - add one empty item
                this.addPaymentItem();
            }
        });

        // Subscribe to form changes for calculations
        this.paymentForm.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.calculateTotals();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Initialize form
     */
    initializeForm(type: PaymentType): void {
        const defaultCategory = type === PaymentType.Revenue 
            ? RevenueCategory.Loyer 
            : ExpenseCategory.Maintenance;

        this.paymentForm = this._formBuilder.group({
            type: [type, [Validators.required]],
            category: [defaultCategory, [Validators.required]],
            periodFrom: [''],
            periodTo: [''],
            propertyId: [''],
            leasingId: [''],
            contactId: [''],
            numbering: [''],
            items: this._formBuilder.array([])
        });
    }

    /**
     * Get items form array
     */
    get itemsFormArray(): FormArray {
        return this.paymentForm.get('items') as FormArray;
    }

    /**
     * Add payment item
     */
    addPaymentItem(): void {
        const itemGroup = this._formBuilder.group({
            amount: [0, [Validators.required, Validators.min(0)]],
            vat: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            description: ['']
        });

        this.itemsFormArray.push(itemGroup);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove payment item
     */
    removePaymentItem(index: number): void {
        this.itemsFormArray.removeAt(index);
        this.calculateTotals();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Calculate totals
     */
    calculateTotals(): void {
        const items = this.itemsFormArray.value;
        
        // Calculate subtotal
        this.subtotal = items.reduce((sum: number, item: any) => {
            const amount = parseFloat(item.amount) || 0;
            return sum + amount;
        }, 0);

        // Calculate VAT total
        this.vatTotal = items.reduce((sum: number, item: any) => {
            const amount = parseFloat(item.amount) || 0;
            const vat = parseFloat(item.vat) || 0;
            return sum + (amount * vat / 100);
        }, 0);

        // Calculate total
        this.total = this.subtotal + this.vatTotal;
        
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Load payment
     */
    loadPayment(id: string): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._paymentsService.getPayment(id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (payment: Payment) => {
                    this.payment = payment;
                    this.populateForm(payment);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    /**
     * Populate form with payment data
     */
    populateForm(payment: Payment): void {
        // Clear existing items
        while (this.itemsFormArray.length !== 0) {
            this.itemsFormArray.removeAt(0);
        }

        // Add items
        payment.items.forEach(item => {
            const itemGroup = this._formBuilder.group({
                amount: [item.amount, [Validators.required, Validators.min(0)]],
                vat: [item.vat, [Validators.required, Validators.min(0), Validators.max(100)]],
                description: [item.description || '']
            });
            this.itemsFormArray.push(itemGroup);
        });

        // If no items, add one empty item
        if (payment.items.length === 0) {
            this.addPaymentItem();
        }

        // Set form values
        this.paymentForm.patchValue({
            type: payment.type,
            category: payment.category,
            periodFrom: '',
            periodTo: '',
            contactId: ''
        }, { emitEvent: false });

        // Calculate totals
        this.calculateTotals();
    }

    /**
     * Save payment
     */
    savePayment(): void {
        if (this.paymentForm.invalid) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please fill in all required fields');
            return;
        }

        if (this.itemsFormArray.length === 0) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please add at least one payment item');
            return;
        }

        const formValue = this.paymentForm.value;

        const items = formValue.items.map((item: any) => ({
            amount: parseFloat(item.amount) || 0,
            vat: parseFloat(item.vat) || 0,
            description: item.description || ''
        }));

        if (this.isEditMode && this.paymentId) {
            // Update
            const updateDto: UpdatePaymentDto = {
                id: this.paymentId,
                type: formValue.type,
                category: formValue.category,
                status: PaymentStatus.Waiting,
                items: items,
                description: formValue.description || undefined
            };

            this._paymentsService.updatePayment(updateDto)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: () => {
                        this._router.navigate(['../'], { relativeTo: this._route.parent });
                    },
                    error: () => {
                        // Error already handled in service
                    }
                });
        } else {
            // Create
            const createDto: CreatePaymentDto = {
                type: formValue.type,
                category: formValue.category,
                status: PaymentStatus.Waiting,
                items: items,
                description: formValue.description || undefined
            };

            this._paymentsService.createPayment(createDto)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: () => {
                        this._router.navigate(['../'], { relativeTo: this._route.parent });
                    },
                    error: () => {
                        // Error already handled in service
                    }
                });
        }
    }

    /**
     * Cancel and go back
     */
    cancel(): void {
        this._router.navigate(['../'], { relativeTo: this._route.parent });
    }

    /**
     * Get current categories based on type
     */
    getCurrentCategories(): any[] {
        const type = this.paymentForm.get('type')?.value;
        return type === PaymentType.Revenue ? this.revenueCategories : this.expenseCategories;
    }

    /**
     * Get status color class
     */
    getStatusColorClass(status: PaymentStatus): string {
        switch (status) {
            case PaymentStatus.Paid:
                return 'text-green-600';
            case PaymentStatus.Overdue:
                return 'text-red-600';
            case PaymentStatus.Waiting:
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    }

    /**
     * Load properties
     */
    loadProperties(): void {
        this._propertyService.getProperties({ currentPage: 1, pageSize: 1000, ignore: false })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (result) => {
                    this.properties = result.result;
                    this.filteredProperties = this.properties;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to load properties');
                }
            });
    }

    /**
     * Load contacts
     */
    loadContacts(): void {
        this._contactsService.getContacts({ currentPage: 1, pageSize: 1000, ignore: false })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (result) => {
                    this.contacts = result.result;
                    this.filteredContacts = this.contacts;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to load contacts');
                }
            });
    }

    /**
     * Load leasings
     */
    loadLeasings(): void {
        this._leasingService.getLeasings({ currentPage: 1, pageSize: 1000, ignore: false, isArchived: false })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (result) => {
                    // Filter out archived leasings (double check in case backend doesn't filter)
                    this.leasings = result.result.filter(l => !l.isArchived);
                    this.filteredLeasings = this.leasings;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    // Leasings are optional, don't show error
                }
            });
    }

    /**
     * Filter properties
     */
    filterProperties(): void {
        const term = this.propertySearchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredProperties = this.properties;
        } else {
            this.filteredProperties = this.properties.filter(p => 
                p.name?.toLowerCase().includes(term) ||
                p.identifier?.toLowerCase().includes(term) ||
                p.address?.toLowerCase().includes(term)
            );
        }
    }

    /**
     * Filter contacts
     */
    filterContacts(): void {
        const term = this.contactSearchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredContacts = this.contacts;
        } else {
            this.filteredContacts = this.contacts.filter(c => 
                c.firstName?.toLowerCase().includes(term) ||
                c.lastName?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term) ||
                (c.phones && c.phones.length > 0 && c.phones[0]?.toLowerCase().includes(term))
            );
        }
    }

    /**
     * Filter leasings
     */
    filterLeasings(): void {
        const term = this.leasingSearchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredLeasings = this.leasings;
        } else {
            this.filteredLeasings = this.leasings.filter(l => 
                l.propertyName?.toLowerCase().includes(term) ||
                l.tenantName?.toLowerCase().includes(term)
            );
        }
    }


    /**
     * Open add contact dialog
     */
    openAddContactDialog(): void {
        const dialogRef = this._dialog.open(ContactAddDialogComponent, {
            width: '600px',
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.id) {
                this.loadContacts();
                setTimeout(() => {
                    this.selectContactOption(result.id);
                }, 500);
            }
        });
    }

    /**
     * Handle document clicks to close dropdowns
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (this.showPropertyDropdown && this.propertyDropdownContainer) {
            const clickedInside = this.propertyDropdownContainer.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.showPropertyDropdown = false;
                this.isEditingProperty = false;
                this._changeDetectorRef.markForCheck();
            }
        }
        if (this.showContactDropdown && this.contactDropdownContainer) {
            const clickedInside = this.contactDropdownContainer.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.showContactDropdown = false;
                this.isEditingContact = false;
                this._changeDetectorRef.markForCheck();
            }
        }
        if (this.showLeasingDropdown && this.leasingDropdownContainer) {
            const clickedInside = this.leasingDropdownContainer.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.showLeasingDropdown = false;
                this.isEditingLeasing = false;
                this._changeDetectorRef.markForCheck();
            }
        }
    }

    // Property searchable dropdown methods
    onPropertyInput(event: any): void {
        this.propertySearchTerm = event.target.value;
        this.isEditingProperty = true;
        this.filterProperties();
        this.showPropertyDropdown = true;
    }

    onPropertyFocus(): void {
        this.showPropertyDropdown = true;
        this.filterProperties();
    }

    onPropertyBlur(): void {
        // Delay to allow click on dropdown item
        setTimeout(() => {
            if (!this.isEditingProperty) {
                this.showPropertyDropdown = false;
            }
        }, 200);
    }

    getSelectedPropertyName(): string {
        const propertyId = this.paymentForm.get('propertyId')?.value;
        if (!propertyId) return '';
        const property = this.properties.find(p => p.id === propertyId);
        return property ? (property.name || property.identifier || '') : '';
    }

    selectPropertyOption(propertyId: string): void {
        this.paymentForm.patchValue({ propertyId: propertyId || '' });
        this.propertySearchTerm = '';
        this.isEditingProperty = false;
        this.showPropertyDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    clearPropertySelection(): void {
        this.paymentForm.patchValue({ propertyId: '' });
        this.propertySearchTerm = '';
        this.isEditingProperty = false;
        this._changeDetectorRef.markForCheck();
    }

    // Leasing searchable dropdown methods
    onLeasingInput(event: any): void {
        this.leasingSearchTerm = event.target.value;
        this.isEditingLeasing = true;
        this.filterLeasings();
        this.showLeasingDropdown = true;
    }

    onLeasingFocus(): void {
        this.showLeasingDropdown = true;
        this.filterLeasings();
    }

    onLeasingBlur(): void {
        setTimeout(() => {
            if (!this.isEditingLeasing) {
                this.showLeasingDropdown = false;
            }
        }, 200);
    }

    getSelectedLeasingName(): string {
        const leasingId = this.paymentForm.get('leasingId')?.value;
        if (!leasingId) return '';
        const leasing = this.leasings.find(l => l.id === leasingId);
        return leasing ? `${leasing.propertyName} - ${leasing.tenantName}` : '';
    }

    selectLeasingOption(leasingId: string): void {
        this.paymentForm.patchValue({ leasingId: leasingId || '' });
        this.leasingSearchTerm = '';
        this.isEditingLeasing = false;
        this.showLeasingDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    clearLeasingSelection(): void {
        this.paymentForm.patchValue({ leasingId: '' });
        this.leasingSearchTerm = '';
        this.isEditingLeasing = false;
        this._changeDetectorRef.markForCheck();
    }

    // Contact searchable dropdown methods
    onContactInput(event: any): void {
        this.contactSearchTerm = event.target.value;
        this.isEditingContact = true;
        this.filterContacts();
        this.showContactDropdown = true;
    }

    onContactFocus(): void {
        this.showContactDropdown = true;
        this.filterContacts();
    }

    onContactBlur(): void {
        setTimeout(() => {
            if (!this.isEditingContact) {
                this.showContactDropdown = false;
            }
        }, 200);
    }

    getSelectedContactName(): string {
        const contactId = this.paymentForm.get('contactId')?.value;
        if (!contactId) return '';
        const contact = this.contacts.find(c => c.id === contactId);
        if (!contact) return '';
        const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
        return name || contact.email || '';
    }

    selectContactOption(contactId: string): void {
        this.paymentForm.patchValue({ contactId: contactId || '' });
        this.contactSearchTerm = '';
        this.isEditingContact = false;
        this.showContactDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    clearContactSelection(): void {
        this.paymentForm.patchValue({ contactId: '' });
        this.contactSearchTerm = '';
        this.isEditingContact = false;
        this._changeDetectorRef.markForCheck();
    }

    // Status searchable dropdown methods
    onStatusInput(event: any): void {
        this.statusSearchTerm = event.target.value;
        this.isEditingStatus = true;
        this.filterStatusOptions();
        this.showStatusDropdown = true;
    }

    onStatusFocus(): void {
        this.showStatusDropdown = true;
        this.filterStatusOptions();
    }

    onStatusBlur(): void {
        setTimeout(() => {
            if (!this.isEditingStatus) {
                this.showStatusDropdown = false;
            }
        }, 200);
    }

    getSelectedStatusLabel(): string {
        const status = this.paymentForm.get('status')?.value;
        if (status === null || status === undefined) return '';
        const statusOption = this.statusOptions.find(s => s.value === status);
        return statusOption ? statusOption.label : '';
    }

    filterStatusOptions(): void {
        const term = this.statusSearchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredStatusOptions = [...this.statusOptions];
        } else {
            this.filteredStatusOptions = this.statusOptions.filter(s => 
                s.label.toLowerCase().includes(term)
            );
        }
    }

    selectStatusOption(statusValue: PaymentStatus): void {
        this.paymentForm.patchValue({ status: statusValue });
        this.statusSearchTerm = '';
        this.isEditingStatus = false;
        this.showStatusDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    clearStatusSelection(): void {
        this.paymentForm.patchValue({ status: PaymentStatus.Waiting });
        this.statusSearchTerm = '';
        this.isEditingStatus = false;
        this._changeDetectorRef.markForCheck();
    }
}

