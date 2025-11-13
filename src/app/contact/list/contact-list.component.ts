import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef, TemplateRef, viewChild } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
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

export type ContactType = 'tenants' | 'owners' | 'services';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  priority: 'high' | 'medium' | 'low';
  category: string;
  type: ContactType;
}

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
  private readonly destroy$ = new Subject<void>();

  readonly contactType = signal<ContactType>('tenants');
  readonly searchQuery = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly showArchived = signal(false);
  readonly archivedContacts = signal<Contact[]>([]);

  toggleShowArchived(value: boolean): void {
    this.showArchived.set(value);
    // Clear selection and reset to first page when switching views
    this.selectedRows.set(new Set());
    this.currentPage.set(1);
  }

  // Sample contact data
  readonly allContacts = signal<Contact[]>([
    {
      id: 'CONTACT-8782',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      company: 'Acme Corp',
      status: 'active',
      priority: 'medium',
      category: 'Client',
      type: 'tenants',
    },
    {
      id: 'CONTACT-7878',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 234 567 8901',
      company: 'Tech Solutions',
      status: 'pending',
      priority: 'medium',
      category: 'Lead',
      type: 'owners',
    },
    {
      id: 'CONTACT-7839',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1 234 567 8902',
      company: 'Global Inc',
      status: 'active',
      priority: 'high',
      category: 'Partner',
      type: 'services',
    },
    {
      id: 'CONTACT-5562',
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      phone: '+1 234 567 8903',
      company: 'Startup Co',
      status: 'inactive',
      priority: 'medium',
      category: 'Vendor',
      type: 'tenants',
    },
    {
      id: 'CONTACT-8686',
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      phone: '+1 234 567 8904',
      company: 'Design Studio',
      status: 'active',
      priority: 'low',
      category: 'Client',
      type: 'owners',
    },
    {
      id: 'CONTACT-1280',
      name: 'Diana Prince',
      email: 'diana.prince@example.com',
      phone: '+1 234 567 8905',
      company: 'Enterprise Ltd',
      status: 'active',
      priority: 'high',
      category: 'Client',
      type: 'tenants',
    },
    {
      id: 'CONTACT-7262',
      name: 'Edward Norton',
      email: 'edward.norton@example.com',
      phone: '+1 234 567 8906',
      company: 'Media Group',
      status: 'pending',
      priority: 'medium',
      category: 'Lead',
      type: 'services',
    },
    {
      id: 'CONTACT-1138',
      name: 'Fiona Apple',
      email: 'fiona.apple@example.com',
      phone: '+1 234 567 8907',
      company: 'Music Corp',
      status: 'active',
      priority: 'low',
      category: 'Partner',
      type: 'owners',
    },
    {
      id: 'CONTACT-7184',
      name: 'George Lucas',
      email: 'george.lucas@example.com',
      phone: '+1 234 567 8908',
      company: 'Film Studios',
      status: 'inactive',
      priority: 'medium',
      category: 'Vendor',
      type: 'tenants',
    },
    {
      id: 'CONTACT-5160',
      name: 'Helen Mirren',
      email: 'helen.mirren@example.com',
      phone: '+1 234 567 8909',
      company: 'Theater Co',
      status: 'active',
      priority: 'high',
      category: 'Client',
      type: 'services',
    },
  ]);

  readonly contacts = computed(() => {
    const type = this.contactType();
    return this.allContacts().filter(contact => contact.type === type);
  });

  readonly filteredContacts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const contactsToShow = this.showArchived() ? this.archivedContacts() : this.contacts();
    
    if (!query) return contactsToShow;
    return contactsToShow.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company.toLowerCase().includes(query) ||
        contact.id.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    // Get contact type from route params
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const type = params['type'] as ContactType;
      if (type && ['tenants', 'owners', 'services'].includes(type)) {
        this.contactType.set(type);
      } else {
        this.contactType.set('tenants');
      }
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

  readonly totalPages = computed(() => {
    const total = this.filteredContacts().length;
    const size = this.pageSize();
    return Math.ceil(total / size);
  });

  readonly hasData = computed(() => {
    return this.filteredContacts().length > 0;
  });

  // Template references for custom cells
  readonly contactIdCell = viewChild<TemplateRef<any>>('contactIdCell');
  readonly nameCell = viewChild<TemplateRef<any>>('nameCell');
  readonly typeCell = viewChild<TemplateRef<any>>('typeCell');
  readonly statusCell = viewChild<TemplateRef<any>>('statusCell');
  readonly priorityCell = viewChild<TemplateRef<any>>('priorityCell');
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
      key: 'status',
      label: 'Status',
      sortable: true,
      cellTemplate: this.statusCell(),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      cellTemplate: this.priorityCell(),
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
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'list' ? 'card' : 'list');
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
    const updatedAllContacts = this.allContacts().filter(
      (contact) => !selectedIds.includes(contact.id)
    );
    
    // Add to archived list
    const updatedArchived = [...this.archivedContacts(), ...contactsToArchive];
    
    // Update contacts and archived lists, clear selection
    this.allContacts.set(updatedAllContacts);
    this.archivedContacts.set(updatedArchived);
    this.selectedRows.set(new Set());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusIcon(status: Contact['status']): 'circle-check' | 'circle' | 'circle-x' {
    switch (status) {
      case 'active':
        return 'circle-check';
      case 'pending':
        return 'circle';
      case 'inactive':
        return 'circle-x';
      default:
        return 'circle';
    }
  }

  getPriorityIcon(priority: Contact['priority']): 'chevron-up' | 'arrow-right' | 'chevron-down' {
    switch (priority) {
      case 'high':
        return 'chevron-up';
      case 'medium':
        return 'arrow-right';
      case 'low':
        return 'chevron-down';
      default:
        return 'arrow-right';
    }
  }

  getStatusBadgeType(status: Contact['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'inactive':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  getPriorityBadgeType(priority: Contact['priority']): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  }

  onViewContact(contact: Contact): void {
    console.log('View contact:', contact);
    // TODO: Implement view functionality
  }

  onEditContact(contact: Contact): void {
    console.log('Edit contact:', contact);
    // TODO: Implement edit functionality
  }

  onDeleteContact(contact: Contact): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Contact',
      zDescription: `Are you sure you want to delete ${contact.name}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        // Remove contact from the list
        const updatedContacts = this.allContacts().filter((c) => c.id !== contact.id);
        this.allContacts.set(updatedContacts);
        
        // Remove from selection if selected
        const newSet = new Set(this.selectedRows());
        newSet.delete(contact.id);
        this.selectedRows.set(newSet);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page when page size changes
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

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAddContactRoute(): string {
    const type = this.contactType();
    return `/contact/${type}/add`;
  }

  getContactTypeLabel(): string {
    const type = this.contactType();
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
