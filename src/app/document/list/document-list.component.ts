import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDatatablePaginationComponent } from '@shared/components/datatable/datatable-pagination.component';
import { ZardEmptyComponent } from '@shared/components/empty/empty.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardTabGroupComponent, ZardTabComponent } from '@shared/components/tabs/tabs.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardDatatableComponent,
    ZardDatatablePaginationComponent,
    ZardEmptyComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardTabGroupComponent,
    ZardTabComponent,
    ZardCardComponent,
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-list.component.html',
})
export class DocumentListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal('');
  readonly searchInput = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10);
  readonly documents = signal<any[]>([]);
  readonly isLoading = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);

  // Template data
  readonly templates = signal<any[]>([]);
  readonly isLoadingTemplates = signal(false);

  readonly hasData = computed(() => this.documents().length > 0);
  readonly hasSelectedDocuments = computed(() => this.selectedRows().size > 0);
  readonly hasTemplates = computed(() => this.templates().length > 0);

  readonly documentTypeOptions = [
    { value: 'lease-agreement', label: 'Lease Agreement' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'lease', label: 'Lease' },
    { value: 'reservationfull', label: 'Reservation Full' },
    { value: 'reservationpart', label: 'Reservation Part' },
    { value: 'fees', label: 'Fees' },
  ];

  readonly columns: DatatableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
    },
  ];

  ngOnInit(): void {
    // Set up debounced search subscription
    this.searchInputSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        const trimmedValue = value.trim();
        if (trimmedValue.length >= 3) {
          this.performSearch(trimmedValue);
        } else if (trimmedValue.length === 0 && this.searchQuery()) {
          this.performSearch('');
        } else if (trimmedValue.length > 0 && trimmedValue.length < 3) {
          this.searchQuery.set('');
          this.currentPage.set(1);
          this.loadDocuments();
        }
      });

    this.loadDocuments();
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    // TODO: Implement actual API call
    setTimeout(() => {
      this.documents.set([]);
      this.totalItems.set(0);
      this.totalPages.set(1);
      this.isLoading.set(false);
    }, 500);
  }

  performSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadDocuments();
  }

  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    this.searchInputSubject.next(value);
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = (event.target as HTMLInputElement).value;
      this.performSearch(value.trim());
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadDocuments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadDocuments();
  }

  onRowSelect(selected: Set<string>): void {
    this.selectedRows.set(selected);
  }

  onAddDocument(type: string): void {
    this.router.navigate(['/document/add', type]);
  }

  getDocumentTypeLabel(typeValue: string | null | undefined): string {
    if (!typeValue) return '';
    const option = this.documentTypeOptions.find(opt => opt.value === typeValue);
    return option ? option.label : typeValue;
  }

  onEdit(id: string, type?: string): void {
    // If type is not provided, try to get it from the document
    // For now, we'll use a default type if not available
    const documentType = type || 'lease-agreement'; // Default fallback
    this.router.navigate(['/document', documentType, id]);
  }

  onDelete(id: string): void {
    // TODO: Implement delete
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  }

  loadTemplates(): void {
    this.isLoadingTemplates.set(true);
    // TODO: Implement actual API call for templates
    setTimeout(() => {
      // Mock template data based on document types
      const mockTemplates = this.documentTypeOptions.map(option => ({
        id: `template-${option.value}`,
        type: option.value,
        name: `${option.label} Template`,
        category: this.getCategoryFromType(option.value),
        createdAt: new Date().toISOString(),
      }));
      this.templates.set(mockTemplates);
      this.isLoadingTemplates.set(false);
    }, 300);
  }

  getCategoryFromType(type: string): string {
    if (type.includes('agreement')) return 'Tenant agreement';
    if (type.includes('lease')) return 'Tenant agreement';
    if (type.includes('reservation')) return 'Tenant agreement';
    if (type.includes('fees')) return 'Tenant notice';
    return 'Document';
  }

  onCreateFromTemplate(template: any): void {
    this.router.navigate(['/document/add', template.type]);
  }

  onEditTemplate(template: any): void {
    // TODO: Navigate to template editor
    console.log('Edit template:', template);
  }

  onShowExample(template: any): void {
    // TODO: Show template example/preview
    // This could open a modal or navigate to a preview page
    console.log('Show example for template:', template);
    // For now, navigate to create document from template as an example
    this.router.navigate(['/document/add', template.type]);
  }
}

