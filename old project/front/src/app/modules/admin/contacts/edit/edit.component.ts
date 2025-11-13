import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewEncapsulation, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { ContactsService } from '../contacts.service';
import { Contact, ContactType, ContactTypeEnum, CreateContactDto, UpdateContactDto, AttachmentInput, mapContactTypeToEnum, mapEnumToContactType } from '../contacts.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

@Component({
    selector: 'contact-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
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
        MatTabsModule,
        MatSlideToggleModule,
        MatTooltipModule
    ],
    providers: [
        DatePipe
    ]
})
export class ContactEditComponent implements OnInit, OnDestroy {
    contactForm: FormGroup;
    contact: Contact | null = null;
    contactId: string | null = null;
    isEditMode: boolean = false;
    isLoading: boolean = false;
    currentType: ContactType = 'tenant';

    // Attachments
    attachmentsToAdd: AttachmentInput[] = [];
    attachmentsToDelete: string[] = [];
    avatarExplicitlyRemoved: boolean = false;

    @ViewChild('avatarFileInput') avatarFileInput?: ElementRef;
    @ViewChild('documentFileInput') documentFileInput?: ElementRef;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Inject services
    private _formBuilder = inject(FormBuilder);
    private _contactsService = inject(ContactsService);
    private _router = inject(Router);
    private _route = inject(ActivatedRoute);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _errorHandlerService = inject(ErrorHandlerService);

    ngOnInit(): void {
        // Get the full route path to determine type and contact ID
        const url = this._router.url;
        
        // Determine contact type from URL
        let typeParam = '';
        if (url.includes('/contacts/tenants')) {
            typeParam = 'tenants';
            this.currentType = 'tenant';
        } else if (url.includes('/contacts/owners')) {
            typeParam = 'owners';
            this.currentType = 'owner';
        } else if (url.includes('/contacts/service-pros') || url.includes('/contacts/services')) {
            typeParam = url.includes('/contacts/service-pros') ? 'service-pros' : 'services';
            this.currentType = 'service';
        } else {
            this.currentType = 'tenant';
        }

        // Initialize form
        this.initializeForm();

        // Check if we're in edit mode - get the contact ID from the route
        // The route structure is /contacts/:type/:type where second :type is the contact ID
        const routeSegments = url.split('/').filter(segment => segment);
        const typeIndex = routeSegments.indexOf('contacts');
        
        if (typeIndex !== -1 && routeSegments.length > typeIndex + 2) {
            // We have /contacts/:type/:contactId
            const contactIdParam = routeSegments[typeIndex + 2];
            if (contactIdParam && contactIdParam !== 'add' && contactIdParam !== typeParam) {
                this.contactId = contactIdParam;
                this.isEditMode = true;
                this.loadContact(this.contactId);
            } else {
                // Add mode
                this.isEditMode = true;
                this.contact = this.createEmptyContact();
                this.addPhoneField();
            }
        } else {
            // Add mode
            this.isEditMode = true;
            this.contact = this.createEmptyContact();
            this.addPhoneField();
        }

        // Mark for check to ensure component renders
        this._changeDetectorRef.markForCheck();

        // Subscribe to contact changes
        this._contactsService.contact$
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter(contact => !!contact && !!contact.id)
            )
            .subscribe((contact: Contact) => {
                this.contact = contact;
                this.populateForm(contact);
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Initialize form
     */
    initializeForm(): void {
        this.contactForm = this._formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            companyName: [''],
            ice: [''],
            rc: [''],
            identifier: ['', [Validators.required]],
            isACompany: [false],
            email: ['', [Validators.email]],
            phones: this._formBuilder.array([]),
            avatar: [null]
        });

        // Watch for changes in isACompany to toggle validation
        this.contactForm.get('isACompany')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((isCompany: boolean) => {
                const firstNameControl = this.contactForm.get('firstName');
                const lastNameControl = this.contactForm.get('lastName');
                const companyNameControl = this.contactForm.get('companyName');

                if (isCompany) {
                    firstNameControl?.clearValidators();
                    lastNameControl?.clearValidators();
                    companyNameControl?.setValidators([Validators.required]);
                } else {
                    firstNameControl?.setValidators([Validators.required]);
                    lastNameControl?.setValidators([Validators.required]);
                    companyNameControl?.clearValidators();
                }

                firstNameControl?.updateValueAndValidity();
                lastNameControl?.updateValueAndValidity();
                companyNameControl?.updateValueAndValidity();
            });
    }

    /**
     * Create empty contact
     */
    createEmptyContact(): Contact {
        return {
            id: '',
            type: this.currentType,
            name: '',
            firstName: '',
            lastName: '',
            companyName: '',
            ice: '',
            rc: '',
            identifier: '',
            email: '',
            emails: [],
            phones: [],
            phoneNumbers: [],
            avatar: null,
            isACompany: false,
            company: '',
            tags: [],
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Get phones form array
     */
    get phonesFormArray(): FormArray {
        return this.contactForm.get('phones') as FormArray;
    }

    /**
     * Load contact
     */
    loadContact(id: string): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._contactsService.getContactById(id, false)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
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
     * Populate form with contact data
     */
    populateForm(contact: Contact): void {
        // Clear phones form array
        while (this.phonesFormArray.length !== 0) {
            this.phonesFormArray.removeAt(0);
        }

        // Setup phones form array
        if (contact.phones && contact.phones.length > 0) {
            contact.phones.forEach((phone) => {
                this.addPhoneField(phone);
            });
        } else {
            this.addPhoneField();
        }

        // Set form values
        this.contactForm.patchValue({
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            companyName: contact.companyName || '',
            ice: contact.ice || '',
            rc: contact.rc || '',
            identifier: contact.identifier || '',
            isACompany: contact.isACompany || false,
            email: contact.email || '',
            avatar: null // Don't set avatar URL in form
        });

        this.avatarExplicitlyRemoved = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Save contact
     */
    saveContact(): void {
        if (this.contactForm.invalid) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please fill in all required fields');
            return;
        }

        const formValue = this.contactForm.getRawValue();
        const phones = formValue.phones.filter((p: any) => p.phone).map((p: any) => p.phone);

        if (this.contactId) {
            // Update
            const isBase64String = (str: string | null): boolean => {
                if (!str) return false;
                if (str.startsWith('http://') || str.startsWith('https://')) {
                    return false;
                }
                if (str.startsWith('data:')) {
                    return true;
                }
                const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
                return base64Regex.test(str) && str.length > 0;
            };

            let avatarValue: string = '';
            if (isBase64String(formValue.avatar)) {
                if (formValue.avatar.startsWith('data:')) {
                    avatarValue = formValue.avatar.split(',')[1] || formValue.avatar;
                } else {
                    avatarValue = formValue.avatar;
                }
            } else if (this.avatarExplicitlyRemoved) {
                avatarValue = '';
            } else {
                avatarValue = '';
            }

            const updateData: any = {
                id: this.contactId,
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                companyName: formValue.companyName,
                ice: formValue.ice,
                rc: formValue.rc,
                identifier: formValue.identifier,
                email: formValue.email,
                phones: phones,
                avatar: avatarValue,
                attachmentsToAdd: this.attachmentsToAdd.length > 0 ? this.attachmentsToAdd : undefined,
                attachmentsToDelete: this.attachmentsToDelete.length > 0 ? this.attachmentsToDelete : undefined
            };

            this._contactsService.updateContact(updateData.id, updateData)
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
            const createData: any = {
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                companyName: formValue.companyName,
                ice: formValue.ice,
                rc: formValue.rc,
                identifier: formValue.identifier,
                isACompany: formValue.isACompany,
                email: formValue.email,
                phones: phones,
                avatar: formValue.avatar,
                attachments: this.attachmentsToAdd.length > 0 ? this.attachmentsToAdd : undefined
            };

            this._contactsService.createContact(this.currentType, createData)
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
     * Get avatar URL for display
     */
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

    /**
     * Upload avatar
     */
    uploadAvatar(fileList: FileList | null): void {
        if (!fileList || !fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB
        const file = fileList[0];

        if (!allowedTypes.includes(file.type)) {
            this._errorHandlerService.showErrorAlert(
                'Invalid File Type',
                'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
            );
            return;
        }

        if (file.size > maxSizeInBytes) {
            this._errorHandlerService.showErrorAlert(
                'File Too Large',
                'The selected file is too large. Please choose an image smaller than 1 MB.'
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            
            this.contactForm.patchValue({
                avatar: base64String
            });
            
            const dataUrl = reader.result as string;
            if (this.contact) {
                this.contact.avatar = dataUrl;
            }
            
            this.avatarExplicitlyRemoved = false;
            this._changeDetectorRef.markForCheck();
        };
        reader.onerror = () => {
            this._errorHandlerService.showErrorAlert(
                'Upload Error',
                'Failed to read the image file. Please try again.'
            );
        };
        reader.readAsDataURL(file);
    }

    /**
     * Remove avatar
     */
    removeAvatar(): void {
        this.contactForm.patchValue({ avatar: '' });
        if (this.avatarFileInput) {
            this.avatarFileInput.nativeElement.value = null;
        }
        if (this.contact) {
            this.contact.avatar = null;
        }
        this.avatarExplicitlyRemoved = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add phone field
     */
    addPhoneField(phoneValue: string = ''): void {
        const phoneGroup = this._formBuilder.group({
            phone: [phoneValue]
        });
        this.phonesFormArray.push(phoneGroup);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove phone field
     */
    removePhoneField(index: number): void {
        this.phonesFormArray.removeAt(index);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Upload documents
     */
    uploadDocuments(fileList: FileList | null): void {
        if (!fileList || !fileList.length) {
            return;
        }

        const maxSizeInBytes = 100 * 1024 * 1024; // 100 MB
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];

        const filesToProcess = Array.from(fileList);
        
        const processPromises = filesToProcess.map(file => {
            return new Promise<void>((resolve) => {
                if (!allowedTypes.includes(file.type)) {
                    this._errorHandlerService.showErrorAlert(
                        'Invalid File Type',
                        `File "${file.name}" is not a supported format.`
                    );
                    resolve();
                    return;
                }

                if (file.size > maxSizeInBytes) {
                    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                    this._errorHandlerService.showErrorAlert(
                        'File Too Large',
                        `File "${file.name}" is ${fileSizeInMB} MB. Please choose files smaller than 100 MB.`
                    );
                    resolve();
                    return;
                }

                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    
                    this.attachmentsToAdd.push({
                        fileName: file.name,
                        base64Content: base64String,
                        root: 'contact'
                    });
                    
                    resolve();
                };
                reader.onerror = () => {
                    this._errorHandlerService.showErrorAlert(
                        'Upload Error',
                        `Failed to read file "${file.name}". Please try again.`
                    );
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(processPromises).then(() => {
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Remove document from queue
     */
    removeDocumentFromQueue(index: number): void {
        this.attachmentsToAdd.splice(index, 1);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Mark document for deletion
     */
    markDocumentForDeletion(documentId: string): void {
        if (!this.attachmentsToDelete.includes(documentId)) {
            this.attachmentsToDelete.push(documentId);
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Check if document is marked for deletion
     */
    isDocumentMarkedForDeletion(documentId: string): boolean {
        return this.attachmentsToDelete.includes(documentId);
    }

    /**
     * Cancel document deletion
     */
    cancelDocumentDeletion(documentId: string): void {
        const index = this.attachmentsToDelete.indexOf(documentId);
        if (index > -1) {
            this.attachmentsToDelete.splice(index, 1);
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Get display title
     */
    get displayTitle(): string {
        switch (this.currentType) {
            case 'tenant':
                return 'locataire';
            case 'owner':
                return 'propriétaire';
            case 'service':
                return 'prestataire';
            default:
                return 'contact';
        }
    }

    /**
     * Get file icon based on extension
     */
    getFileIcon(extension: string): string {
        if (!extension) {
            return 'heroicons_outline:document';
        }

        extension = extension.toLowerCase();
        
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
            return 'heroicons_outline:photo';
        }
        if (extension === '.pdf') {
            return 'heroicons_outline:document-text';
        }
        if (['.doc', '.docx'].includes(extension)) {
            return 'heroicons_outline:document-text';
        }
        if (['.xls', '.xlsx'].includes(extension)) {
            return 'heroicons_outline:table-cells';
        }
        
        return 'heroicons_outline:document';
    }

    /**
     * Format file size in bytes to MB format
     */
    formatFileSize(bytes: number): string {
        if (!bytes || bytes === 0) {
            return '0.00 MB';
        }
        
        const mb = 1024 * 1024;
        const sizeInMB = bytes / mb;
        
        return sizeInMB.toFixed(2) + ' MB';
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

