import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, signal, ViewChild, ViewContainerRef, TemplateRef, viewChild } from '@angular/core';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import type { ZardIcon } from '@shared/components/icon/icons';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  priority: 'high' | 'medium' | 'low';
  category: string;
}

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardCheckboxComponent,
    ZardIconComponent,
    ZardSwitchComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent implements OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();

  readonly searchQuery = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
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
  readonly contacts = signal<Contact[]>([
    {
      id: 'CONTACT-8782',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      company: 'Acme Corp',
      status: 'active',
      priority: 'medium',
      category: 'Client',
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
    },
  ]);

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

  // Template references for custom cells
  readonly contactIdCell = viewChild<TemplateRef<any>>('contactIdCell');
  readonly nameCell = viewChild<TemplateRef<any>>('nameCell');
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
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
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
}
