import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { DocumentService, Document, DocumentType } from '@shared/services/document.service';
import { PdfGenerationService } from '@shared/services/pdf-generation.service';
import { ToastService } from '@shared/services/toast.service';

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
    ZardSelectComponent,
    ZardSelectItemComponent,
    TranslateModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-list.component.html',
})
export class DocumentListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly documentService = inject(DocumentService);
  private readonly pdfGenerationService = inject(PdfGenerationService);
  private readonly toastService = inject(ToastService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal('');
  readonly searchInput = signal('');
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10);
  readonly documents = signal<Document[]>([]);
  readonly isLoading = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly isGeneratingPdf = signal(false);

  // Template data
  readonly templates = signal<Document[]>([]);
  readonly isLoadingTemplates = signal(false);
  readonly selectedTemplateType = signal<string>(''); // Empty string means "All"

  readonly hasData = computed(() => {
    const docs = this.documents();
    return docs && Array.isArray(docs) && docs.length > 0;
  });
  readonly hasSelectedDocuments = computed(() => this.selectedRows().size > 0);
  readonly hasTemplates = computed(() => {
    const tmpls = this.templates();
    return tmpls && Array.isArray(tmpls) && tmpls.length > 0;
  });

  readonly filteredTemplates = computed(() => {
    const allTemplates = this.templates();
    const selectedType = this.selectedTemplateType();
    
    if (!selectedType || selectedType === '') {
      return allTemplates;
    }
    
    const typeNum = parseInt(selectedType);
    return allTemplates.filter(template => template.type === typeNum);
  });

  readonly documentTypeOptions = [
    { value: 'lease-agreement', label: 'Lease Agreement', enum: DocumentType.LeaseAgreement },
    { value: 'reservation-agreement', label: 'Reservation Agreement', enum: DocumentType.ReservationAgreement },
    { value: 'lease', label: 'Lease', enum: DocumentType.Lease },
    { value: 'reservationfull', label: 'Reservation Full', enum: DocumentType.ReservationFull },
    { value: 'reservationpart', label: 'Reservation Part', enum: DocumentType.ReservationPart },
    { value: 'fees', label: 'Fees', enum: DocumentType.Fees },
  ];

  readonly templateTypeFilterOptions = [
    { value: '', label: 'All Types' },
    ...this.documentTypeOptions.map(opt => ({ value: opt.enum.toString(), label: opt.label }))
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
    const request = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchQuery() || undefined,
      generate: true, // Only show actual documents (not templates)
    };

    this.documentService.list(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Documents API Response:', response);
          console.log('Response result:', response?.result);
          console.log('Response totalItems:', response?.totalItems);
          console.log('Response totalPages:', response?.totalPages);
          
          const documents = response?.result || [];
          console.log('Setting documents:', documents);
          
          this.documents.set(documents);
          this.totalItems.set(response?.totalItems || 0);
          this.totalPages.set(response?.totalPages || 1);
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.toastService.error('Failed to load documents');
          this.documents.set([]);
          this.totalItems.set(0);
          this.totalPages.set(1);
          this.isLoading.set(false);
          this.cdr.markForCheck();
        }
      });
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

  getDocumentTypeLabel(type: DocumentType | number | null | undefined): string {
    if (type === null || type === undefined) return '';
    const typeNum = typeof type === 'number' ? type : parseInt(type as any);
    const option = this.documentTypeOptions.find(opt => opt.enum === typeNum);
    return option ? option.label : `Type ${typeNum}`;
  }

  getDocumentTypeRouteParam(type: DocumentType | number | null | undefined): string {
    if (type === null || type === undefined) return 'lease-agreement';
    const typeNum = typeof type === 'number' ? type : parseInt(type as any);
    const option = this.documentTypeOptions.find(opt => opt.enum === typeNum);
    return option ? option.value : 'lease-agreement';
  }

  onEdit(document: Document): void {
    const documentType = this.getDocumentTypeRouteParam(document.type);
    this.router.navigate(['/document', documentType, document.id]);
  }

  onDelete(id: string): void {
    this.documentService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Document deleted successfully');
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.toastService.error('Failed to delete document');
        }
      });
  }

  onGeneratePdf(doc: Document): void {
    if (!doc.htmlBody) {
      this.toastService.error('Document has no content to generate PDF');
      return;
    }

    this.isGeneratingPdf.set(true);
    
    this.pdfGenerationService.generatePdfFromHtml(
      doc.htmlBody,
      {
        displayLogo: doc.isLogo,
        displayCache: doc.isCachet,
        placeholderData: doc.example || {},
      }
    ).then((pdfResult) => {
      // Create a blob and download
      const blob = this.base64ToBlob(pdfResult.dataUrl.split(',')[1], 'application/pdf');
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${doc.name || 'document'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      this.toastService.success('PDF generated successfully');
      this.isGeneratingPdf.set(false);
      this.cdr.markForCheck();
    }).catch((error) => {
      console.error('Error generating PDF:', error);
      this.toastService.error('Failed to generate PDF');
      this.isGeneratingPdf.set(false);
      this.cdr.markForCheck();
    });
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
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
    const request = {
      page: 1,
      pageSize: 1000, // Get all templates
      generate: false, // Only show templates
    };

    this.documentService.list(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Templates API Response:', response);
          console.log('Templates result:', response?.result);
          
          const templates = response?.result || [];
          console.log('Setting templates:', templates);
          
          this.templates.set(templates);
          this.isLoadingTemplates.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading templates:', error);
          this.toastService.error('Failed to load templates');
          this.templates.set([]);
          this.isLoadingTemplates.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  getCategoryFromType(type: DocumentType | number | null | undefined): string {
    if (type === null || type === undefined) return 'Document';
    const typeNum = typeof type === 'number' ? type : parseInt(type as any);
    if (typeNum === DocumentType.LeaseAgreement || typeNum === DocumentType.ReservationAgreement || typeNum === DocumentType.Lease) {
      return 'Tenant agreement';
    }
    if (typeNum === DocumentType.ReservationFull || typeNum === DocumentType.ReservationPart) {
      return 'Reservation';
    }
    if (typeNum === DocumentType.Fees) {
      return 'Tenant notice';
    }
    return 'Document';
  }

  onCreateFromTemplate(template: Document): void {
    const documentType = this.getDocumentTypeRouteParam(template.type);
    this.router.navigate(['/document/add', documentType]);
  }

  onEditTemplate(template: Document): void {
    const documentType = this.getDocumentTypeRouteParam(template.type);
    this.router.navigate(['/document', documentType, template.id]);
  }

  onShowExample(template: Document): void {
    // Generate PDF preview for template
    this.onGeneratePdf(template);
  }

  onTemplateTypeFilterChange(value: string): void {
    this.selectedTemplateType.set(value);
  }
}

