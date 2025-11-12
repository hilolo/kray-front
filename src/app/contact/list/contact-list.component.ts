import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { ZardPageComponent } from '../../page/page.component';
import { ZardTableModule } from '@shared/components/table/table.module';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardPaginationComponent } from '@shared/components/pagination/pagination.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import type { ZardIcon } from '@shared/components/icon/icons';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardEmptyComponent } from '@shared/components/empty/empty.component';
import { Subject, takeUntil } from 'rxjs';

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
    ZardPageComponent,
    ZardTableModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardCheckboxComponent,
    ZardPaginationComponent,
    ZardIconComponent,
    ZardCardComponent,
    ZardSwitchComponent,
    ZardEmptyComponent,
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent implements OnDestroy, AfterViewInit {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();
  private readonly elementRef = inject(ElementRef);

  @ViewChild('paginationContainer', { static: false }) paginationContainer?: ElementRef<HTMLElement>;
  @ViewChild('contentContainer', { static: false }) contentContainer?: ElementRef<HTMLElement>;

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

  readonly paginatedContacts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredContacts().slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredContacts().length / this.pageSize());
  });

  readonly selectedCount = computed(() => {
    return this.selectedRows().size;
  });

  readonly hasSelectedContacts = computed(() => {
    return this.selectedCount() > 0;
  });

  readonly allSelected = computed(() => {
    return (
      this.paginatedContacts().length > 0 &&
      this.paginatedContacts().every((contact) => this.selectedRows().has(contact.id))
    );
  });

  readonly hasNoData = computed(() => {
    return this.filteredContacts().length === 0;
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

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  toggleSelectAll(): void {
    const newValue = !this.allSelected();
    const newSet = new Set(this.selectedRows());
    if (newValue) {
      this.paginatedContacts().forEach((contact) => {
        newSet.add(contact.id);
      });
    } else {
      this.paginatedContacts().forEach((contact) => {
        newSet.delete(contact.id);
      });
    }
    this.selectedRows.set(newSet);
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

  onPageChange(page: number): void {
    this.currentPage.set(page);
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
    
    // Reset to first page if current page is empty
    if (this.paginatedContacts().length === 0 && this.currentPage() > 1) {
      this.currentPage.set(1);
    }
  }

  ngAfterViewInit(): void {
    // Log layout dimensions for debugging
    setTimeout(() => {
      const hostElement = this.elementRef.nativeElement as HTMLElement;
      const paginationEl = this.paginationContainer?.nativeElement;
      const contentEl = this.contentContainer?.nativeElement;
      
      console.log('=== Contact List Layout Debug ===');
      console.log('Host element:', {
        height: hostElement.offsetHeight,
        scrollHeight: hostElement.scrollHeight,
        clientHeight: hostElement.clientHeight,
        computedStyle: window.getComputedStyle(hostElement).height,
      });
      
      if (contentEl) {
        console.log('Content container:', {
          height: contentEl.offsetHeight,
          scrollHeight: contentEl.scrollHeight,
          clientHeight: contentEl.clientHeight,
          computedStyle: window.getComputedStyle(contentEl).height,
          paddingBottom: window.getComputedStyle(contentEl).paddingBottom,
        });
      }
      
      if (paginationEl) {
        console.log('Pagination container:', {
          height: paginationEl.offsetHeight,
          offsetTop: paginationEl.offsetTop,
          offsetParent: paginationEl.offsetParent,
          position: window.getComputedStyle(paginationEl).position,
          bottom: window.getComputedStyle(paginationEl).bottom,
          zIndex: window.getComputedStyle(paginationEl).zIndex,
        });
      }
      
      // Check parent chain
      let current: HTMLElement | null = hostElement.parentElement;
      let level = 0;
      while (current && level < 5) {
        console.log(`Parent level ${level}:`, {
          tag: current.tagName,
          class: current.className,
          height: current.offsetHeight,
          scrollHeight: current.scrollHeight,
          overflow: window.getComputedStyle(current).overflow,
          position: window.getComputedStyle(current).position,
        });
        current = current.parentElement;
        level++;
      }
      console.log('=== End Debug ===');
    }, 100);
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
}

