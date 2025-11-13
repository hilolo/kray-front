import { AsyncPipe, DOCUMENT, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseViewToggleComponent } from '@fuse/components/view-toggle/view-toggle.component';
import { ContactsService } from 'app/modules/admin/contacts/contacts.service';
import { Contact, Country, ContactType } from 'app/modules/admin/contacts/contacts.types';
import { debounceTime, distinctUntilChanged, filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { TranslocoService, TranslocoPipe } from '@ngneat/transloco';
import { AppConfigService } from '@fuse/services/config/app-config.service';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';
import { PermissionService } from 'app/core/auth/permission.service';

@Component({
    selector       : 'contacts-list',
    templateUrl    : './list.component.html',
    styleUrls      : ['./list.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [NgIf, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, NgFor, NgClass, RouterLink, AsyncPipe, MatTooltipModule, FuseViewToggleComponent, TranslocoPipe, MatPaginatorModule, MatSelectModule, NoDataComponent],
})
export class ContactsListComponent implements OnInit, OnDestroy
{

    contacts$: Observable<Contact[]>;
    currentType$: Observable<ContactType>;

    contactsCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    countries: Country[];
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedContact: Contact;
    currentView: 'list' | 'cards' = 'list';
    currentType: ContactType = 'tenant';
    showCompanies: boolean = false;
    showIndividuals: boolean = false;
    
    // Pagination
    pagination: { currentPage: number, totalPages: number, totalItems: number } = { currentPage: 1, totalPages: 1, totalItems: 0 };
    pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    pageSizeOptions: number[] = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;
    
    // Contact selection
    selectedContacts: Set<string> = new Set<string>();
    
    // Permissions
    canViewContacts: boolean = false;
    canEditContacts: boolean = false;
    canDeleteContacts: boolean = false;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Expose changeDetectorRef for template access
    get changeDetectorRef(): ChangeDetectorRef
    {
        return this._changeDetectorRef;
    }

    /**
     * Get the display title based on current type
     */
    get displayTitle(): string
    {
        switch (this.currentType) {
            case 'tenant':
                return this._translocoService.translate('contacts.types.tenants.title');
            case 'owner':
                return this._translocoService.translate('contacts.types.owners.title');
            case 'service':
                return this._translocoService.translate('contacts.types.services.title');
            default:
                return this._translocoService.translate('contacts.title');
        }
    }

    /**
     * Get the display count text based on current type and count
     */
    get displayCount(): string
    {
        const countMapping = this._translocoService.translateObject(`contacts.types.${this.currentType}.count`);
        
        if (this.contactsCount === 0 && countMapping['=0']) {
            return countMapping['=0'];
        } else if (this.contactsCount === 1 && countMapping['=1']) {
            return countMapping['=1'];
        } else if (countMapping['other']) {
            return countMapping['other'].replace('{count}', this.contactsCount.toString());
        }
        
        return `${this.contactsCount}`;
    }


    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsService: ContactsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _translocoService: TranslocoService,
        private _appConfigService: AppConfigService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _errorHandlerService: ErrorHandlerService,
        private _permissionService: PermissionService,
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
        // Check permissions
        this.canViewContacts = this._permissionService.canView('contacts');
        this.canEditContacts = this._permissionService.canEdit('contacts');
        this.canDeleteContacts = this._permissionService.canDelete('contacts');
        
        // If user doesn't have view permission, don't load data
        if (!this.canViewContacts) {
            return;
        }
        
        // Determine contact type from URL
        const url = this._router.url;
        
        let type: ContactType;
        if (url.includes('/contacts/tenants')) {
            type = 'tenant';
        } else if (url.includes('/contacts/owners')) {
            type = 'owner';
        } else if (url.includes('/contacts/service-pros') || url.includes('/contacts/services')) {
            type = 'service';
        }
        
        if (type && ['tenant', 'owner', 'service'].includes(type)) {
            this.currentType = type;
            this._contactsService.setContactType(type);
            
            // Load the saved view preference for this contact type
            this.currentView = this._appConfigService.getContactViewPreference(type);
            
            // Load contacts for this type with pagination
            this._contactsService.getContactsByType(type, this.pagination.currentPage, this.pageSize, false, undefined, this.getIsACompanyFilter()).subscribe();
        }

        // Get the contacts
        this.contacts$ = this._contactsService.contacts$;
        
        // Get pagination
        this._contactsService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) =>
            {
                this.pagination = pagination;
                // Update total count from pagination
                this.contactsCount = pagination.totalItems;
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) =>
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._contactsService.contact$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: Contact) =>
            {
                // Update the selected contact
                this.selectedContact = contact;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the countries
        this._contactsService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((countries: Country[]) =>
            {
                // Update the countries
                this.countries = countries;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300), // Wait 300ms after user stops typing
                distinctUntilChanged() // Only emit when value actually changes
            )
            .subscribe((searchQuery: string) => {
                // Reset to first page when searching
                this.pagination.currentPage = 1;
                
                // Only send search request if query has 3 or more characters
                // If less than 3 characters or empty, load normal list
                const query = searchQuery && searchQuery.trim().length >= 3 ? searchQuery.trim() : undefined;
                
                this._contactsService.getContactsByType(
                    this.currentType,
                    this.pagination.currentPage,
                    this.pageSize,
                    false,
                    query,
                    this.getIsACompanyFilter()
                ).subscribe();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/'), // '/'
                ),
            )
            .subscribe(() =>
            {
                this.createContact();
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Contact selection methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle contact selection
     *
     * @param contactId
     */
    toggleContactSelection(contactId: string): void
    {
        if (this.selectedContacts.has(contactId)) {
            this.selectedContacts.delete(contactId);
        } else {
            this.selectedContacts.add(contactId);
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if contact is selected
     *
     * @param contactId
     */
    isContactSelected(contactId: string): boolean
    {
        return this.selectedContacts.has(contactId);
    }

    /**
     * Toggle select all contacts
     */
    toggleSelectAllContacts(): void
    {
        if (this.areAllContactsSelected()) {
            this.selectedContacts.clear();
        } else {
            // Get all contacts from the current view
            this.contacts$.subscribe(contacts => {
                contacts.forEach(contact => {
                    this.selectedContacts.add(contact.id);
                });
            }).unsubscribe();
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if all contacts are selected
     */
    areAllContactsSelected(): boolean
    {
        let allContacts: Contact[] = [];
        this.contacts$.subscribe(contacts => {
            allContacts = contacts;
        }).unsubscribe();
        
        if (allContacts.length === 0) {
            return false;
        }
        return allContacts.every(contact => this.selectedContacts.has(contact.id));
    }

    /**
     * Check if some contacts are selected (for indeterminate state)
     */
    areSomeContactsSelected(): boolean
    {
        let allContacts: Contact[] = [];
        this.contacts$.subscribe(contacts => {
            allContacts = contacts;
        }).unsubscribe();
        
        if (allContacts.length === 0) {
            return false;
        }
        const selectedCount = allContacts.filter(contact => this.selectedContacts.has(contact.id)).length;
        return selectedCount > 0 && selectedCount < allContacts.length;
    }

    /**
     * Delete selected contacts
     */
    deleteSelectedContacts(): void
    {
        if (this.selectedContacts.size === 0) {
            this._errorHandlerService.showWarningAlert('No Selection', 'Please select contacts to delete.');
            return;
        }

        // Show confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Selected Contacts',
            message: `Are you sure you want to delete ${this.selectedContacts.size} selected contact(s)? This action cannot be undone.`,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn'
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Delete',
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
                this._deleteSelectedContacts();
            }
        });
    }

    /**
     * Actually delete the selected contacts
     */
    private _deleteSelectedContacts(): void
    {
        const selectedContactIds = Array.from(this.selectedContacts);
        let completedDeletions = 0;
        let failedDeletions = 0;
        
        // Delete contacts one by one
        selectedContactIds.forEach(contactId => {
            this._contactsService.deleteContact(contactId).subscribe({
                next: () => {
                    completedDeletions++;
                    if (completedDeletions + failedDeletions === selectedContactIds.length) {
                        // All deletions completed
                        if (failedDeletions === 0) {
                            this._errorHandlerService.showSuccessAlert(
                                'Success', 
                                `${completedDeletions} contact(s) deleted successfully.`
                            );
                        } else {
                            this._errorHandlerService.showWarningAlert(
                                'Partial Success', 
                                `${completedDeletions} contact(s) deleted, ${failedDeletions} failed.`
                            );
                        }
                        
                        // Clear selection
                        this.selectedContacts.clear();
                        
                        // Refresh the contacts list
                        this._contactsService.getContactsByType(this.currentType, this.pagination.currentPage, this.pageSize, false, undefined, this.getIsACompanyFilter()).subscribe();
                        
                        this._changeDetectorRef.markForCheck();
                    }
                },
                error: (error) => {
                    failedDeletions++;
                    console.error('Error deleting contact:', contactId, error);
                    
                    if (completedDeletions + failedDeletions === selectedContactIds.length) {
                        // All deletions completed
                        if (completedDeletions > 0) {
                            this._errorHandlerService.showWarningAlert(
                                'Partial Success', 
                                `${completedDeletions} contact(s) deleted, ${failedDeletions} failed.`
                            );
                        } else {
                            this._errorHandlerService.showErrorAlert(
                                'Error', 
                                'Failed to delete contacts. Please try again.'
                            );
                        }
                        
                        // Clear selection
                        this.selectedContacts.clear();
                        
                        // Refresh the contacts list
                        this._contactsService.getContactsByType(this.currentType, this.pagination.currentPage, this.pageSize, false, undefined, this.getIsACompanyFilter()).subscribe();
                        
                        this._changeDetectorRef.markForCheck();
                    }
                }
            });
        });
    }

    /**
     * Get count of selected contacts
     */
    get selectedContactsCount(): number
    {
        return this.selectedContacts.size;
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
     * Create contact
     */
    createContact(): void
    {
        // Navigate to the add contact form
        // The route structure is /contacts/:type/add
        this._router.navigate(['add'], {relativeTo: this._activatedRoute.parent});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle view change from view toggle component
     */
    onViewChange(view: 'list' | 'cards'): void
    {
        this.currentView = view;
        
        // Save the view preference for the current contact type
        this._appConfigService.setContactViewPreference(this.currentType, view);
        
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void
    {
        this.pageSize = event.pageSize;
        const page = event.pageIndex + 1; // Material paginator is 0-indexed, our API is 1-indexed
        
        // Load contacts for the new page
        this._contactsService.getContactsByType(this.currentType, page, this.pageSize, false, undefined, this.getIsACompanyFilter()).subscribe();
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle company filter
     */
    toggleCompanyFilter(): void
    {
        this.showCompanies = !this.showCompanies;
        this.applyContactFilter();
    }

    /**
     * Toggle individual filter
     */
    toggleIndividualFilter(): void
    {
        this.showIndividuals = !this.showIndividuals;
        this.applyContactFilter();
    }

    /**
     * Apply contact filter and reload data
     */
    private applyContactFilter(): void
    {
        // Reset to first page when filtering
        this.pagination.currentPage = 1;
        
        // Load contacts with the new filter
        this._contactsService.getContactsByType(
            this.currentType,
            this.pagination.currentPage,
            this.pageSize,
            false,
            this.searchInputControl.value,
            this.getIsACompanyFilter()
        ).subscribe();
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get the IsACompany filter value based on current selection
     * Both unchecked = undefined (show all)
     * Only companies = true
     * Only individuals = false
     * Both checked = undefined (show all)
     */
    private getIsACompanyFilter(): boolean | undefined
    {
        // If both are unchecked or both are checked, show all
        if (this.showCompanies === this.showIndividuals) {
            return undefined;
        }
        // If only companies is checked, return true
        if (this.showCompanies) {
            return true;
        }
        // If only individuals is checked, return false
        return false;
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

    /**
     * Get the avatar URL for display
     * Handles URLs, data URLs, and plain base64 strings
     */
    getAvatarUrl(avatar: string): string | null
    {
        if (!avatar) {
            return null;
        }

        // If it already has the data URL prefix, return as is
        if (avatar.startsWith('data:')) {
            return avatar;
        }

        // If it's already a URL (http/https), return as is
        if (avatar.startsWith('http')) {
            return avatar;
        }

        // Otherwise, assume it's a plain base64 string and add the data URL prefix
        return `data:image/png;base64,${avatar}`;
    }
}
