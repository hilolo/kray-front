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
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Contact, ContactTypeString } from '@shared/models/contact/contact.model';
import { ContactType, routeParamToContactType, contactTypeToString, contactTypeToRouteParam } from '@shared/models/contact/contact.model';
import { ContactService } from '@shared/services/contact.service';
import { getFileViewerType } from '@shared/utils/file-type.util';
import { ContactListPreferencesService } from '@shared/services/contact-list-preferences.service';

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
  private readonly preferencesService = inject(ContactListPreferencesService);
  private readonly destroy$ = new Subject<void>();

  readonly contactType = signal<ContactType>(ContactType.Tenant);
  readonly contactTypeString = signal<ContactTypeString>('Tenant');
  readonly searchQuery = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly showArchived = signal(false);
  readonly archivedContacts = signal<Contact[]>([]);
  readonly contacts = signal<Contact[]>([]);
  readonly isLoading = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);

  toggleShowArchived(value: boolean): void {
    this.showArchived.set(value);
    // Clear selection and reset to first page when switching views
    this.selectedRows.set(new Set());
    this.currentPage.set(1);
    this.loadContacts();
  }

  readonly filteredContacts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const contactsToShow = this.showArchived() ? this.archivedContacts() : this.contacts();
    
    if (!query) return contactsToShow;
    return contactsToShow.filter(
      (contact) =>
        this.getContactName(contact).toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.companyName.toLowerCase().includes(query) ||
        contact.identifier.toLowerCase().includes(query) ||
        contact.id.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    // Get contact type from route path
    // Routes: /contact/tenants, /contact/owners, /contact/services
    // The route config path is 'tenants', 'owners', or 'services'
    const typeParam = this.route.snapshot.routeConfig?.path || 'tenants';
    const type = routeParamToContactType(typeParam);
    this.contactType.set(type);
    this.contactTypeString.set(contactTypeToString(type));
    
    // Load view type preference for this contact type
    const savedViewType = this.preferencesService.getViewType(type);
    this.viewMode.set(savedViewType);
    
    this.loadContacts();

    // Also listen to route changes in case of navigation
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const updatedTypeParam = this.route.snapshot.routeConfig?.path || 'tenants';
      const updatedType = routeParamToContactType(updatedTypeParam);
      this.contactType.set(updatedType);
      this.contactTypeString.set(contactTypeToString(updatedType));
      
      // Load view type preference for the new contact type
      const newSavedViewType = this.preferencesService.getViewType(updatedType);
      this.viewMode.set(newSavedViewType);
      
      this.loadContacts();
    });
  }

  loadContacts(): void {
    if (this.showArchived()) {
      // For archived contacts, we might need a different endpoint
      // For now, just return empty
      return;
    }

    this.isLoading.set(true);
    this.contactService.list({
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      type: this.contactType(),
    }).pipe(takeUntil(this.destroy$)).subscribe({
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

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    // Note: Search is done client-side on filteredContacts
    // If you want server-side search, call loadContacts() here
  }

  toggleViewMode(): void {
    const newViewMode = this.viewMode() === 'list' ? 'card' : 'list';
    this.viewMode.set(newViewMode);
    // Save view type preference for current contact type
    this.preferencesService.setViewType(this.contactType(), newViewMode);
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
        // Remove contact from the list
        const updatedContacts = this.contacts().filter((c) => c.id !== contact.id);
        this.contacts.set(updatedContacts);
        
        // Remove from selection if selected
        const newSet = new Set(this.selectedRows());
        newSet.delete(contact.id);
        this.selectedRows.set(newSet);
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
