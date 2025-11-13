import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
    selector       : 'app-document-viewer',
    templateUrl    : './document-viewer.component.html',
    styleUrls      : ['./document-viewer.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule
    ],
})
export class DocumentViewerComponent implements OnInit, OnChanges
{
    @Input() documentType: string = 'doc';
    @Input() documentUrl: string = ''; // Custom document URL
    @Input() documentName: string = ''; // Document name for display
    @Input() originalDocumentUrl: string = ''; // Original URL for download (not embedded)
    @Input() fileSize: number = 0; // File size in bytes
    @Input() isOpen: boolean = false;
    @Output() close = new EventEmitter<void>();

    // Document URLs (default samples)
    private urlDoc: string = `https://view.officeapps.live.com/op/embed.aspx?src=https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdkpMIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e75389b18343665404852ed4cba8bd25938fa9bd/file-sample_1MB.doc`;
    private urlXl: string = "https://view.officeapps.live.com/op/embed.aspx?src=https://go.microsoft.com/fwlink/?LinkID=521962";
    private urlPpt: string = "https://view.officeapps.live.com/op/embed.aspx?src=http://www.dickinson.edu/download/downloads/id/1076/sample_powerpoint_slides.pptx";
    private urlPdf: string = "https://docs.google.com/gview?url=https://pdfobject.com/pdf/sample.pdf&embedded=true";

    // Safe URL for iframe
    urlSafe: SafeResourceUrl;

    // Document types
    documentTypes = [
        { value: 'doc', label: 'Word Document', icon: 'description' },
        { value: 'xl', label: 'Excel Spreadsheet', icon: 'table_chart' },
        { value: 'ppt', label: 'PowerPoint Presentation', icon: 'slideshow' },
        { value: 'pdf', label: 'PDF Document', icon: 'picture_as_pdf' }
    ];

    /**
     * Constructor
     */
    constructor(public sanitizer: DomSanitizer) 
    {
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
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.updateDocumentUrl();
    }

    /**
     * On changes
     */
    ngOnChanges(changes: SimpleChanges): void
    {
        if ((changes['documentType'] && !changes['documentType'].firstChange) ||
            (changes['documentUrl'] && !changes['documentUrl'].firstChange)) {
            this.updateDocumentUrl();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the document viewer
     */
    closeViewer(): void
    {
        this.close.emit();
    }

    /**
     * Get document type icon
     *
     * @param type
     */
    getDocumentIcon(type: string): string
    {
        const docType = this.documentTypes.find(dt => dt.value === type);
        return docType ? docType.icon : 'description';
    }

    /**
     * Get document type label
     *
     * @param type
     */
    getDocumentLabel(type: string): string
    {
        const docType = this.documentTypes.find(dt => dt.value === type);
        return docType ? docType.label : 'Document';
    }

    /**
     * Download the document
     */
    downloadDocument(): void
    {
        const urlToDownload = this.originalDocumentUrl || this.documentUrl;
        
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
                link.download = this.documentName || 'document';
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
                link.download = this.documentName || 'document';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update document URL based on type
     */
    private updateDocumentUrl(): void
    {
        let url: string;
        
        // If custom document URL is provided, use it
        if (this.documentUrl) {
            // For PDF files - use direct embed by default (more reliable with signed URLs like AWS S3)
            if (this.documentType === 'pdf' || this.documentUrl.toLowerCase().endsWith('.pdf')) {
                // Direct PDF embed with PDF.js built into browsers
                // This works better with signed URLs (AWS S3, Contabo, etc.)
                url = this.documentUrl + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH';
            } else {
                // For Office documents (doc, docx, xls, xlsx, ppt, pptx), use Office Online viewer
                url = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.documentUrl)}`;
            }
        } else {
            // Use default sample URLs
            switch (this.documentType) {
                case 'doc':
                    url = this.urlDoc;
                    break;
                case 'xl':
                    url = this.urlXl;
                    break;
                case 'ppt':
                    url = this.urlPpt;
                    break;
                case 'pdf':
                    url = this.urlPdf;
                    break;
                default:
                    url = this.urlDoc;
            }
        }
        
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
