import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FileManagerService } from 'app/modules/admin/file-manager/file-manager.service';
import { Item } from 'app/modules/admin/file-manager/file-manager.types';
import { FileManagerListComponent } from 'app/modules/admin/file-manager/list/list.component';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FilenameDisplayComponent } from 'app/@fuse/components/filename-display/filename-display.component';

@Component({
    selector       : 'file-manager-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatButtonModule, MatIconModule, NgIf, TranslocoModule, FilenameDisplayComponent],
})
export class FileManagerDetailsComponent implements OnInit, OnDestroy
{
    item: Item;
    encodeURIComponent = encodeURIComponent; // Expose for template
    isLoading: boolean = false; // Loading state for operations
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fileManagerListComponent: FileManagerListComponent,
        private _fileManagerService: FileManagerService,
        private _errorHandlerService: ErrorHandlerService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService,
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
        // Don't set hasSelectedItem here - let it be controlled by the actual item selection

        // Get the item
        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((item: Item) =>
        {
            // Set the selected item and flag in the list component
            this._fileManagerListComponent.selectedItem = item;
            this._fileManagerListComponent.hasSelectedItem = !!item;
            
            // Only open drawer if there's actually an item selected
            if (item) {
                // Wait for the drawer to be created, then open it
                setTimeout(() => {
                    if (this._fileManagerListComponent.matDrawer) {
                        this._fileManagerListComponent.matDrawer.open();
                    }
                }, 50);
            }

            // Get the item
            this.item = item;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        this.closeDrawer();
    }

    /**
     * On details content clicked
     */
    onDetailsContentClicked(event: MouseEvent): void
    {
        // Only close if clicking on the backdrop (not on child elements)
        if (event.target === event.currentTarget) {
            this.closeDrawer();
        }
    }

    /**
     * Close the drawer
     */
    closeDrawer(): void
    {
        // Clear the selected item to hide the drawer
        this._fileManagerListComponent.selectedItem = null;
        this._fileManagerListComponent.hasSelectedItem = false;
        
        // Navigate back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute.parent});
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    /**
     * View file based on type
     */
    viewFile(): void
    {
        if (!this.item.url) {
            this._errorHandlerService.showErrorAlert('Error', 'File URL not available');
            return;
        }

        const extension = this.getFileExtension(this.item.name);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const pdfExtension = '.pdf';
        const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp', '.ogv'];
        
        if (imageExtensions.includes(extension)) {
            this._fileManagerListComponent.openImageViewer(this.item.url, this.item.name, this.parseFileSize(this.item.size));
        } else if (extension === pdfExtension) {
            this._fileManagerListComponent.openPdfViewer(this.item.url, this.item.name, this.parseFileSize(this.item.size));
        } else if (officeExtensions.includes(extension)) {
            this._fileManagerListComponent.openDocumentViewer(this.item.url, this.item.name, extension, this.parseFileSize(this.item.size));
        } else if (videoExtensions.includes(extension)) {
            this._fileManagerListComponent.openVideoViewer(this.item.url, this.item.name, this.parseFileSize(this.item.size));
        } else {
            this._errorHandlerService.showWarningAlert(
                'Unsupported Format',
                `The file format "${extension}" is not supported for preview. Please use the download button to download the file.`
            );
        }
    }

    /**
     * Download file
     */
    downloadFile(): void
    {
        if (!this.item.url) {
            this._errorHandlerService.showErrorAlert('Error', 'File URL not available');
            return;
        }

        // Fetch the file as a blob and download it
        fetch(this.item.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to download file');
                }
                return response.blob();
            })
            .then(blob => {
                // Create a temporary URL for the blob
                const blobUrl = window.URL.createObjectURL(blob);
                
                // Create a temporary link element and trigger download
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = this.item.name;
                document.body.appendChild(link);
                link.click();
                
                // Clean up
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(error => {
                console.error('Download error:', error);
                this._errorHandlerService.showErrorAlert('Download Error', 'Failed to download file. Please try again.');
            });
    }

    /**
     * Delete file
     */
    deleteFile(): void
    {
        if (!this.item.id) {
            this._errorHandlerService.showErrorAlert('Error', 'File ID not available');
            return;
        }

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete File',
            message: 'Are you sure you want to delete this file? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                    color: 'warn'
                },
                cancel: {
                    label: 'Cancel'
                }
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe((result) =>
        {
            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Store the item ID before clearing it
                const itemId = this.item.id;
                
                // Get current root before making any changes
                const currentRoot = this._fileManagerListComponent.items?.path && this._fileManagerListComponent.items.path.length > 0 
                    ? this._fileManagerListComponent.items.path[this._fileManagerListComponent.items.path.length - 1].id 
                    : '/';
                
                // IMMEDIATELY clear the selected item and close the drawer (no delay)
                this._fileManagerListComponent.selectedItem = null;
                this._fileManagerListComponent.hasSelectedItem = false;
                
                // Explicitly close the drawer if it's open
                if (this._fileManagerListComponent.matDrawer) {
                    this._fileManagerListComponent.matDrawer.close();
                }
                
                // Clear the item in this component as well
                this.item = null;
                
                // Navigate back to list immediately (before API call)
                this._router.navigate(['./'], {relativeTo: this._activatedRoute.parent});
                
                this._changeDetectorRef.markForCheck();
                
                // Now make the API call to delete the file
                this._fileManagerService.deleteFile(itemId).subscribe({
                    next: () => {
                        // Show success message
                        this._errorHandlerService.showSuccessAlert(
                            'File Deleted',
                            'The file has been successfully deleted.'
                        );
                        
                        // Clear storage usage cache after deletion
                        this._fileManagerService.clearStorageUsageCache();
                        
                        // Refresh the current folder
                        this._fileManagerService.getItems(currentRoot === '/' ? null : currentRoot).subscribe({
                            next: () => {
                                this._changeDetectorRef.markForCheck();
                            },
                            error: (error) => {
                                console.error('[FileManager] Error refreshing folder after delete:', error);
                                this._changeDetectorRef.markForCheck();
                            }
                        });
                    },
                    error: (error) => {
                        this._errorHandlerService.showErrorAlert(
                            'Delete Failed',
                            'Failed to delete the file. Please try again.'
                        );
                    }
                });
            }
        });
    }

    /**
     * Get file extension from filename
     */
    private getFileExtension(filename: string): string
    {
        const lastDot = filename.lastIndexOf('.');
        return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
    }

    /**
     * Parse file size string to bytes
     */
    private parseFileSize(sizeStr: string): number
    {
        if (!sizeStr) return 0;
        
        const sizeMatch = sizeStr.match(/^([\d.]+)\s*(B|KB|MB|GB)$/i);
        if (!sizeMatch) return 0;
        
        const value = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2].toUpperCase();
        
        switch (unit) {
            case 'KB': return value * 1024;
            case 'MB': return value * 1024 * 1024;
            case 'GB': return value * 1024 * 1024 * 1024;
            default: return value;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ File type detection methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check if a file is an image based on its extension
     */
    isImageFile(file: Item): boolean
    {
        if (!file.name) {
            return false;
        }
        
        const extension = this.getFileExtension(file.name);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico'];
        return imageExtensions.includes(extension.toLowerCase());
    }

    /**
     * Get file type icon based on file extension
     */
    getFileTypeIcon(file: Item): string
    {
        if (!file.name) {
            return 'heroicons_solid:document';
        }
        
        const extension = this.getFileExtension(file.name).toLowerCase();
        
        // Image files
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico'].includes(extension)) {
            return 'heroicons_solid:photo';
        }
        
        // PDF files
        if (extension === '.pdf') {
            return 'heroicons_solid:document-text';
        }
        
        // Word documents
        if (['.doc', '.docx'].includes(extension)) {
            return 'heroicons_solid:document-text';
        }
        
        // Excel files
        if (['.xls', '.xlsx'].includes(extension)) {
            return 'heroicons_solid:table-cells';
        }
        
        // PowerPoint files
        if (['.ppt', '.pptx'].includes(extension)) {
            return 'heroicons_solid:presentation-chart-line';
        }
        
        // Video files
        if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp', '.ogv'].includes(extension)) {
            return 'heroicons_solid:video-camera';
        }
        
        // Audio files
        if (['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'].includes(extension)) {
            return 'heroicons_solid:musical-note';
        }
        
        // Archive files
        if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(extension)) {
            return 'heroicons_solid:archive-box';
        }
        
        // Default document icon
        return 'heroicons_solid:document';
    }


}

