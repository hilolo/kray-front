import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, inject, input, OnDestroy, output, signal, ViewEncapsulation } from '@angular/core';
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
export class ZardPdfViewerComponent implements OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly pdfUrl = input<string>('');
  readonly pdfName = input<string>('');
  readonly fileSize = input<number>(0);
  readonly isOpen = input<boolean>(false);

  readonly close = output<void>();

  // Safe URL for iframe
  protected readonly safePdfUrl = signal<SafeResourceUrl>(this.sanitizer.bypassSecurityTrustResourceUrl(''));
  protected readonly isLoading = signal<boolean>(false);
  protected readonly loadError = signal<boolean>(false);
  
  private objectUrl: string | null = null;

  constructor() {
    // Effect to update PDF URL when pdfUrl input changes
    effect(() => {
      const url = this.pdfUrl();
      this.updatePdfUrl(url);
    });
  }

  ngOnDestroy(): void {
    // Clean up object URL on component destruction
    this.cleanupObjectUrl();
  }

  // Formatted file size
  protected readonly formattedFileSize = computed(() => {
    const size = this.fileSize();
    if (!size || size === 0 || isNaN(size) || size < 0) {
      return '';
    }
    
    const mb = 1024 * 1024;
    const sizeInMB = size / mb;
    
    // If the result is 0 or very small, return empty string
    if (sizeInMB <= 0) {
      return '';
    }
    
    return sizeInMB.toFixed(2);
  });

  /**
   * Clean up object URL
   */
  private cleanupObjectUrl(): void {
    if (this.objectUrl) {
      window.URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  /**
   * Update/Reload PDF URL for safe display in iframe
   * Fetches the PDF as a blob to work around backend content-type issues
   */
  updatePdfUrl(url?: string): void {
    const targetUrl = url ?? this.pdfUrl();
    // Clean up previous object URL
    this.cleanupObjectUrl();

    if (!targetUrl) {
      this.safePdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(''));
      this.isLoading.set(false);
      this.loadError.set(false);
      this.cdr.markForCheck();
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(false);
    this.cdr.markForCheck();

    // Fetch the PDF as a blob to override the incorrect content-type from the server
    // This fixes the issue where backend sets response-content-type to image types
    fetch(targetUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Create a new blob with the correct content type
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        
        // Create an object URL for the blob
        this.objectUrl = window.URL.createObjectURL(pdfBlob);
        
        // Use the object URL in the iframe
        this.safePdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl));
        this.isLoading.set(false);
        this.loadError.set(false);
        this.cdr.markForCheck();
      })
      .catch(error => {
        console.error('PDF Viewer - Error loading PDF:', error);
        this.loadError.set(true);
        this.isLoading.set(false);
        this.safePdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(''));
        this.cdr.markForCheck();
      });
  }

  /**
   * Close the PDF viewer
   */
  closeViewer(): void {
    // Clean up object URL when closing
    this.cleanupObjectUrl();
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
