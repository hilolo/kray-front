import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ContactsService } from 'app/modules/admin/contacts/contacts.service';
import { Contact, Country, Tag, ContactType, AttachmentInput } from 'app/modules/admin/contacts/contacts.types';
import { debounceTime, filter, Subject, takeUntil } from 'rxjs';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { DocumentViewerComponent } from 'app/core/document-viewer/document-viewer.component';
import { ImageViewerComponent } from 'app/core/image-viewer/image-viewer.component';
import { PdfViewerComponent } from 'app/core/pdf-viewer/pdf-viewer.component';
import { FilenameDisplayComponent } from 'app/@fuse/components/filename-display/filename-display.component';

@Component({
    selector       : 'contacts-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [NgIf, NgClass, MatButtonModule, MatTooltipModule, MatIconModule, NgFor, FormsModule, ReactiveFormsModule, MatRippleModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, MatOptionModule, MatDatepickerModule, MatSlideToggleModule, TextFieldModule, MatTabsModule, TranslocoModule, DatePipe, DocumentViewerComponent, ImageViewerComponent, PdfViewerComponent, FilenameDisplayComponent],
})
export class ContactsDetailsComponent implements OnInit, OnDestroy
{
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('documentFileInput') private _documentFileInput: ElementRef;
    
    // Dialog mode inputs
    @Input() dialogMode: boolean = false;
    @Input() inputContactType: ContactType;
    @Output() contactSaved = new EventEmitter<Contact>();
    @Output() dialogClosed = new EventEmitter<void>();

    editMode: boolean = false;
    attachmentsToAdd: AttachmentInput[] = [];
    attachmentsToDelete: string[] = [];
    tags: Tag[];
    tagsEditMode: boolean = false;
    filteredTags: Tag[];
    contact: Contact;
    contactForm: UntypedFormGroup;
    contacts: Contact[];
    countries: Country[];
    currentType: ContactType = 'tenant';
    isNewContact: boolean = false;
    avatarExplicitlyRemoved: boolean = false; // Track if user explicitly removed avatar
    
    // Document and Image Viewer state
    isDocumentViewerOpen: boolean = false;
    isPdfViewerOpen: boolean = false;
    isImageViewerOpen: boolean = false;
    selectedDocumentUrl: string = '';
    selectedDocumentName: string = '';
    selectedDocumentType: string = 'pdf';
    originalDocumentUrl: string = ''; // Original URL for download
    selectedFileSize: number = 0; // File size in bytes
    selectedPdfUrl: string = '';
    selectedPdfName: string = '';
    selectedPdfSize: number = 0; // PDF size in bytes
    selectedImageUrl: string = '';
    selectedImageName: string = '';
    selectedImageSize: number = 0;
    selectedImages: Array<{url: string, name: string, size: number}> = [];
    selectedImageIndex: number = 0; // Image size in bytes
    formFieldHelpers: string[] = [''];
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Get the display title based on current type
     */
    get displayTitle(): string
    {
        switch (this.currentType) {
            case 'tenant':
                return this._translocoService.translate('contacts.types.tenants.singular');
            case 'owner':
                return this._translocoService.translate('contacts.types.owners.singular');
            case 'service':
                return this._translocoService.translate('contacts.types.services.singular');
            default:
                return this._translocoService.translate('contacts.title');
        }
    }

    /**
     * Get the avatar URL for display
     * Handles URLs, data URLs, and plain base64 strings
     */
    get avatarUrl(): string | null
    {
        if (!this.contact?.avatar) {
            return null;
        }

        // If it already has the data URL prefix, return as is
        if (this.contact.avatar.startsWith('data:')) {
            return this.contact.avatar;
        }

        // If it's already a URL (http/https), return as is
        if (this.contact.avatar.startsWith('http')) {
            return this.contact.avatar;
        }

        // Otherwise, assume it's a plain base64 string and add the data URL prefix
        return `data:image/png;base64,${this.contact.avatar}`;
    }

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _translocoService: TranslocoService,
        private _errorHandlerService: ErrorHandlerService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // If in dialog mode, use the input contact type
        if (this.dialogMode && this.inputContactType) {
            this.currentType = this.inputContactType;
        } else {
            // Determine contact type from URL (same as ContactsComponent and ListComponent)
            const url = this._router.url;
            
            if (url.includes('/contacts/tenants')) {
                this.currentType = 'tenant';
            } else if (url.includes('/contacts/owners')) {
                this.currentType = 'owner';
            } else if (url.includes('/contacts/service-pros') || url.includes('/contacts/services')) {
                this.currentType = 'service';
            }
        }

        // Create the contact form first (before subscriptions that use it)
        this.contactForm = this._formBuilder.group({
            id          : [''],
            type        : [this.currentType],
            firstName   : ['', [Validators.required]],
            lastName    : ['', [Validators.required]],
            companyName : [''],
            ice         : [''],
            rc          : [''],
            identifier  : ['', [Validators.required]],
            isACompany  : [false],
            email       : ['', [Validators.email]],
            phones      : this._formBuilder.array([]),
            avatar      : [null],
        });

        // Watch for changes in isACompany to toggle validation
        this.contactForm.get('isACompany').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((isCompany: boolean) => {
                const firstNameControl = this.contactForm.get('firstName');
                const lastNameControl = this.contactForm.get('lastName');
                const companyNameControl = this.contactForm.get('companyName');

                if (isCompany) {
                    // Company mode: make companyName required, firstName and lastName optional
                    firstNameControl.clearValidators();
                    lastNameControl.clearValidators();
                    companyNameControl.setValidators([Validators.required]);
                } else {
                    // Individual mode: make firstName and lastName required, companyName optional
                    firstNameControl.setValidators([Validators.required]);
                    lastNameControl.setValidators([Validators.required]);
                    companyNameControl.clearValidators();
                }

                // Update validity
                firstNameControl.updateValueAndValidity();
                lastNameControl.updateValueAndValidity();
                companyNameControl.updateValueAndValidity();
            });

        // Check if this is a new contact
        if (this.dialogMode) {
            // In dialog mode, always treat as new contact
            this.isNewContact = true;
            this.editMode = true;
            
            // Clear the current contact in the service to prevent the subscription from overwriting
            this._contactsService.clearContact();
            
            // Completely reset the form first to clear all previous values
            this.contactForm.reset({
                id: '',
                type: this.currentType,
                firstName: '',
                lastName: '',
                companyName: '',
                ice: '',
                rc: '',
                identifier: '',
                isACompany: false,
                email: '',
                avatar: null
            });
            
            // Clear phone form array
            (this.contactForm.get('phones') as UntypedFormArray).clear();
            
            // Add one empty phone field
            (this.contactForm.get('phones') as UntypedFormArray).push(
                this._formBuilder.group({
                    phone: [''],
                })
            );
            
            // Create a new empty contact object
            const emptyContact: Contact = {
                id: '',
                type: this.currentType,
                name: '',
                firstName: '',
                lastName: '',
                companyName: '',
                ice: '',
                rc: '',
                email: '',
                emails: [],
                phones: [],
                phoneNumbers: [],
                avatar: null,
                isACompany: false,
                company: '',
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Set the contact
            this.contact = emptyContact;
            
            // Reset the flag for new contact in dialog mode
            this.avatarExplicitlyRemoved = false;
            
            // Mark for check
            this._changeDetectorRef.markForCheck();
        } else {
            // Normal mode - check route params
            this._activatedRoute.params
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((params) => {
                    const id = params['id'];
                    this.isNewContact = id === 'new' || !id;
                    
                    if (this.isNewContact) {
                    // Clear the current contact in the service to prevent the subscription from overwriting
                    this._contactsService.clearContact();
                    
                    // Completely reset the form first to clear all previous values
                    this.contactForm.reset({
                        id: '',
                        type: this.currentType,
                        firstName: '',
                        lastName: '',
                        companyName: '',
                        ice: '',
                        rc: '',
                        identifier: '',
                        isACompany: false,
                        email: '',
                        avatar: null
                    });
                    
                    // Clear phone form array
                    (this.contactForm.get('phones') as UntypedFormArray).clear();
                    
                    // Add one empty phone field
                    (this.contactForm.get('phones') as UntypedFormArray).push(
                        this._formBuilder.group({
                            phone: [''],
                        })
                    );
                    
                    // Create a new empty contact object
                    const emptyContact: Contact = {
                        id: '',
                        type: this.currentType,
                        name: '',
                        firstName: '',
                        lastName: '',
                        companyName: '',
                        ice: '',
                        rc: '',
                        email: '',
                        emails: [],
                        phones: [],
                        phoneNumbers: [],
                        avatar: null,
                        isACompany: false,
                        company: '',
                        tags: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    // Set the contact
                    this.contact = emptyContact;
                    
                    // Enable edit mode for new contacts
                    this.editMode = true;
                    
                    // Reset the flag for new contact
                    this.avatarExplicitlyRemoved = false;
                    
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                } else if (id) {
                    // Load existing contact only if we have a valid ID
                    this._contactsService.getContactById(id).subscribe();
                }
            });
        }

        // Get the contacts
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) =>
            {
                this.contacts = contacts;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._contactsService.contact$
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter(contact => !!contact && !!contact.id)
            )
            .subscribe((contact: Contact) =>
            {
                // Get the contact
                this.contact = contact;

                // Clear the phones form array
                (this.contactForm.get('phones') as UntypedFormArray).clear();

                // Patch values to the form (only backend fields)
                // Note: Don't set avatar from contact.avatar if it's a URL (for display only)
                // Only set avatar in form when user uploads a new file (base64 string)
                this.contactForm.patchValue({
                    id: contact.id,
                    type: contact.type,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    companyName: contact.companyName,
                    ice: contact.ice,
                    rc: contact.rc,
                    identifier: contact.identifier,
                    isACompany: contact.isACompany,
                    email: contact.email,
                    avatar: null // Don't set avatar URL in form - only set when user uploads new file
                });
                
                // Reset the flag when loading a contact
                this.avatarExplicitlyRemoved = false;

                // Setup the phones form array
                const phoneFormGroups = [];

                if ( contact.phones && contact.phones.length > 0 )
                {
                    // Iterate through them
                    contact.phones.forEach((phone) =>
                    {
                        // Create a phone form group
                        phoneFormGroups.push(
                            this._formBuilder.group({
                                phone: [phone],
                            }),
                        );
                    });
                }
                else
                {
                    // Create a phone form group
                    phoneFormGroups.push(
                        this._formBuilder.group({
                            phone: [''],
                        }),
                    );
                }

                // Add the phone form groups to the phones form array
                phoneFormGroups.forEach((phoneFormGroup) =>
                {
                    (this.contactForm.get('phones') as UntypedFormArray).push(phoneFormGroup);
                });

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the country telephone codes
        this._contactsService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((codes: Country[]) =>
            {
                this.countries = codes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the tags
        this._contactsService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: Tag[]) =>
            {
                this.tags = tags;
                this.filteredTags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<boolean> | void
    {
        if (this.dialogMode) {
            // In dialog mode, emit the close event
            this.dialogClosed.emit();
        } else {
            // Navigate back to the list
            return this._router.navigate(['../'], {relativeTo: this._activatedRoute});
        }
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        // Reset the flag when canceling edit mode (toggling off)
        if (!this.editMode) {
            this.avatarExplicitlyRemoved = false;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Show alert when trying to edit while not in edit mode
     */
    onInputClick(): void
    {
        if (!this.editMode && !this.isNewContact) {
            const title = this._translocoService.translate('contacts.messages.edit_mode_required_title');
            const message = this._translocoService.translate('contacts.messages.edit_mode_required_message');
            this._errorHandlerService.showInfoAlert(title, message);
        }
    }

    /**
     * Update the contact
     */
    updateContact(): void
    {
        // Get the contact object
        const formValue = this.contactForm.getRawValue();

        // Extract phones and filter empty values
        const phones = formValue.phones.filter(phone => phone.phone).map(p => p.phone);

        // Check if this is a new contact
        if (this.isNewContact) {
            // Prepare contact data for creation (includes all attachments)
            const createData = {
                id: formValue.id,
                type: formValue.type,
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

            // Create the contact on the server
            this._contactsService.createContact(this.currentType, createData).subscribe((newContact) =>
            {
                // Clear attachments queues
                this.attachmentsToAdd = [];
                this.attachmentsToDelete = [];
                
                if (this.dialogMode) {
                    // In dialog mode, emit the contact saved event
                    this.contactSaved.emit(newContact);
                } else {
                    // Navigate back to the list
                    this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                    
                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                }
            });
        } else {
            // Helper function to check if avatar is a base64 string (not a URL)
            const isBase64String = (str: string | null): boolean => {
                if (!str) return false;
                // If it starts with http/https, it's a URL, not base64
                if (str.startsWith('http://') || str.startsWith('https://')) {
                    return false;
                }
                // If it starts with data:, it's a data URL - extract base64 part
                if (str.startsWith('data:')) {
                    return true; // Data URLs contain base64, but we need just the base64 part
                }
                // Otherwise, check if it looks like base64 (alphanumeric, +, /, =)
                const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
                return base64Regex.test(str) && str.length > 0;
            };

            // Determine avatar value and removal flag
            let avatarValue: string = '';
            let removeAvatar: boolean = false;
            
            if (isBase64String(formValue.avatar)) {
                // New upload: extract base64 string
                if (formValue.avatar.startsWith('data:')) {
                    avatarValue = formValue.avatar.split(',')[1] || formValue.avatar;
                } else {
                    avatarValue = formValue.avatar;
                }
            } else if (this.avatarExplicitlyRemoved) {
                // Explicitly removed: send empty string with remove flag
                avatarValue = '';
                removeAvatar = true;
            } else {
                // Not edited: send empty string instead of null
                avatarValue = '';
            }

            // Prepare contact data for update
            const updateData: any = {
                id: formValue.id,
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                companyName: formValue.companyName,
                ice: formValue.ice,
                rc: formValue.rc,
                identifier: formValue.identifier,
                email: formValue.email,
                phones: phones,
                avatar: avatarValue, // Always send "" instead of null
                attachmentsToAdd: this.attachmentsToAdd.length > 0 ? this.attachmentsToAdd : undefined,
                attachmentsToDelete: this.attachmentsToDelete.length > 0 ? this.attachmentsToDelete : undefined
            };

            // Include RemoveAvatar flag only if avatar was explicitly removed
            if (removeAvatar) {
                updateData.removeAvatar = true;
            }

            // Update the contact on the server
            this._contactsService.updateContact(updateData.id, updateData).subscribe(() =>
            {
                // Clear attachments queues
                this.attachmentsToAdd = [];
                this.attachmentsToDelete = [];
                
                // Reset the flag after successful update
                this.avatarExplicitlyRemoved = false;
                
                // Toggle the edit mode off
                this.toggleEditMode(false);
            });
        }
    }

    /**
     * Delete the contact
     */
    deleteContact(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : this._translocoService.translate('contacts.messages.delete_confirmation_title', { type: this.displayTitle.toLowerCase() }),
            message: this._translocoService.translate('contacts.messages.delete_confirmation_message', { type: this.displayTitle.toLowerCase() }),
            actions: {
                confirm: {
                    label: this._translocoService.translate('contacts.actions.delete'),
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) =>
        {
            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Get the current contact's id
                const id = this.contact.id;

                // Delete the contact
                this._contactsService.deleteContact(id)
                    .subscribe((isDeleted) =>
                    {
                        // Return if the contact wasn't deleted...
                        if ( !isDeleted )
                        {
                            return;
                        }

                        // Always navigate back to the list after deletion
                        this._router.navigate(['../'], {relativeTo: this._activatedRoute});

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

    }

    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void
    {
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        const maxSizeInBytes = 100 * 1024 * 1024; // 100 MB
        const file = fileList[0];

        // Check file type
        if ( !allowedTypes.includes(file.type) )
        {
            this._errorHandlerService.showErrorAlert(
                'Invalid File Type',
                'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
            );
            return;
        }

        // Check file size (100 MB limit)
        if ( file.size > maxSizeInBytes )
        {
            const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            this._errorHandlerService.showErrorAlert(
                'File Too Large',
                `The selected file is ${fileSizeInMB} MB. Please choose an image smaller than 100 MB.`
            );
            return;
        }

        // Convert file to base64 and store in form
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            
            // Update the form control with base64 string
            this.contactForm.patchValue({
                avatar: base64String
            });
            
            // Update the contact object for immediate UI display (use data URL for preview)
            const dataUrl = reader.result as string;
            this.contact.avatar = dataUrl;
            
            // Reset the flag since user uploaded a new avatar
            this.avatarExplicitlyRemoved = false;
            
            // Mark for check
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
     * Remove the avatar
     */
    removeAvatar(): void
    {
        // Get the form control for 'avatar'
        const avatarFormControl = this.contactForm.get('avatar');

        // Set the avatar as null/empty string
        avatarFormControl.setValue('');

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the contact for UI
        this.contact.avatar = null;

        // Mark that avatar was explicitly removed by user
        this.avatarExplicitlyRemoved = true;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add a phone field
     */
    addPhoneField(): void
    {
        // Create an empty phone form group
        const phoneFormGroup = this._formBuilder.group({
            phone: [''],
        });

        // Add the phone form group to the phones form array
        (this.contactForm.get('phones') as UntypedFormArray).push(phoneFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the phone field
     *
     * @param index
     */
    removePhoneField(index: number): void
    {
        // Get form array for phones
        const phonesFormArray = this.contactForm.get('phones') as UntypedFormArray;

        // Remove the phone field
        phonesFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get country info by iso code
     *
     * @param iso
     */
    getCountryByIso(iso: string): Country
    {
        return this.countries.find(country => country.iso === iso);
    }

    /**
     * Upload attachments
     *
     * @param fileList
     */
    uploadDocuments(fileList: FileList): void
    {
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const maxSizeInBytes = 100 * 1024 * 1024; // 100 MB per file
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];

        // Process each file
        const filesToProcess = Array.from(fileList);
        
        const processPromises = filesToProcess.map(file => {
            return new Promise<void>((resolve, reject) => {
                // Check file type
                if ( !allowedTypes.includes(file.type) )
                {
                    this._errorHandlerService.showErrorAlert(
                        'Invalid File Type',
                        `File "${file.name}" is not a supported format. Please upload PDF, images, or Office attachments.`
                    );
                    resolve();
                    return;
                }

                // Check file size
                if ( file.size > maxSizeInBytes )
                {
                    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                    this._errorHandlerService.showErrorAlert(
                        'File Too Large',
                        `File "${file.name}" is ${fileSizeInMB} MB. Please choose files smaller than 100 MB.`
                    );
                    resolve();
                    return;
                }

                // Convert file to base64
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    
                    // Add to attachments array
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

        // Wait for all files to be processed
        Promise.all(processPromises).then(() => {
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Remove a document from upload queue (for new attachments)
     *
     * @param index
     */
    removeDocumentFromQueue(index: number): void
    {
        this.attachmentsToAdd.splice(index, 1);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Mark an existing document for deletion
     *
     * @param documentId
     */
    markDocumentForDeletion(documentId: string): void
    {
        if (!this.attachmentsToDelete.includes(documentId)) {
            this.attachmentsToDelete.push(documentId);
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Check if a document is marked for deletion
     *
     * @param documentId
     */
    isDocumentMarkedForDeletion(documentId: string): boolean
    {
        return this.attachmentsToDelete.includes(documentId);
    }

    /**
     * Cancel deletion of a document
     *
     * @param documentId
     */
    cancelDocumentDeletion(documentId: string): void
    {
        const index = this.attachmentsToDelete.indexOf(documentId);
        if (index > -1) {
            this.attachmentsToDelete.splice(index, 1);
            this._changeDetectorRef.markForCheck();
        }
    }





    /**
     * View or download document based on type
     *
     * @param doc
     */
    viewDocument(doc: any): void
    {
        if (!doc.url) {
            return;
        }

        const extension = doc.fileExtension?.toLowerCase() || '';
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const pdfExtension = '.pdf';
        const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

        if (imageExtensions.includes(extension)) {
            // Open image in image viewer
            this.openImageViewer(doc.url, doc.originalFileName || doc.fileName, doc.fileSize || 0);
        } else if (extension === pdfExtension) {
            // Open PDF in dedicated PDF viewer
            this.openPdfViewer(doc.url, doc.originalFileName || doc.fileName, doc.fileSize || 0);
        } else if (officeExtensions.includes(extension)) {
            // Open Office attachments in document viewer
            this.openDocumentViewer(doc.url, doc.originalFileName || doc.fileName, extension, doc.fileSize || 0);
        } else {
            // Show unsupported format message
            this._errorHandlerService.showWarningAlert(
                'Unsupported Format',
                `The file format "${extension}" is not supported for preview. Please use the download button to download the file.`
            );
        }
    }

    /**
     * Download document directly
     *
     * @param doc
     * @param event
     */
    downloadDocument(doc: any, event?: Event): void
    {
        if (event) {
            event.stopPropagation();
        }

        if (!doc.url) {
            return;
        }

        const fileName = doc.originalFileName || doc.fileName || 'download';
        
        // Fetch the document and trigger download
        fetch(doc.url)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error downloading document:', error);
                // Fallback: try direct download
                const link = document.createElement('a');
                link.href = doc.url;
                link.download = fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }

    /**
     * Open document viewer
     *
     * @param url
     * @param name
     * @param extension
     * @param fileSize
     */
    openDocumentViewer(url: string, name: string, extension: string, fileSize: number = 0): void
    {
        // Store the original URL for downloading
        this.originalDocumentUrl = url;
        this.selectedDocumentUrl = url;
        this.selectedDocumentName = name;
        this.selectedFileSize = fileSize;
        
        // Determine document type for viewer
        if (extension === '.pdf') {
            this.selectedDocumentType = 'pdf';
        } else if (['.doc', '.docx'].includes(extension)) {
            this.selectedDocumentType = 'doc';
        } else if (['.xls', '.xlsx'].includes(extension)) {
            this.selectedDocumentType = 'xl';
        } else if (['.ppt', '.pptx'].includes(extension)) {
            this.selectedDocumentType = 'ppt';
        } else {
            this.selectedDocumentType = 'pdf';
        }
        
        this.isDocumentViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close document viewer
     */
    closeDocumentViewer(): void
    {
        this.isDocumentViewerOpen = false;
        this.selectedDocumentUrl = '';
        this.selectedDocumentName = '';
        this.originalDocumentUrl = '';
        this.selectedFileSize = 0;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open image viewer
     *
     * @param url
     * @param name
     * @param fileSize
     */
    openImageViewer(url: string, name: string, fileSize: number = 0): void
    {
        // Get all images from contact attachments
        const allImages = this.getAllImagesFromAttachments();
        
        // Find the index of the clicked image
        const imageIndex = allImages.findIndex(img => img.url === url);
        
        this.selectedImages = allImages;
        this.selectedImageIndex = imageIndex >= 0 ? imageIndex : 0;
        this.selectedImageUrl = url;
        this.selectedImageName = name;
        this.selectedImageSize = fileSize;
        this.isImageViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close image viewer
     */
    closeImageViewer(): void
    {
        this.isImageViewerOpen = false;
        this.selectedImageUrl = '';
        this.selectedImageName = '';
        this.selectedImageSize = 0;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get all images from contact attachments
     */
    getAllImagesFromAttachments(): Array<{url: string, name: string, size: number}>
    {
        if (!this.contact || !this.contact.attachments) {
            return [];
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico'];
        
        return this.contact.attachments
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
    onImageChanged(index: number): void
    {
        this.selectedImageIndex = index;
        if (this.selectedImages && this.selectedImages[index]) {
            const image = this.selectedImages[index];
            this.selectedImageUrl = image.url;
            this.selectedImageName = image.name;
            this.selectedImageSize = image.size;
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open PDF viewer
     *
     * @param url
     * @param name
     * @param fileSize
     */
    openPdfViewer(url: string, name: string, fileSize: number = 0): void
    {
        this.selectedPdfUrl = url;
        this.selectedPdfName = name;
        this.selectedPdfSize = fileSize;
        this.isPdfViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close PDF viewer
     */
    closePdfViewer(): void
    {
        this.isPdfViewerOpen = false;
        this.selectedPdfUrl = '';
        this.selectedPdfName = '';
        this.selectedPdfSize = 0;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get file icon based on extension
     *
     * @param extension
     */
    getFileIcon(extension: string): string
    {
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
     * Format file size in bytes to MB format (always)
     */
    formatFileSize(bytes: number): string
    {
        if (!bytes || bytes === 0) {
            return '0.00 MB';
        }
        
        const mb = 1024 * 1024;
        const sizeInMB = bytes / mb;
        
        return sizeInMB.toFixed(2) + ' MB';
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

}
