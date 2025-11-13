import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FileManagerService } from 'app/modules/admin/file-manager/file-manager.service';
import { Item, Items } from 'app/modules/admin/file-manager/file-manager.types';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';
import { ImageViewerComponent } from 'app/core/image-viewer/image-viewer.component';
import { PdfViewerComponent } from 'app/core/pdf-viewer/pdf-viewer.component';
import { DocumentViewerComponent } from 'app/core/document-viewer/document-viewer.component';
import { VideoViewerComponent } from 'app/core/video-viewer/video-viewer.component';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { FileUploadFile } from 'app/modules/admin/file-manager/file-manager.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FileUploadDialogComponent } from '../file-upload-dialog.component';
import { StorageUsageComponent } from 'app/shared/components/storage-usage/storage-usage.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { fadeIn } from '@fuse/animations/fade';
import { zoomIn } from '@fuse/animations/zoom';
import { FilenameDisplayComponent } from 'app/@fuse/components/filename-display/filename-display.component';
import { PermissionService } from 'app/core/auth/permission.service';

@Component({
    selector       : 'file-manager-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatSidenavModule, RouterOutlet, NgIf, RouterLink, NgFor, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule, MatCheckboxModule, TranslocoModule, ImageViewerComponent, PdfViewerComponent, DocumentViewerComponent, VideoViewerComponent, MatDialogModule, StorageUsageComponent, FilenameDisplayComponent, FormsModule],
    animations     : [fadeIn, zoomIn],
})
export class FileManagerListComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    @ViewChild('fileInput') fileInput: any;
    @ViewChild('fileInputNoData') fileInputNoData: any;
    drawerMode: 'side' | 'over';
    selectedItem: Item;
    items: Items;
    hasSelectedItem: boolean = false; // Track if an item is selected
    isLoading: boolean = false; // Loading state for operations
    isDragOver: boolean = false; // Drag and drop state
    isClosingDrawer: boolean = false; // Track if drawer is being closed
    encodeURIComponent = encodeURIComponent; // Expose for template

    // Multi-select state
    selectedFiles: Set<string> = new Set<string>(); // Set of selected file IDs
    isMultiSelectMode: boolean = false; // Whether multi-select mode is active
    
    // Search state
    searchTerm: string = '';
    isSearchActive: boolean = false;
    filteredItems: Items = { folders: [], files: [], path: [] };
    
    // Computed property to check if there's no data
    get hasNoData(): boolean {
        return this.items && this.items.folders.length === 0 && this.items.files.length === 0;
    }
    
    currentRoot: string = '/';
    filesToUpload: FileUploadFile[] = [];
    temporaryFolders: Map<string, boolean> = new Map(); // Track temporary folders
    selectedTemporaryFolder: string | null = null; // Track selected temporary folder for upload
    temporaryFolderStructure: Map<string, Item[]> = new Map(); // Track folder structure within temporary folders
    
    // Viewer state
    isDocumentViewerOpen: boolean = false;
    isPdfViewerOpen: boolean = false;
    isImageViewerOpen: boolean = false;
    isVideoViewerOpen: boolean = false;
    selectedDocumentUrl: string = '';
    selectedDocumentName: string = '';
    selectedDocumentType: string = 'doc';
    selectedFileSize: number = 0;
    selectedPdfUrl: string = '';
    selectedPdfName: string = '';
    selectedPdfSize: number = 0;
    selectedImageUrl: string = '';
    selectedImageName: string = '';
    selectedImageSize: number = 0;
    selectedImages: Array<{url: string, name: string, size: number}> = [];
    selectedImageIndex: number = 0;
    selectedVideoUrl: string = '';
    selectedVideoName: string = '';
    selectedVideoSize: number = 0;
    
    // Permissions
    canViewFileManager: boolean = false;
    canEditFileManager: boolean = false;
    canDeleteFileManager: boolean = false;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileManagerService: FileManagerService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _errorHandlerService: ErrorHandlerService,
        private _dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _permissionService: PermissionService,
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
        // Check permissions
        this.canViewFileManager = this._permissionService.canView('file-manager');
        this.canEditFileManager = this._permissionService.canEdit('file-manager');
        this.canDeleteFileManager = this._permissionService.canDelete('file-manager');
        
        // If user doesn't have view permission, don't load data
        if (!this.canViewFileManager) {
            return;
        }
        
        // Get the resolved items from the route
        this._activatedRoute.data
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) =>
            {
                if (data['items']) {
                    this.items = data['items'];
                    this._changeDetectorRef.markForCheck();
                }
            });

        // Also subscribe to service for dynamic updates
        this._fileManagerService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: Items) =>
            {
                this.items = items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the item
        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) =>
            {
                this.selectedItem = item;
                this.hasSelectedItem = !!item; // Set flag based on whether item exists

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media query change
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) =>
            {
                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to router navigation events
        this._router.events
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    // Reset drawer state when navigating to a new folder
                    // Check if we're navigating to a folder (not to details)
                    if (!event.url.includes('/details/')) {
                        this.selectedItem = null;
                        this.hasSelectedItem = false;
                        // Clear the item in the service to prevent it from being re-emitted
                        this._fileManagerService.clearItem();
                        this._changeDetectorRef.markForCheck();
                    }
                }
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
        // Prevent any drag and drop operations when closing drawer
        this.isDragOver = false;
        this.closeDrawer();
    }

    /**
     * On drawer closed
     */
    onDrawerClosed(): void
    {
        // Prevent any drag and drop operations when closing drawer
        this.isDragOver = false;
        this.closeDrawer();
    }

    /**
     * On drawer content clicked
     */
    onDrawerContentClicked(event: MouseEvent): void
    {
        // Only close if clicking on the backdrop (not on child elements)
        if (event.target === event.currentTarget) {
            // Prevent any drag and drop operations when closing drawer
            this.isDragOver = false;
            this.closeDrawer();
        }
    }

    /**
     * Handle click on the main content area (for side mode)
     */
    onMainContentClicked(event: MouseEvent): void
    {
        // For side mode, we need to close the drawer when clicking on the main content
        // Only close if clicking on the backdrop (not on child elements)
        if (this.drawerMode === 'side' && this.hasSelectedItem && event.target === event.currentTarget) {
            // Prevent any drag and drop operations when closing drawer
            this.isDragOver = false;
            this.closeDrawer();
        }
    }

    /**
     * Handle any click that should close the drawer
     */
    onAnyClick(event: MouseEvent): void
    {
        // Early return if no item is selected
        if (!this.hasSelectedItem) return;
        
        // Handle different drawer modes
        if (this.drawerMode === 'over') {
            return;
        }
        
        if (this.drawerMode === 'side') {
            this.handleSideModeClick(event);
        }
    }

    /**
     * Handle click in side mode
     */
    private handleSideModeClick(event: MouseEvent): void
    {
        const target = event.target as HTMLElement;
        
        // Check if click is on interactive element
        if (this.isInteractiveElement(target)) {
            return;
        }
        
        // Close drawer for non-interactive clicks
        if (this.shouldCloseDrawer(event, target)) {
            // Prevent any drag and drop operations when closing drawer
            this.isDragOver = false;
            this.closeDrawer();
        }
    }

    /**
     * Check if element is interactive
     */
    private isInteractiveElement(target: HTMLElement): boolean
    {
        // Define interactive selectors
        const interactiveSelectors = [
            '[data-file-item]',
            '[data-folder-item]',
            '.file-item',
            '.folder-item',
            'mat-button',
            'button',
            'a',
            'mat-icon',
            'mat-checkbox',
            'mat-tooltip',
            'input',
            'select',
            'textarea',
            '[role="button"]',
            '[role="link"]',
            '[role="menuitem"]',
            '[routerLink]',
            '[data-interactive]'
        ];
        
        // Check if target matches any interactive selector
        for (const selector of interactiveSelectors) {
            if (target.closest(selector)) {
                return true;
            }
        }
        
        // Check for cursor-pointer on file/folder items only
        if (target.classList.contains('cursor-pointer')) {
            return !!(target.closest('[data-file-item]') || 
                     target.closest('[data-folder-item]') ||
                     target.closest('.file-item') ||
                     target.closest('.folder-item'));
        }
        
        // Check for click handlers
        return target.hasAttribute('(click)');
    }

    /**
     * Determine if drawer should close
     */
    private shouldCloseDrawer(event: MouseEvent, target: HTMLElement): boolean
    {
        // Direct click on main content
        if (event.target === event.currentTarget) {
            return true;
        }
        
        // Click on non-interactive element within main content
        return target.closest('mat-drawer-content') === event.currentTarget;
    }

    /**
     * Close the drawer
     */
    private closeDrawer(): void
    {
        // Set flag to prevent drag and drop operations
        this.isClosingDrawer = true;
        
        // Clear the selected item to hide the drawer
        this.selectedItem = null;
        this.hasSelectedItem = false;
        
        // Clear the item in the service to prevent it from being re-emitted
        this._fileManagerService.clearItem();
        
        // Prevent any drag and drop operations when closing drawer
        this.isDragOver = false;
        
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Force change detection
        this._changeDetectorRef.detectChanges();

        // Reset the closing flag after a short delay
        setTimeout(() => {
            this.isClosingDrawer = false;
            this._changeDetectorRef.detectChanges();
        }, 100);

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
     * Go back to parent folder
     */
    goBack(): void
    {
        // If we're at root level (no path), do nothing (button should be disabled)
        if (!this.items || !this.items.path || this.items.path.length === 0) {
            return;
        }

        // Close any open drawer when navigating back
        this.selectedItem = null;
        this.hasSelectedItem = false;
        
        if (this.items && this.items.path && this.items.path.length > 0) {
            const lastPathItem = this.items.path[this.items.path.length - 1];
            const isLastPathTemporary = this.temporaryFolders.has(lastPathItem.id);
            
            // Get parent path before popping
            const parentPath = this.items.path.length > 1 
                ? this.items.path[this.items.path.length - 2] 
                : null;
            
            if (isLastPathTemporary && this.temporaryFolderStructure.size > 0) {
                // Handle temporary folder navigation (still tracking structure)
                // Save current folder structure before going back
                const currentPath = lastPathItem.id;
                if (this.items.folders && this.items.folders.length > 0) {
                    this.temporaryFolderStructure.set(currentPath, [...this.items.folders]);
                }
                
                this.items.path.pop();
                
                // Restore parent folder structure
                if (this.items.path.length > 0) {
                    const restoredParentPath = this.items.path[this.items.path.length - 1];
                    
                    // Check if parent is also temporary
                    if (this.temporaryFolders.has(restoredParentPath.id)) {
                        // Restore temporary folder structure
                        if (this.temporaryFolderStructure.has(restoredParentPath.id)) {
                            this.items.folders = [...this.temporaryFolderStructure.get(restoredParentPath.id)];
                        } else {
                            this.items.folders = [];
                        }
                        this.items.files = [];
                        this._changeDetectorRef.markForCheck();
                    } else {
                        // Navigate to permanent folder
                        this._router.navigate(['/gestionnaire-fichiers/folders/', encodeURIComponent(restoredParentPath.id)]).then(() => {
                            setTimeout(() => {
                                this._fileManagerService.getItems(restoredParentPath.id).subscribe({
                                    next: () => {
                                        this._changeDetectorRef.markForCheck();
                                    },
                                    error: (error) => {
                                        console.error('[FileManager] Error refreshing permanent parent folder:', error);
                                    }
                                });
                            }, 100);
                        });
                    }
                } else {
                    // Navigate to root
                    this._router.navigate(['/gestionnaire-fichiers']).then(() => {
                        setTimeout(() => {
                            this._fileManagerService.getItems(null).subscribe({
                                next: () => {
                                    this._changeDetectorRef.markForCheck();
                                },
                                error: (error) => {
                                    console.error('[FileManager] Error refreshing root from temporary folder:', error);
                                }
                            });
                        }, 100);
                    });
                }
            } else {
                // Handle permanent folder navigation
                if (parentPath) {
                    // Navigate to parent folder
                    this._router.navigate(['/gestionnaire-fichiers/folders/', encodeURIComponent(parentPath.id)]).then(() => {
                        setTimeout(() => {
                            this._fileManagerService.getItems(parentPath.id).subscribe({
                                next: () => {
                                    this._changeDetectorRef.markForCheck();
                                },
                                error: (error) => {
                                    console.error('[FileManager] Error refreshing parent folder:', error);
                                }
                            });
                        }, 100);
                    });
                } else {
                    // Navigate to root
                    this._router.navigate(['/gestionnaire-fichiers']).then(() => {
                        setTimeout(() => {
                            this._fileManagerService.getItems(null).subscribe({
                                next: () => {
                                    this._changeDetectorRef.markForCheck();
                                },
                                error: (error) => {
                                    console.error('[FileManager] Error refreshing root:', error);
                                }
                            });
                        }, 100);
                    });
                }
            }
        }
    }

    /**
     * Create a new temporary folder
     */
    createNewFolder(): void
    {
        if (!this.items) {
            this._errorHandlerService.showErrorAlert(
                'Error',
                'File manager not initialized. Please refresh the page.'
            );
            return;
        }

        const folderName = prompt('Enter folder name:');
        
        if (!folderName || folderName.trim() === '') {
            return;
        }

        // Set loading state
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        // Sanitize folder name (remove special characters)
        const sanitizedName = folderName.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '');
        
        if (sanitizedName === '') {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
            this._errorHandlerService.showErrorAlert(
                'Invalid Folder Name',
                'Folder name contains only invalid characters.'
            );
            return;
        }

        // Get current root path
        const currentRoot = this.items.path && this.items.path.length > 0 
            ? this.items.path[this.items.path.length - 1].id 
            : '/';
            
        // Ensure path is initialized if we're at root level
        if (!this.items.path || this.items.path.length === 0) {
            this.items.path = [];
        }

        // Create the new folder path
        const newFolderPath = currentRoot === '/' 
            ? sanitizedName 
            : `${currentRoot}/${sanitizedName}`;

        // Initialize folders array if it doesn't exist
        if (!this.items.folders) {
            this.items.folders = [];
        }

        // Check if folder already exists
        const folderExists = this.items.folders.some(f => f.name === sanitizedName);
        if (folderExists) {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
            this._errorHandlerService.showErrorAlert(
                'Folder Exists',
                'A folder with this name already exists.'
            );
            return;
        }

        // Create temporary folder item
        const newFolder: Item = {
            id: newFolderPath,
            folderId: currentRoot === '/' ? null : currentRoot,
            name: sanitizedName,
            createdAt: new Date().toLocaleDateString(),
            modifiedAt: new Date().toLocaleDateString(),
            size: '0 B',
            type: 'folder',
            contents: '0 fichiers',
            description: null
        };

        // Add to folders list
        this.items.folders.push(newFolder);
        
        // Mark as temporary
        this.temporaryFolders.set(newFolderPath, true);

        // Sort folders alphabetically
        this.items.folders.sort((a, b) => a.name.localeCompare(b.name));

        // Ensure files array exists (it might not exist when in temporary folders)
        if (!this.items.files) {
            this.items.files = [];
        }

        // Save the updated folder structure if we're inside a temporary folder
        if (this.isInsideTemporaryFolder()) {
            const currentPath = this.items.path[this.items.path.length - 1].id;
            this.temporaryFolderStructure.set(currentPath, [...this.items.folders]);
        }

        this._changeDetectorRef.markForCheck();

        // Clear loading state
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();

        this._errorHandlerService.showSuccessAlert(
            'Folder Created',
            `Folder "${sanitizedName}" created. Upload files to create it permanently.`
        );
    }

    /**
     * Delete a temporary folder
     */
    deleteTemporaryFolder(folderId: string): void
    {
        if (!this.items || !this.items.folders) {
            return;
        }

        // Find the folder to get its name
        const folder = this.items.folders.find(f => f.id === folderId);
        
        if (!folder) {
            return;
        }

        if (confirm(`Are you sure you want to delete the temporary folder "${folder.name}"?`)) {
            // Remove from folders list
            this.items.folders = this.items.folders.filter(f => f.id !== folderId);
            
            // Remove from temporary folders map
            this.temporaryFolders.delete(folderId);
            
            // Remove from temporary folder structure if it exists
            this.temporaryFolderStructure.delete(folderId);
            
            // Save the updated folder structure if we're inside a temporary folder
            if (this.isInsideTemporaryFolder()) {
                const currentPath = this.items.path[this.items.path.length - 1].id;
                this.temporaryFolderStructure.set(currentPath, [...this.items.folders]);
            }
            
            this._changeDetectorRef.markForCheck();
            
            this._errorHandlerService.showSuccessAlert(
                'Folder Deleted',
                `Temporary folder "${folder.name}" has been deleted.`
            );
        }
    }

    /**
     * Navigate into a temporary folder
     */
    navigateToTemporaryFolder(folderId: string): void
    {
        const folder = this.items.folders.find(f => f.id === folderId);
        
        if (!folder) {
            return;
        }

        // Close any open drawer when navigating to a new folder
        this.selectedItem = null;
        this.hasSelectedItem = false;

        // Save current folder structure before navigating
        const parentPath = this.items.path && this.items.path.length > 0 
            ? this.items.path[this.items.path.length - 1].id 
            : '/';
        
        if (!this.temporaryFolderStructure.has(parentPath)) {
            this.temporaryFolderStructure.set(parentPath, [...this.items.folders]);
        }

        // Update the path
        const newPathItem = {
            id: folderId,
            name: folder.name,
            type: 'folder'
        };

        // Add to path
        if (!this.items.path) {
            this.items.path = [];
        }
        this.items.path.push(newPathItem);

        // Load or initialize folder structure for this temporary folder
        if (this.temporaryFolderStructure.has(folderId)) {
            this.items.folders = [...this.temporaryFolderStructure.get(folderId)];
        } else {
            this.items.folders = [];
        }
        
        // Ensure files array is initialized
        if (!this.items.files) {
            this.items.files = [];
        } else {
            this.items.files = [];
        }

        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if a folder is temporary (recursively)
     */
    isTemporaryFolder(folderId: string): boolean
    {
        return this.temporaryFolders.has(folderId);
    }

    /**
     * Check if we're currently inside a temporary folder hierarchy
     */
    isInsideTemporaryFolder(): boolean
    {
        if (!this.items || !this.items.path || this.items.path.length === 0) {
            return false;
        }

        // Check if any path element is a temporary folder
        return this.items.path.some(pathItem => this.temporaryFolders.has(pathItem.id));
    }

    /**
     * Handle file selection for upload
     */
    onFileSelected(event: any): void
    {
        const files: FileList = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        this.filesToUpload = [];
        // No file type or size restrictions - accept all files

        Array.from(files).forEach(file => {

            // Convert file to base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                this.filesToUpload.push({
                    fileName: file.name,
                    base64Content: base64String
                });
            };
            reader.readAsDataURL(file);
        });

        // Wait a bit for files to be processed, then upload
        setTimeout(() => {
            this.uploadFiles();
        }, 500);
    }

    /**
     * Upload files
     */
    uploadFiles(): void
    {
        // Check permission
        if (!this.canEditFileManager) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to upload files');
            return;
        }
        
        if (this.filesToUpload.length === 0) {
            return;
        }

        // Set loading state
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        // Determine upload root based on current path
        let uploadRoot = null;
        
        // Check if we're inside a temporary folder hierarchy
        if (this.isInsideTemporaryFolder()) {
            // Use the current path (which includes temporary folders)
            uploadRoot = this.items.path && this.items.path.length > 0 
                ? this.items.path[this.items.path.length - 1].id 
                : '/';
        } else if (this.temporaryFolders.size > 0) {
            // If there are temporary folders in current view, ask user which one to upload to
            const folderNames = Array.from(this.temporaryFolders.keys());
            
            if (folderNames.length === 1) {
                // Only one temporary folder, use it
                uploadRoot = folderNames[0];
            } else {
                // Multiple temporary folders, show dialog to select
                const selectedFolder = prompt(`Upload to which folder?\n\n${folderNames.map((name, idx) => `${idx + 1}. ${name}`).join('\n')}\n\nEnter number or folder name:`);
                
                if (selectedFolder) {
                    const folderIndex = parseInt(selectedFolder) - 1;
                    if (folderIndex >= 0 && folderIndex < folderNames.length) {
                        uploadRoot = folderNames[folderIndex];
                    } else {
                        // Try to find by name
                        const foundFolder = folderNames.find(name => name.includes(selectedFolder));
                        if (foundFolder) {
                            uploadRoot = foundFolder;
                        }
                    }
                }
            }
        }

        // If no temporary folder selected, use current root
        if (!uploadRoot) {
            uploadRoot = this.items.path && this.items.path.length > 0 
                ? this.items.path[this.items.path.length - 1].id 
                : '/';
        }
        
        this._fileManagerService.uploadFiles(this.filesToUpload, uploadRoot).subscribe({
            next: () => {
                this._errorHandlerService.showSuccessAlert(
                    'Upload Successful',
                    `Successfully uploaded ${this.filesToUpload.length} file(s)`
                );
                this.filesToUpload = [];
                
                // Clear storage usage cache after upload
                this._fileManagerService.clearStorageUsageCache();
                
                // Store current folder info before clearing temporary state
                const currentFolderId = this.items.path && this.items.path.length > 0 
                    ? this.items.path[this.items.path.length - 1].id 
                    : '/';
                
                // Clear temporary folders after successful upload
                this.temporaryFolders.clear();
                this.selectedTemporaryFolder = null;
                this.temporaryFolderStructure.clear();
                
                // Always stay in current folder and refresh
                // Fetch current root attachments after upload completes
                // Add a delay to ensure backend has processed the upload
                setTimeout(() => {
                    this._fileManagerService.getItems(currentFolderId === '/' ? null : currentFolderId).subscribe({
                        next: (items) => {
                            // Update the items to show newly uploaded files
                            this.items = items;
                            this.isLoading = false;
                            this._changeDetectorRef.markForCheck();
                        },
                        error: (error) => {
                            console.error('[FileManager] Error refreshing items after upload:', error);
                            this.isLoading = false;
                            this._changeDetectorRef.markForCheck();
                        }
                    });
                }, 1000);
            },
            error: (error) => {
                console.error('[FileManager] Upload failed:', error);
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
                this._errorHandlerService.showErrorAlert(
                    'Upload Failed',
                    'Failed to upload files. Please try again.'
                );
            }
        });
    }

    /**
     * Trigger file input click
     */
    triggerFileInput(): void
    {
        // Try the main file input first (when there are items)
        if (this.fileInput && this.fileInput.nativeElement) {
            this.fileInput.nativeElement.click();
        }
        // If no main file input, try the no-data file input
        else if (this.fileInputNoData && this.fileInputNoData.nativeElement) {
            this.fileInputNoData.nativeElement.click();
        }
    }

    /**
     * Open upload dialog
     */
    openUploadDrawer(): void
    {
        // Get current root path
        const currentRoot = this.items.path && this.items.path.length > 0 
            ? this.items.path[this.items.path.length - 1].id 
            : '/';
        
        const folderName = this.items.path && this.items.path.length > 0
            ? this.items.path[this.items.path.length - 1].name
            : 'Root';

        // Open the upload dialog
        const dialogRef = this._dialog.open(FileUploadDialogComponent, {
            width: '600px',
            data: {
                currentRoot: currentRoot,
                folderName: folderName
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Clear temporary folders after successful upload (they become real now)
                const wasInTemporaryFolder = this.isInsideTemporaryFolder();
                
                if (wasInTemporaryFolder) {
                    this.temporaryFolders.clear();
                    this.selectedTemporaryFolder = null;
                    this.temporaryFolderStructure.clear();
                }
                
                // Always refresh the current folder to show the newly created folder/files
                // Add a delay to ensure backend has processed the upload
                setTimeout(() => {
                    const folderToRefresh = currentRoot === '/' ? null : currentRoot;
                    
                    // Call getItems which will update the BehaviorSubject
                    // The subscription in ngOnInit will automatically handle the update
                    this._fileManagerService.getItems(folderToRefresh).subscribe({
                        next: () => {
                            // Force change detection
                            this._changeDetectorRef.markForCheck();
                        },
                        error: (error) => {
                            console.error('[FileManager] Error refreshing items after upload:', error);
                            this._changeDetectorRef.markForCheck();
                        }
                    });
                }, 500);
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Viewer methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open image viewer
     */
    openImageViewer(url: string, name: string, size: number): void
    {
        // Get all images in the current folder
        const allImages = this.getAllImagesInCurrentFolder();
        
        // Find the index of the clicked image
        const imageIndex = allImages.findIndex(img => img.url === url);
        
        this.selectedImages = allImages;
        this.selectedImageIndex = imageIndex >= 0 ? imageIndex : 0;
        this.selectedImageUrl = url;
        this.selectedImageName = name;
        this.selectedImageSize = size;
        this.isImageViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close image viewer
     */
    closeImageViewer(): void
    {
        this.isImageViewerOpen = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get all images in the current folder
     */
    getAllImagesInCurrentFolder(): Array<{url: string, name: string, size: number}>
    {
        if (!this.items || !this.items.files) {
            return [];
        }

        return this.items.files
            .filter(file => this.isImageFile(file) && file.url)
            .map(file => ({
                url: file.url,
                name: file.name,
                size: this.parseFileSize(file.size)
            }));
    }

    /**
     * Handle image change in viewer
     */
    onImageChanged(index: number): void
    {
        this.selectedImageIndex = index;
        if (this.selectedImages && this.selectedImages[index]) {
            const image = this.selectedImages[index];
            this.selectedImageUrl = image.url;
            this.selectedImageName = image.name;
            this.selectedImageSize = image.size;
        }
        this._changeDetectorRef.markForCheck();
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

    /**
     * Open PDF viewer
     */
    openPdfViewer(url: string, name: string, size: number): void
    {
        this.selectedPdfUrl = url;
        this.selectedPdfName = name;
        this.selectedPdfSize = size;
        this.isPdfViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close PDF viewer
     */
    closePdfViewer(): void
    {
        this.isPdfViewerOpen = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open document viewer
     */
    openDocumentViewer(url: string, name: string, extension: string, size: number): void
    {
        // Map extension to document type
        let docType = 'doc';
        if (extension === '.xls' || extension === '.xlsx') {
            docType = 'xl';
        } else if (extension === '.ppt' || extension === '.pptx') {
            docType = 'ppt';
        } else if (extension === '.pdf') {
            docType = 'pdf';
        } else if (extension === '.doc' || extension === '.docx') {
            docType = 'doc';
        }
        
        this.selectedDocumentUrl = url;
        this.selectedDocumentName = name;
        this.selectedDocumentType = docType;
        this.selectedFileSize = size;
        this.isDocumentViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close document viewer
     */
    closeDocumentViewer(): void
    {
        this.isDocumentViewerOpen = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open video viewer
     */
    openVideoViewer(url: string, name: string, size: number): void
    {
        this.selectedVideoUrl = url;
        this.selectedVideoName = name;
        this.selectedVideoSize = size;
        this.isVideoViewerOpen = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close video viewer
     */
    closeVideoViewer(): void
    {
        this.isVideoViewerOpen = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle drag over event
     */
    onDragOver(event: DragEvent): void
    {
        // Don't allow drag over if drawer is being closed or if there's a selected item in over mode
        if (this.isClosingDrawer || (this.hasSelectedItem && this.drawerMode === 'over')) {
            return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        
        event.dataTransfer!.dropEffect = 'copy';
        this.isDragOver = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle drag enter event
     */
    onDragEnter(event: DragEvent): void
    {
        // Don't allow drag enter if drawer is being closed or if there's a selected item in over mode
        if (this.isClosingDrawer || (this.hasSelectedItem && this.drawerMode === 'over')) {
            return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        
        this.isDragOver = true;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle drag leave event
     */
    onDragLeave(event: DragEvent): void
    {
        event.preventDefault();
        event.stopPropagation();
        // Only hide overlay if we're leaving the main container
        if (!event.relatedTarget || !(event.relatedTarget as Element).closest('mat-drawer-content')) {
            this.isDragOver = false;
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Handle drop event
     */
    onDrop(event: DragEvent): void
    {
        event.preventDefault();
        event.stopPropagation();
        
        // Reset drag state
        this.isDragOver = false;
        this._changeDetectorRef.markForCheck();

        // Don't process files if drawer is being closed or if there's a selected item in over mode
        if (this.isClosingDrawer || (this.hasSelectedItem && this.drawerMode === 'over')) {
            return;
        }

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            // Show processing message
            this._errorHandlerService.showInfoAlert(
                'Processing Files',
                `Processing ${files.length} file(s) for upload...`
            );
            
            // Convert FileList to Array and process files
            const fileArray = Array.from(files);
            this.processDroppedFiles(fileArray);
        }
    }

    /**
     * Process dropped files
     */
    private processDroppedFiles(files: File[]): void
    {
        // Clear existing files to upload
        this.filesToUpload = [];

        let processedFiles = 0;
        const totalFiles = files.length;

        // Process each file
        files.forEach(file => {
            // Check file size (100MB limit)
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 100) {
                this._errorHandlerService.showErrorAlert(
                    'File Too Large',
                    `File "${file.name}" is ${fileSizeInMB.toFixed(2)} MB. Please choose files smaller than 100 MB.`
                );
                processedFiles++;
                if (processedFiles === totalFiles && this.filesToUpload.length > 0) {
                    this.uploadFiles();
                }
                return;
            }

            // Convert file to base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                this.filesToUpload.push({
                    fileName: file.name,
                    base64Content: base64String
                });
                processedFiles++;
                
                // Upload when all files are processed
                if (processedFiles === totalFiles) {
                    this._changeDetectorRef.markForCheck();
                    setTimeout(() => {
                        this.uploadFiles();
                    }, 500);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Toggle multi-select mode
     */
    toggleMultiSelectMode(): void
    {
        this.isMultiSelectMode = !this.isMultiSelectMode;
        if (!this.isMultiSelectMode) {
            this.selectedFiles.clear();
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle file selection
     */
    toggleFileSelection(fileId: string): void
    {
        if (this.selectedFiles.has(fileId)) {
            this.selectedFiles.delete(fileId);
        } else {
            this.selectedFiles.add(fileId);
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if file is selected
     */
    isFileSelected(fileId: string): boolean
    {
        return this.selectedFiles.has(fileId);
    }

    /**
     * Toggle select all files (not folders)
     */
    selectAllFiles(): void
    {
        // Check if all files are currently selected
        const allFilesSelected = this.items.files.length > 0 && 
            this.items.files.every(file => this.selectedFiles.has(file.id));
        
        if (allFilesSelected) {
            // If all files are selected, deselect all
            this.clearSelection();
        } else {
            // If not all files are selected, select all
            this.selectedFiles.clear();
            this.items.files.forEach(file => {
                this.selectedFiles.add(file.id);
            });
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Clear all selections
     */
    clearSelection(): void
    {
        this.selectedFiles.clear();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get selected files count
     */
    get selectedFilesCount(): number
    {
        return this.selectedFiles.size;
    }

    /**
     * Check if all files are selected
     */
    get allFilesSelected(): boolean
    {
        return this.items.files.length > 0 && 
            this.items.files.every(file => this.selectedFiles.has(file.id));
    }

    /**
     * Navigate to file details
     */
    navigateToFile(fileId: string): void
    {
        this._router.navigate(['./details', encodeURIComponent(fileId)], { relativeTo: this._activatedRoute });
    }

    /**
     * Delete a single file
     */
    deleteFile(fileId: string, fileName: string): void
    {
        // Check permission
        if (!this.canDeleteFileManager) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to delete files');
            return;
        }
        
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete File',
            message: `Are you sure you want to delete "${fileName}"? This action cannot be undone!`,
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
                this.isLoading = true;
                this._changeDetectorRef.markForCheck();

                this._fileManagerService.deleteFile(fileId).subscribe({
                    next: () => {
                        this.isLoading = false;
                        this._errorHandlerService.showSuccessAlert(
                            'File Deleted',
                            'The file has been successfully deleted.'
                        );
                        
                        // Clear storage usage cache after deletion
                        this._fileManagerService.clearStorageUsageCache();
                        
                        // Refresh the current folder
                        const currentRoot = this.items.path && this.items.path.length > 0 
                            ? this.items.path[this.items.path.length - 1].id 
                            : null;
                        
                        this._fileManagerService.getItems(currentRoot).subscribe({
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
                        this.isLoading = false;
                        this._errorHandlerService.showErrorAlert(
                            'Delete Failed',
                            'Failed to delete the file. Please try again.'
                        );
                        this._changeDetectorRef.markForCheck();
                    }
                });
            }
        });
    }

    /**
     * Bulk delete selected files
     */
    bulkDeleteSelectedFiles(): void
    {
        // Check permission
        if (!this.canDeleteFileManager) {
            this._errorHandlerService.showErrorAlert('Permission Denied', 'You do not have permission to delete files');
            return;
        }
        
        if (this.selectedFiles.size === 0) {
            this._errorHandlerService.showErrorAlert('No Selection', 'Please select files to delete');
            return;
        }

        const fileIds = Array.from(this.selectedFiles);
        
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete Files',
            message: `Are you sure you want to delete ${fileIds.length} file(s)? This action cannot be undone!`,
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
                this.isLoading = true;
                this._changeDetectorRef.markForCheck();

                this._fileManagerService.bulkDeleteFiles(fileIds).subscribe({
                    next: (response) => {
                        this.isLoading = false;
                        this._errorHandlerService.showSuccessAlert(
                            'Files Deleted',
                            `Successfully deleted ${fileIds.length} file(s)`
                        );
                        
                        // Clear storage usage cache after deletion
                        this._fileManagerService.clearStorageUsageCache();
                        
                        // Clear selection and refresh items
                        this.clearSelection();
                        this.isMultiSelectMode = false;
                        // Refresh items by triggering service update
                        this._fileManagerService.getItems(this.items.path && this.items.path.length > 0 
                            ? this.items.path[this.items.path.length - 1].id 
                            : null).subscribe();
                    },
                    error: (error) => {
                        this.isLoading = false;
                        this._errorHandlerService.showErrorAlert(
                            'Delete Failed',
                            'Failed to delete files. Please try again.'
                        );
                        this._changeDetectorRef.markForCheck();
                    }
                });
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Search methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Search files by name
     */
    searchFiles(): void
    {
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.clearSearch();
            return;
        }

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const currentRoot = this.items.path && this.items.path.length > 0 
            ? this.items.path[this.items.path.length - 1].id 
            : null;

        this._fileManagerService.getItems(currentRoot, this.searchTerm.trim()).subscribe({
            next: (items) => {
                this.filteredItems = items;
                this.isSearchActive = true;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();

                if (this.filteredItems.files.length === 0) {
                    this._errorHandlerService.showInfoAlert(
                        'No Results',
                        `No files found matching "${this.searchTerm}"`
                    );
                }
            },
            error: (error) => {
                console.error('[FileManager] Search failed:', error);
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
                this._errorHandlerService.showErrorAlert(
                    'Search Failed',
                    'Failed to search files. Please try again.'
                );
            }
        });
    }

    /**
     * Clear search and return to normal view
     */
    clearSearch(): void
    {
        this.searchTerm = '';
        this.isSearchActive = false;
        this.filteredItems = { folders: [], files: [], path: [] };
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Refresh files
     */
    refreshFiles(): void
    {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const currentRoot = this.items.path && this.items.path.length > 0 
            ? this.items.path[this.items.path.length - 1].id 
            : null;

        // If searching, refresh search results
        if (this.isSearchActive && this.searchTerm.trim()) {
            this._fileManagerService.getItems(currentRoot, this.searchTerm.trim()).subscribe({
                next: (items) => {
                    this.filteredItems = items;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._errorHandlerService.showSuccessAlert(
                        'Refreshed',
                        'Search results refreshed successfully'
                    );
                },
                error: (error) => {
                    console.error('[FileManager] Refresh search failed:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._errorHandlerService.showErrorAlert(
                        'Refresh Failed',
                        'Failed to refresh search results. Please try again.'
                    );
                }
            });
        } else {
            // Normal refresh
            this._fileManagerService.getItems(currentRoot).subscribe({
                next: (items) => {
                    this.items = items;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._errorHandlerService.showSuccessAlert(
                        'Refreshed',
                        'Files refreshed successfully'
                    );
                },
                error: (error) => {
                    console.error('[FileManager] Refresh failed:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._errorHandlerService.showErrorAlert(
                        'Refresh Failed',
                        'Failed to refresh files. Please try again.'
                    );
                }
            });
        }
    }

    /**
     * Handle search input change
     */
    onSearchInputChange(): void
    {
        // Clear search when input is empty
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.clearSearch();
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
     * Get file extension from filename
     */
    getFileExtension(filename: string): string
    {
        const lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
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

    /**
     * Set cursor to pointer on file hover
     */
    setCursorPointer(event: MouseEvent): void
    {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.cursor = 'pointer';
        }
    }

    /**
     * Reset cursor to default on file leave
     */
    resetCursor(event: MouseEvent): void
    {
        const target = event.target as HTMLElement;
        if (target) {
            target.style.cursor = 'default';
        }
    }
}

