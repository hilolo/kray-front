import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import type { Bank } from '@shared/models/bank/bank.model';
import type { BankListRequest } from '@shared/models/bank/bank-list-request.model';
import { BankService } from '@shared/services/bank.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { ContactService } from '@shared/services/contact.service';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { EditBankComponent } from '../edit/edit-bank.component';

@Component({
  selector: 'app-bank-list',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    ZardDatatablePaginationComponent,
    ZardComboboxComponent,
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-list.component.html',
})
export class BankListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bankService = inject(BankService);
  private readonly contactService = inject(ContactService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal(''); // Actual search term sent to server
  readonly searchInput = signal(''); // Input field value (for two-way binding)
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10); // Will be initialized from preferences in ngOnInit
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly banks = signal<Bank[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly contacts = signal<Contact[]>([]);
  readonly contactOptions = signal<ZardComboboxOption[]>([]);
  readonly selectedContactId = signal<string | null>(null);
  readonly isLoadingContacts = signal(false);
  
  // Reference to contact combobox for clearing
  readonly contactComboboxRef = viewChild<ZardComboboxComponent>('contactCombobox');

  // Template references for custom cells
  readonly bankIdCell = viewChild<TemplateRef<any>>('bankIdCell');
  readonly bankNameCell = viewChild<TemplateRef<any>>('bankNameCell');
  readonly contactCell = viewChild<TemplateRef<any>>('contactCell');
  readonly ribCell = viewChild<TemplateRef<any>>('ribCell');
  readonly ibanCell = viewChild<TemplateRef<any>>('ibanCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Bank>[]>(() => [
    {
      key: 'id',
      label: 'Bank',
      cellTemplate: this.bankIdCell(),
    },
    {
      key: 'bankName',
      label: 'Bank Name',
      sortable: true,
      cellTemplate: this.bankNameCell(),
    },
    {
      key: 'contact',
      label: 'Contact',
      sortable: true,
      cellTemplate: this.contactCell(),
    },
    {
      key: 'rib',
      label: 'RIB',
      sortable: true,
      cellTemplate: this.ribCell(),
    },
    {
      key: 'iban',
      label: 'IBAN',
      sortable: true,
      cellTemplate: this.ibanCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '50px',
      cellTemplate: this.actionsCell(),
    },
  ]);

  readonly filteredBanks = computed(() => {
    return this.banks();
  });

  readonly emptyMessage = computed(() => {
    if (this.searchQuery()) {
      return this.translateService.instant('bank.list.emptySearch');
    }
    return this.translateService.instant('bank.list.empty');
  });

  readonly hasData = computed(() => {
    return this.filteredBanks().length > 0;
  });

  readonly selectedCount = computed(() => {
    return this.selectedRows().size;
  });

  readonly hasSelectedBanks = computed(() => {
    return this.selectedCount() > 0;
  });

  readonly showResetButton = computed(() => {
    return (this.searchQuery() && this.searchQuery().trim() !== '') || 
           this.selectedContactId() !== null;
  });

  ngOnInit(): void {
    // Get route key for preferences (e.g., 'bank/list')
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
          this.loadBanks();
        }
      });
    
    this.loadBanks();
    this.loadContacts();
  }

  /**
   * Get the route key for preferences storage
   */
  private getRouteKey(): string {
    return 'bank/list';
  }

  loadBanks(): void {
    this.isLoading.set(true);
    const request: BankListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      ...(this.searchQuery() && this.searchQuery().trim() ? { searchQuery: this.searchQuery().trim() } : {}),
      ...(this.selectedContactId() ? { contactId: this.selectedContactId()! } : {}),
    };
    
    this.bankService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.banks.set(response.result);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
        // Ensure selection is cleared after data loads (forces datatable to reset)
        this.selectedRows.set(new Set());
      },
      error: (error) => {
        console.error('Error loading banks:', error);
        this.isLoading.set(false);
        // Clear selection on error too
        this.selectedRows.set(new Set());
      },
    });
  }

  loadContacts(): void {
    this.isLoadingContacts.set(true);
    const request = {
      currentPage: 1,
      pageSize: 1000, // Large page size to get all contacts
      ignore: false,
      type: ContactType.Owner, // Default to Owner, but could be extended to load all types
    };
    
    this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.contacts.set(response.result);
        // Convert contacts to combobox options
        const options: ZardComboboxOption[] = response.result.map(contact => ({
          value: contact.id,
          label: this.getContactDisplayName(contact),
        }));
        this.contactOptions.set(options);
        this.isLoadingContacts.set(false);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoadingContacts.set(false);
      },
    });
  }

  getContactDisplayName(contact: Contact): string {
    let name = '';
    if (contact.isACompany) {
      name = contact.companyName || 'Unnamed Company';
    } else {
      const firstName = contact.firstName || '';
      const lastName = contact.lastName || '';
      if (firstName || lastName) {
        name = `${firstName} ${lastName}`.trim();
      } else {
        name = 'Unnamed Contact';
      }
    }
    
    // Add identifier if available
    const parts: string[] = [];
    if (name) parts.push(name);
    if (contact.identifier) parts.push(contact.identifier);
    
    return parts.length > 0 ? parts.join(' - ') : 'Unnamed Contact';
  }

  onContactChange(contactId: string | null): void {
    this.selectedContactId.set(contactId);
    this.currentPage.set(1);
    this.loadBanks();
  }

  onResetFilters(): void {
    // Clear search
    this.searchInput.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    
    // Clear contact selection
    this.selectedContactId.set(null);
    
    // Clear combobox internal value using ControlValueAccessor
    setTimeout(() => {
      const combobox = this.contactComboboxRef();
      if (combobox) {
        // Clear internal value - writeValue is part of ControlValueAccessor interface
        (combobox as any).writeValue(null);
      }
    }, 0);
    
    // Reload banks
    this.loadBanks();
  }

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
      
      // Load banks immediately
      this.loadBanks();
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

  onEditBank(bank: Bank): void {
    const dialogRef = this.dialogService.create({
      zContent: EditBankComponent,
      zTitle: 'Edit Bank',
      zWidth: '800px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: { bankId: bank.id },
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        // Reload banks after editing
        this.loadBanks();
      }
    });
  }

  onAddBank(): void {
    const dialogRef = this.dialogService.create({
      zContent: EditBankComponent,
      zTitle: 'Add Bank',
      zWidth: '800px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: {},
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        // Reload banks after adding
        this.loadBanks();
      }
    });
  }

  onDeleteBank(bank: Bank): void {
    const bankName = bank.bankName || 'this bank';
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Bank',
      zDescription: `Are you sure you want to delete ${bankName}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.isDeleting.set(true);
        this.bankService.delete(bank.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            // Reload banks to get updated list from server
            this.loadBanks();
            // Remove from selection if selected
            const newSet = new Set(this.selectedRows());
            newSet.delete(bank.id);
            this.selectedRows.set(newSet);
            this.isDeleting.set(false);
          },
          error: (error) => {
            console.error('Error deleting bank:', error);
            this.isDeleting.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadBanks();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page when page size changes
    // Save page size preference for current route
    const routeKey = this.getRouteKey();
    this.preferencesService.setPageSize(routeKey, size);
    this.loadBanks();
  }

  onSelectionChange(selection: Set<string>): void {
    this.selectedRows.set(selection);
  }

  toggleSelect(bankId: string): void {
    const newSet = new Set(this.selectedRows());
    if (newSet.has(bankId)) {
      newSet.delete(bankId);
    } else {
      newSet.add(bankId);
    }
    this.selectedRows.set(newSet);
  }

  isSelected(bankId: string): boolean {
    return this.selectedRows().has(bankId);
  }

  getBankDisplayName(bank: Bank): string {
    return bank.bankName || 'Unnamed Bank';
  }

  getContactName(bank: Bank): string {
    if (bank.contact) {
      return this.getContactDisplayName(bank.contact);
    }
    return 'Unknown Contact';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

