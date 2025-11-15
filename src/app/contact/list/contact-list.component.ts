import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef, TemplateRef, viewChild } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import type { ZardIcon } from '@shared/components/icon/icons';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardPaginationComponent } from '@shared/components/pagination/pagination.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Contact, ContactTypeString } from '@shared/models/contact/contact.model';
import { ContactType, routeParamToContactType, contactTypeToString, contactTypeToRouteParam } from '@shared/models/contact/contact.model';
import type { ContactListRequest } from '@shared/models/contact/contact-list-request.model';
import { ContactService } from '@shared/services/contact.service';
import { getFileViewerType } from '@shared/utils/file-type.util';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardCheckboxComponent,
    ZardIconComponent,
    ZardAvatarComponent,
    ZardSwitchComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    ZardPaginationComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contactService = inject(ContactService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly contactType = signal<ContactType>(ContactType.Tenant);
  readonly contactTypeString = signal<ContactTypeString>('Tenant');
  readonly searchQuery = signal(''); // Actual search term sent to server
  readonly searchInput = signal(''); // Input field value (for two-way binding)
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10); // Will be initialized from preferences in ngOnInit
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly showArchived = signal(false);
  readonly archivedContacts = signal<Contact[]>([]);
  readonly contacts = signal<Contact[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly contactTypeFilter = signal<'all' | 'individual' | 'company'>('all'); // Filter for Individual/Company

  toggleShowArchived(value: boolean): void {
    this.showArchived.set(value);
    // Clear selection and reset to first page when switching views
    this.selectedRows.set(new Set());
    this.currentPage.set(1);
    this.loadContacts();
  }

  // Since we're using server-side search, filteredContacts just returns contacts
  readonly filteredContacts = computed(() => {
    return this.showArchived() ? this.archivedContacts() : this.contacts();
  });

  ngOnInit(): void {
    // Get contact type from route path
    // Routes: /contact/tenants, /contact/owners, /contact/services
    // The route config path is 'tenants', 'owners', or 'services'
    const typeParam = this.route.snapshot.routeConfig?.path || 'tenants';
    const type = routeParamToContactType(typeParam);
    this.contactType.set(type);
    this.contactTypeString.set(contactTypeToString(type));
    
    // Get route key for preferences (e.g., 'contact/tenants', 'contact/owners', 'contact/services')
    const routeKey = this.getRouteKey();
    
    // Load view type preference for this route
    const savedViewType = this.preferencesService.getViewType(routeKey);
    this.viewMode.set(savedViewType);
    
    // Load page size preference for this route
    const savedPageSize = this.preferencesService.getPageSize(routeKey);
    this.pageSize.set(savedPageSize);
    
    // Set up debounced search subscription
    this.searchInputSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only trigger if value actually changed
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        const trimmedValue = value.trim();
        
        // Only search if 3+ characters, otherwise clear search
        if (trimmedValue.length >= 3) {
          this.performSearch(trimmedValue);
        } else if (trimmedValue.length === 0 && this.searchQuery()) {
          // Clear search if input is empty
          this.performSearch('');
        } else if (trimmedValue.length > 0 && trimmedValue.length < 3) {
          // If search term is less than 3 characters, clear the search query
          this.searchQuery.set('');
          this.currentPage.set(1);
          this.loadContacts();
        }
      });
    
    this.loadContacts();

    // Also listen to route changes in case of navigation
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const updatedTypeParam = this.route.snapshot.routeConfig?.path || 'tenants';
      const updatedType = routeParamToContactType(updatedTypeParam);
      this.contactType.set(updatedType);
      this.contactTypeString.set(contactTypeToString(updatedType));
      
      // Get route key for the new route
      const newRouteKey = this.getRouteKey();
      
      // Load view type preference for the new route
      const newSavedViewType = this.preferencesService.getViewType(newRouteKey);
      this.viewMode.set(newSavedViewType);
      
      // Load page size preference for the new route
      const newSavedPageSize = this.preferencesService.getPageSize(newRouteKey);
      this.pageSize.set(newSavedPageSize);
      
      // Clear search when route changes
      this.searchQuery.set('');
      this.searchInput.set('');
      
      this.loadContacts();
    });
  }

  /**
   * Get the route key for preferences storage
   * Format: 'contact/{type}' (e.g., 'contact/tenants', 'contact/owners', 'contact/services')
   */
  private getRouteKey(): string {
    const typeParam = this.route.snapshot.routeConfig?.path || 'tenants';
    return `contact/${typeParam}`;
  }

  loadContacts(): void {
    if (this.showArchived()) {
      // For archived contacts, we might need a different endpoint
      // For now, just return empty
      return;
    }

    this.isLoading.set(true);
    const request: ContactListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      type: this.contactType(),
      ...(this.searchQuery() && this.searchQuery().trim() ? { searchQuery: this.searchQuery().trim() } : {}),
      ...(this.contactTypeFilter() !== 'all' ? { isACompany: this.contactTypeFilter() === 'company' } : {}),
    };
    
    this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.contacts.set(response.result);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoading.set(false);
      },
    });
  }

  onContactTypeFilterChange(filter: 'individual' | 'company'): void {
    // Toggle off if already selected, otherwise set to new filter
    const newFilter = this.contactTypeFilter() === filter ? 'all' : filter;
    this.contactTypeFilter.set(newFilter);
    this.currentPage.set(1);
    this.loadContacts();
  }

  readonly hasActiveFilters = computed(() => {
    return this.searchQuery().trim().length > 0 || this.contactTypeFilter() !== 'all';
  });

  resetFilters(): void {
    this.searchQuery.set('');
    this.searchInput.set('');
    this.contactTypeFilter.set('all');
    this.currentPage.set(1);
    
    this.loadContacts();
  }

  readonly selectedCount = computed(() => {
    return this.selectedRows().size;
  });

  readonly hasSelectedContacts = computed(() => {
    return this.selectedCount() > 0;
  });

  readonly emptyMessage = computed(() => {
    if (this.showArchived()) {
      return 'No archived contacts found';
    }
    if (this.searchQuery()) {
      return 'No contacts match your search';
    }
    return 'No contacts available';
  });

  readonly hasData = computed(() => {
    return this.filteredContacts().length > 0;
  });

  // Template references for custom cells
  readonly contactIdCell = viewChild<TemplateRef<any>>('contactIdCell');
  readonly nameCell = viewChild<TemplateRef<any>>('nameCell');
  readonly typeCell = viewChild<TemplateRef<any>>('typeCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Contact>[]>(() => [
    {
      key: 'id',
      label: 'Contact',
      cellTemplate: this.contactIdCell(),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      cellTemplate: this.nameCell(),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      cellTemplate: this.typeCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '50px',
      cellTemplate: this.actionsCell(),
    },
  ]);

  onSearchInputChange(value: string): void {
    // Update the input value
    this.searchInput.set(value);
    // Emit to subject for debounced search
    this.searchInputSubject.next(value);
  }

  /**
   * Perform search with the given search term
   * Triggers API call
   */
  private performSearch(searchTerm: string): void {
    const currentSearchQuery = this.searchQuery();
    
    // Only update if search term actually changed
    if (searchTerm !== currentSearchQuery) {
      this.searchQuery.set(searchTerm);
      this.currentPage.set(1);
      
      // Load contacts immediately
      this.loadContacts();
    }
  }

  onSearchSubmit(): void {
    // Optional: Trigger search immediately when Enter is pressed (bypasses debounce)
    const searchTerm = this.searchInput().trim();
    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      this.performSearch(searchTerm);
    }
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearchSubmit();
    }
  }

  toggleViewMode(): void {
    const newViewMode = this.viewMode() === 'list' ? 'card' : 'list';
    this.viewMode.set(newViewMode);
    // Save view type preference for current route
    const routeKey = this.getRouteKey();
    this.preferencesService.setViewType(routeKey, newViewMode);
  }

  showArchiveConfirmation(): void {
    const selectedCount = this.selectedCount();
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Archive Contacts',
      zDescription: `Are you sure you want to archive ${selectedCount} contact${selectedCount > 1 ? 's' : ''}?`,
      zOkText: 'Archive',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.archiveSelectedContacts();
      }
    });
  }

  archiveSelectedContacts(): void {
    // Get selected contact IDs
    const selectedIds = Array.from(this.selectedRows());
    
    // Get contacts to archive
    const contactsToArchive = this.contacts().filter(
      (contact) => selectedIds.includes(contact.id)
    );
    
    // Remove archived contacts from the active list
    const updatedContacts = this.contacts().filter(
      (contact) => !selectedIds.includes(contact.id)
    );
    
    // Add to archived list
    const updatedArchived = [...this.archivedContacts(), ...contactsToArchive];
    
    // Update contacts and archived lists, clear selection
    this.contacts.set(updatedContacts);
    this.archivedContacts.set(updatedArchived);
    this.selectedRows.set(new Set());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getContactName(contact: Contact): string {
    if (contact.isACompany && contact.companyName) {
      return contact.companyName;
    }
    return `${contact.firstName} ${contact.lastName}`.trim() || contact.identifier;
  }

  getContactDisplayName(contact: Contact): string {
    return this.getContactName(contact);
  }

  getContactPhone(contact: Contact): string {
    return contact.phones && contact.phones.length > 0 ? contact.phones[0] : '';
  }

  onViewContact(contact: Contact): void {
    console.log('View contact:', contact);
    // TODO: Implement view functionality
  }

  onEditContact(contact: Contact): void {
    const route = `/contact/${contactTypeToRouteParam(this.contactType())}/${contact.id}`;
    this.router.navigate([route]);
  }

  onDeleteContact(contact: Contact): void {
    const contactName = this.getContactName(contact);
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Contact',
      zDescription: `Are you sure you want to delete ${contactName}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.isDeleting.set(true);
        this.contactService.delete(contact.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            // Reload contacts to get updated list from server
            this.loadContacts();
            // Remove from selection if selected
            const newSet = new Set(this.selectedRows());
            newSet.delete(contact.id);
            this.selectedRows.set(newSet);
            this.isDeleting.set(false);
          },
          error: (error) => {
            console.error('Error deleting contact:', error);
            this.isDeleting.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadContacts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page when page size changes
    // Save page size preference for current route
    const routeKey = this.getRouteKey();
    this.preferencesService.setPageSize(routeKey, size);
    this.loadContacts();
  }

  onSelectionChange(selection: Set<string>): void {
    this.selectedRows.set(selection);
  }

  toggleSelect(contactId: string): void {
    const newSet = new Set(this.selectedRows());
    if (newSet.has(contactId)) {
      newSet.delete(contactId);
    } else {
      newSet.add(contactId);
    }
    this.selectedRows.set(newSet);
  }

  isSelected(contactId: string): boolean {
    return this.selectedRows().has(contactId);
  }

  getInitials(contact: Contact): string {
    const name = this.getContactName(contact);
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAddContactRoute(): string {
    return `/contact/${contactTypeToRouteParam(this.contactType())}/add`;
  }

  getContactTypeLabel(): string {
    return this.contactTypeString();
  }

  /**
   * Get image attachments from a contact
   */
  getImageAttachments(contact: Contact): string[] {
    if (!contact.attachments || contact.attachments.length === 0) {
      return [];
    }
    return contact.attachments
      .filter(att => getFileViewerType(att.url) === 'image')
      .map(att => att.url);
  }

  /**
   * Check if contact has image attachments
   */
  hasImageAttachments(contact: Contact): boolean {
    return this.getImageAttachments(contact).length > 0;
  }

  /**
   * Get first image attachment URL
   */
  getFirstImageAttachment(contact: Contact): string | null {
    const images = this.getImageAttachments(contact);
    return images.length > 0 ? images[0] : null;
  }

  /**
   * Check if a file URL is an image
   */
  isImage(url: string): boolean {
    return getFileViewerType(url) === 'image';
  }
}
