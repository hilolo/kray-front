import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { ClassValue } from 'clsx';
import { ZardPageComponent } from '../page/page.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBreadcrumbModule } from '@shared/components/breadcrumb/breadcrumb.module';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { mergeClasses } from '@shared/utils/merge-classes';
import { fileManagerVariants } from './file-manager.variants';
import { ZardFileViewerComponent } from '@shared/components/file-viewer/file-viewer.component';
import { AttachmentService } from '@shared/services/attachment.service';
import type { FileManagerItem as ApiFileManagerItem } from '@shared/models/attachment/file-manager-item.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ImageItem } from '@shared/image-viewer/image-viewer.component';
import { getFileViewerType } from '@shared/utils/file-type.util';

export interface FileItem {
  id: string;
  name: string;
  extension: string;
  type: 'file';
  url?: string; // Optional URL for file viewing
  size?: number; // Optional file size
}

export interface FolderItem {
  id: string;
  name: string;
  fileCount: number;
  type: 'folder';
  isTemporary?: boolean; // Indicates if folder is temporary (created but no files uploaded yet)
}

export type FileManagerItem = FileItem | FolderItem;

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    FormsModule,
    ZardPageComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardCheckboxComponent,
    ZardInputDirective,
    ZardBreadcrumbModule,
    ZardFileViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './file-manager.component.html',
  host: {
    '[class]': 'classes()',
  },
})
export class FileManagerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly attachmentService = inject(AttachmentService);

  readonly class = input<ClassValue>('');

  // API data
  readonly folders = signal<FolderItem[]>([]);
  readonly files = signal<FileItem[]>([]);
  readonly apiPath = signal<ApiFileManagerItem[]>([]);
  readonly currentRoot = signal<string | undefined>(undefined);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly isUploading = signal(false);

  readonly selectedItem = signal<FileManagerItem | null>(null);
  readonly selectedFileIds = signal<Set<string>>(new Set());
  readonly searchTerm = signal<string>('');
  readonly temporaryFolders = signal<Set<string>>(new Set()); // Track temporary folder paths

  // File viewer
  readonly fileViewerOpen = signal(false);
  readonly fileViewerUrl = signal<string>('');
  readonly fileViewerName = signal<string>('');
  readonly fileViewerSize = signal<number>(0);
  readonly fileViewerImages = signal<ImageItem[]>([]); // All images for navigation
  readonly fileViewerCurrentIndex = signal<number>(0); // Current image index

  protected readonly classes = computed(() => mergeClasses(fileManagerVariants(), this.class()));

  // Check if any files are selected
  readonly hasSelectedFiles = computed(() => {
    return this.selectedFileIds().size > 0;
  });

  // Check if all files are selected
  readonly allFilesSelected = computed(() => {
    const files = this.filteredFiles();
    return files.length > 0 && files.every(file => this.selectedFileIds().has(file.id));
  });

  // Filtered folders based on search
  readonly filteredFolders = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const folders = this.folders();
    const temporaryPaths = this.temporaryFolders();
    
    // Add temporary folders that aren't in the API response yet
    const allFolders = [...folders];
    const currentRoot = this.currentRoot();
    
    temporaryPaths.forEach(path => {
      // Only show temporary folders that match current location
      const pathParts = path.split('/');
      const folderName = pathParts[pathParts.length - 1];
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : undefined;
      
      // Check if this temporary folder should be shown in current view
      const shouldShow = 
        (currentRoot === undefined && parentPath === undefined) || // Root level
        (currentRoot === parentPath); // Same parent level
      
      if (shouldShow && !allFolders.some(f => f.id === path)) {
        allFolders.push({
          id: path,
          name: folderName,
          fileCount: 0,
          type: 'folder',
          isTemporary: true,
        });
      }
    });
    
    if (!search) return allFolders;
    return allFolders.filter(folder => folder.name.toLowerCase().includes(search));
  });

  // Filtered files based on search
  readonly filteredFiles = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const files = this.files();
    if (!search) return files;
    return files.filter(file => 
      file.name.toLowerCase().includes(search) || 
      file.extension.toLowerCase().includes(search)
    );
  });

  // Get all images from current folder files (for image viewer navigation)
  // This includes filtered images based on search term
  readonly allImages = computed<ImageItem[]>(() => {
    const files = this.filteredFiles(); // Use filtered files to respect search
    const images: ImageItem[] = [];
    
    files.forEach(file => {
      if (file.url && getFileViewerType(file.url) === 'image') {
        images.push({
          url: file.url,
          name: file.name,
          size: file.size || 0,
        });
      }
    });
    
    return images;
  });

  // Check if a specific file is selected
  isFileSelected(fileId: string): boolean {
    return this.selectedFileIds().has(fileId);
  }

  // Get file extension from filename
  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  // Get file extension color
  getExtensionColor(extension: string): string {
    const colors: Record<string, string> = {
      'jpg': 'bg-orange-500',
      'jpeg': 'bg-orange-500',
      'png': 'bg-orange-500',
      'pdf': 'bg-red-500',
      'txt': 'bg-gray-600',
      'doc': 'bg-blue-500',
      'docx': 'bg-blue-500',
      'xls': 'bg-green-500',
      'xlsx': 'bg-green-500',
    };
    return colors[extension.toLowerCase()] || 'bg-gray-500';
  }

  // Get file icon type based on extension
  getFileIconType(extension: string): 'image' | 'file-text' | 'file-spreadsheet' | 'file' {
    const ext = extension.toLowerCase();
    const iconMap: Record<string, 'image' | 'file-text' | 'file-spreadsheet' | 'file'> = {
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'webp': 'image',
      'pdf': 'file-text',
      'txt': 'file-text',
      'doc': 'file-text',
      'docx': 'file-text',
      'xls': 'file-spreadsheet',
      'xlsx': 'file-spreadsheet',
    };
    return iconMap[ext] || 'file';
  }

  // Navigate to folder
  navigateToFolder(folder: FolderItem): void {
    // Use folder.id as the root parameter
    this.currentRoot.set(folder.id);
    this.loadFileManagerData(folder.id);
  }

  // Navigate to file
  navigateToFile(file: FileItem): void {
    // If file has URL, open in viewer
    if (file.url) {
      this.openFile(file.url, file.name, file.size || 0);
    } else {
      // Otherwise, just log (in real app, would fetch URL from backend)
      console.log('Open file:', file);
    }
  }

  // Load file manager data from API
  loadFileManagerData(root?: string): void {
    this.isLoading.set(true);
    const search = this.searchTerm().trim() || undefined;
    
    this.attachmentService.getFileManagerItems(root, search)
      .pipe(
        catchError((error) => {
          console.error('Error loading file manager data:', error);
          return of({ folders: [], files: [], path: [] });
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((response) => {
        // Map API files to FileItem first (needed for counting)
        const mappedFiles: FileItem[] = response.files.map((file) => {
          const extension = this.getFileExtension(file.name);
          return {
            id: file.id,
            name: file.name,
            extension: extension,
            type: 'file' as const,
            url: file.url,
            size: file.size ? parseInt(file.size, 10) : undefined,
          };
        });

        // Map API folders to FolderItem and calculate file count
        const mappedFolders: FolderItem[] = response.folders.map((folder) => {
          // Count files that belong to this folder (matching folderId)
          const fileCount = response.files.filter(
            file => file.folderId === folder.id
          ).length;
          
          return {
            id: folder.id,
            name: folder.name,
            fileCount: fileCount,
            type: 'folder' as const,
          };
        });

        this.folders.set(mappedFolders);
        this.files.set(mappedFiles);
        this.apiPath.set(response.path);
      });
  }

  // Refresh current folder
  refresh(): void {
    this.loadFileManagerData(this.currentRoot());
  }

  // Navigate back using path
  navigateBack(): void {
    const path = this.apiPath();
    if (path.length > 1) {
      // Navigate to parent folder (second to last item in path)
      const parentFolder = path[path.length - 2];
      this.currentRoot.set(parentFolder.id);
      this.loadFileManagerData(parentFolder.id);
    } else if (path.length === 1) {
      // Navigate to root
      this.currentRoot.set(undefined);
      this.loadFileManagerData();
    } else {
      // Already at root, do nothing
      this.currentRoot.set(undefined);
      this.loadFileManagerData();
    }
  }

  // Check if can navigate back
  readonly canNavigateBack = computed(() => {
    const path = this.apiPath();
    return path.length > 0;
  });

  // Check if current folder is empty (no folders and no files)
  readonly isCurrentFolderEmpty = computed(() => {
    return this.filteredFolders().length === 0 && this.filteredFiles().length === 0 && !this.isLoading();
  });

  // Check if current folder is a temporary folder
  readonly isCurrentFolderTemporary = computed(() => {
    const currentRoot = this.currentRoot();
    return currentRoot ? this.temporaryFolders().has(currentRoot) : false;
  });

  /**
   * Check if file format is supported by viewers
   */
  isFileFormatSupported(url: string): boolean {
    const viewerType = getFileViewerType(url);
    return viewerType !== 'unknown';
  }

  /**
   * Download file
   */
  downloadFile(url: string, name: string): void {
    // Fetch the file and trigger download
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        // Fallback: open in new tab
        window.open(url, '_blank');
      });
  }

  /**
   * Open file in appropriate viewer or show unsupported format dialog
   */
  openFile(url: string, name: string, size: number): void {
    // Check if file format is supported
    if (!this.isFileFormatSupported(url)) {
      // Show modal for unsupported format
      const dialogRef = this.alertDialogService.info({
        zTitle: 'Format Not Supported',
        zDescription: `The file format "${this.getFileExtension(name).toUpperCase() || 'UNKNOWN'}" is not supported for viewing.\n\nPlease download the file to open it.`,
        zOkText: 'Download',
        zViewContainerRef: this.viewContainerRef,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.downloadFile(url, name);
        }
      });
      return;
    }

    this.fileViewerUrl.set(url);
    this.fileViewerName.set(name);
    this.fileViewerSize.set(size);
    
    // If it's an image, set up image navigation (only filtered images)
    if (getFileViewerType(url) === 'image') {
      const allImages = this.allImages(); // This already uses filteredFiles
      // Find the index of the current image
      const currentIndex = allImages.findIndex(img => img.url === url);
      this.fileViewerCurrentIndex.set(currentIndex >= 0 ? currentIndex : 0);
      this.fileViewerImages.set(allImages);
    } else {
      // For non-images, clear images array
      this.fileViewerImages.set([]);
      this.fileViewerCurrentIndex.set(0);
    }
    
    this.fileViewerOpen.set(true);
  }

  /**
   * Handle image change event from file viewer
   */
  onImageChanged(index: number): void {
    this.fileViewerCurrentIndex.set(index);
    const images = this.fileViewerImages();
    if (images && images.length > 0 && index >= 0 && index < images.length) {
      const currentImage = images[index];
      this.fileViewerUrl.set(currentImage.url);
      this.fileViewerName.set(currentImage.name);
      this.fileViewerSize.set(currentImage.size);
    }
  }

  // Go back to home
  goHome(): void {
    this.selectedItem.set(null);
    this.selectedFileIds.set(new Set());
    this.router.navigate(['/']);
  }

  // Select item (file or folder)
  selectItem(item: FileManagerItem): void {
    this.selectedItem.set(item);
  }

  // Toggle file selection
  toggleFileSelection(fileId: string, checked: boolean): void {
    const current = new Set(this.selectedFileIds());
    if (checked) {
      current.add(fileId);
    } else {
      current.delete(fileId);
    }
    this.selectedFileIds.set(current);
  }

  // Select all files
  selectAllFiles(): void {
    const files = this.filteredFiles();
    const allIds = new Set(files.map(file => file.id));
    this.selectedFileIds.set(allIds);
  }

  // Deselect all files
  deselectAllFiles(): void {
    this.selectedFileIds.set(new Set());
  }

  // Update search term
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    // Reload data with search term
    this.loadFileManagerData(this.currentRoot());
  }

  // Upload new file(s)
  uploadFile(): void {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // Allow multiple file selection
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const files = Array.from(target.files);
        this.uploadFiles(files);
      }
    };
    input.click();
  }

  /**
   * Upload multiple files to the current folder
   */
  uploadFiles(files: File[]): void {
    if (files.length === 0) {
      return;
    }

    // Get current root folder
    const root = this.currentRoot();

    this.isUploading.set(true);

    this.attachmentService.uploadFilesMultipart(files, root)
      .pipe(
        catchError((error) => {
          console.error('Error uploading files:', error);
          // Error is already handled by ApiService (toast notification)
          throw error; // Re-throw to prevent success callback
        }),
        finalize(() => {
          this.isUploading.set(false);
        })
      )
      .subscribe({
        next: () => {
          // Success - remove from temporary folders if files were uploaded to a temporary folder
          const tempFolders = new Set(this.temporaryFolders());
          if (root && tempFolders.has(root)) {
            tempFolders.delete(root);
            this.temporaryFolders.set(tempFolders);
          }
          
          // Refresh file list to show newly uploaded files
          this.refresh();
        },
        error: () => {
          // Error already handled in catchError and by ApiService
        }
      });
  }

  /**
   * Sanitize folder name to be used in path
   * Removes invalid characters and trims whitespace
   */
  private sanitizeFolderName(name: string): string {
    // Remove invalid characters for folder names
    // Allow: letters, numbers, spaces, hyphens, underscores
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Remove invalid characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Build folder path from current root and folder name
   */
  private buildFolderPath(folderName: string): string {
    const sanitizedName = this.sanitizeFolderName(folderName);
    const currentRoot = this.currentRoot();
    
    if (currentRoot) {
      // If we're in a folder, append the new folder name
      return `${currentRoot}/${sanitizedName}`;
    } else {
      // If we're at root, use folder name as root
      return sanitizedName;
    }
  }

  // Create new folder
  createNewFolder(): void {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      const sanitizedName = this.sanitizeFolderName(folderName);
      
      if (!sanitizedName) {
        this.alertDialogService.warning({
          zTitle: 'Invalid Folder Name',
          zDescription: 'Folder name contains only invalid characters. Please use letters, numbers, spaces, hyphens, or underscores.',
          zViewContainerRef: this.viewContainerRef,
        });
        return;
      }

      // Build the folder path
      const folderPath = this.buildFolderPath(sanitizedName);
      
      // Add to temporary folders set (don't navigate, just show it in the list)
      const tempFolders = new Set(this.temporaryFolders());
      tempFolders.add(folderPath);
      this.temporaryFolders.set(tempFolders);
      
      // Refresh to show the new temporary folder
      this.refresh();
    }
  }

  // Delete selected files
  deleteSelectedFiles(): void {
    const selectedIds = this.selectedFileIds();
    if (selectedIds.size > 0) {
      const dialogRef = this.alertDialogService.confirm({
        zTitle: 'Delete Files',
        zDescription: `Are you sure you want to delete ${selectedIds.size} file(s)?`,
        zOkText: 'Delete',
        zCancelText: 'Cancel',
        zOkDestructive: true,
        zViewContainerRef: this.viewContainerRef,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const fileIdsArray = Array.from(selectedIds);
          this.isDeleting.set(true);
          
          this.attachmentService.bulkDelete(fileIdsArray)
            .pipe(
              catchError((error) => {
                console.error('Error deleting files:', error);
                // Error is already handled by ApiService (toast notification)
                throw error; // Re-throw to prevent success callback
              }),
              finalize(() => {
                this.isDeleting.set(false);
              })
            )
            .subscribe({
              next: () => {
                // Success - clear selections and refresh
                this.selectedFileIds.set(new Set());
                this.refresh();
              },
              error: () => {
                // Error already handled in catchError and by ApiService
                // Keep selections so user can retry
              }
            });
        }
      });
    }
  }

  // Get current route path for breadcrumb links
  readonly currentRoutePath = computed(() => {
    return this.router.url.split('?')[0]; // Get path without query params
  });

  // Get path segments for breadcrumb from API path
  readonly pathSegments = computed(() => {
    const path = this.apiPath();
    if (path.length === 0) {
      return [{ label: 'Home', root: undefined as string | undefined }];
    }
    
    const result: Array<{ label: string; root: string | undefined }> = [{ label: 'Home', root: undefined }];
    path.forEach((item) => {
      result.push({
        label: item.name,
        root: item.id,
      });
    });
    
    return result;
  });

  // Navigate to path segment
  navigateToPath(root: string | undefined, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.currentRoot.set(root);
    this.loadFileManagerData(root);
  }

  // Initialize component
  ngOnInit(): void {
    // Load initial data
    this.loadFileManagerData();
  }
}

