import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector       : 'app-pdf-viewer',
    templateUrl    : './pdf-viewer.component.html',
    styleUrls      : ['./pdf-viewer.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
})
export class PdfViewerComponent implements OnInit, OnChanges
{
    @Input() pdfUrl: string = '';
    @Input() pdfName: string = '';
    @Input() fileSize: number = 0; // File size in bytes
    @Input() isOpen: boolean = false;
    @Output() close = new EventEmitter<void>();

    // Safe URL for iframe
    safePdfUrl: SafeResourceUrl;
    isLoading: boolean = false;
    loadError: boolean = false;
    private objectUrl: string | null = null;

    /**
     * Constructor
     */
    constructor(
        private sanitizer: DomSanitizer,
        private _changeDetectorRef: ChangeDetectorRef
    ) 
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.updatePdfUrl();
    }

    /**
     * On changes
     */
    ngOnChanges(changes: SimpleChanges): void
    {
        if (changes['pdfUrl'] && !changes['pdfUrl'].firstChange) {
            this.updatePdfUrl();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get formatted file size (always in MB)
     */
    get formattedFileSize(): string
    {
        if (!this.fileSize || this.fileSize === 0) {
            return '';
        }
        
        const mb = 1024 * 1024;
        const sizeInMB = this.fileSize / mb;
        
        return sizeInMB.toFixed(2) + ' MB';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the PDF viewer
     */
    closeViewer(): void
    {
        // Clean up object URL if it exists
        if (this.objectUrl) {
            window.URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = null;
        }
        this.close.emit();
    }

    /**
     * Download the PDF
     */
    downloadPdf(): void
    {
        if (!this.pdfUrl) {
            return;
        }

        // Fetch the PDF and trigger download
        fetch(this.pdfUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = this.pdfName || 'document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error downloading PDF:', error);
                // Fallback: try direct download
                const link = document.createElement('a');
                link.href = this.pdfUrl;
                link.download = this.pdfName || 'document.pdf';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }

    /**
     * Update/Reload PDF URL for safe display in iframe
     * Fetches the PDF as a blob to work around backend content-type issues
     */
    updatePdfUrl(): void
    {
        if (!this.pdfUrl) {
            this.safePdfUrl = '';
            this._changeDetectorRef.markForCheck();
            return;
        }

        // Clean up previous object URL
        if (this.objectUrl) {
            window.URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = null;
        }

        this.isLoading = true;
        this.loadError = false;
        this._changeDetectorRef.markForCheck();

        // Fetch the PDF as a blob to override the incorrect content-type from the server
        // This fixes the issue where backend sets response-content-type to image types
        fetch(this.pdfUrl)
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
                this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            })
            .catch(error => {
                console.error('PDF Viewer - Error loading PDF:', error);
                this.loadError = true;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            });
    }
}

