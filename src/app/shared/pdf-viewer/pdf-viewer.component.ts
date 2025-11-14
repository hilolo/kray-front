import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'z-pdf-viewer',
  exportAs: 'zPdfViewer',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardPdfViewerComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly pdfUrl = input<string>('');
  readonly pdfName = input<string>('');
  readonly fileSize = input<number>(0);
  readonly isOpen = input<boolean>(false);

  readonly close = output<void>();

  // Safe URL for iframe
  protected readonly safePdfUrl = computed<SafeResourceUrl>(() => {
    const url = this.pdfUrl();
    if (!url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    
    // Use direct PDF embed
    const finalUrl = url + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH';
    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  });

  protected readonly isLoading = computed(() => false);
  protected readonly loadError = computed(() => false);

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

  /**
   * Close the PDF viewer
   */
  closeViewer(): void {
    this.close.emit();
  }

  /**
   * Download the PDF
   */
  downloadPdf(): void {
    if (!this.pdfUrl()) {
      return;
    }

    // Fetch the PDF and trigger download
    fetch(this.pdfUrl())
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.pdfName() || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading PDF:', error);
        // Fallback: try direct download
        const link = document.createElement('a');
        link.href = this.pdfUrl();
        link.download = this.pdfName() || 'document.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }
}
