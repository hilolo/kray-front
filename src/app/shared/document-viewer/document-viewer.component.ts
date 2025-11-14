import { ChangeDetectionStrategy, Component, computed, inject, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { getDocumentType } from '@shared/utils/file-type.util';

@Component({
  selector: 'z-document-viewer',
  exportAs: 'zDocumentViewer',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardDocumentViewerComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly documentType = input<'doc' | 'xl' | 'ppt' | 'pdf'>();
  readonly documentUrl = input<string>('');
  readonly documentName = input<string>('');
  readonly originalDocumentUrl = input<string>('');
  readonly fileSize = input<number>(0);
  readonly isOpen = input<boolean>(false);

  readonly close = output<void>();

  // Safe URL for iframe
  protected readonly urlSafe = computed<SafeResourceUrl>(() => {
    const url = this.documentUrl();
    const type = this.documentType() || (url ? getDocumentType(url) : 'doc');
    
    if (!url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    let finalUrl: string;

    // For PDF files - use direct embed
    if (type === 'pdf' || url.toLowerCase().endsWith('.pdf')) {
      finalUrl = url + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH';
    } else {
      // For Office documents, use Office Online viewer
      finalUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  });

  // Formatted file size
  protected readonly formattedFileSize = computed(() => {
    const size = this.fileSize();
    if (!size || size === 0) {
      return '';
    }
    
    const mb = 1024 * 1024;
    const sizeInMB = size / mb;
    
    return sizeInMB.toFixed(2) + ' MB';
  });

  // Document type icon
  protected readonly documentIcon = computed(() => {
    const type = this.documentType() || (this.documentUrl() ? getDocumentType(this.documentUrl()) : 'doc');
    switch (type) {
      case 'pdf':
        return 'file-text';
      case 'xl':
        return 'file-spreadsheet';
      case 'ppt':
        return 'file-text';
      case 'doc':
      default:
        return 'file-text';
    }
  });

  // Document type label
  protected readonly documentLabel = computed(() => {
    const type = this.documentType() || (this.documentUrl() ? getDocumentType(this.documentUrl()) : 'doc');
    switch (type) {
      case 'pdf':
        return 'PDF Document';
      case 'xl':
        return 'Excel Spreadsheet';
      case 'ppt':
        return 'PowerPoint Presentation';
      case 'doc':
      default:
        return 'Word Document';
    }
  });

  // Display name
  protected readonly displayName = computed(() => {
    return this.documentName() || this.documentLabel();
  });

  /**
   * Close the document viewer
   */
  closeViewer(): void {
    this.close.emit();
  }

  /**
   * Download the document
   */
  downloadDocument(): void {
    const urlToDownload = this.originalDocumentUrl() || this.documentUrl();
    
    if (!urlToDownload) {
      return;
    }

    // Fetch the document and trigger download
    fetch(urlToDownload)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.documentName() || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading document:', error);
        // Fallback: try direct download
        const link = document.createElement('a');
        link.href = urlToDownload;
        link.download = this.documentName() || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }
}
